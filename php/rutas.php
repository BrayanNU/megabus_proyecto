<?php
header('Content-Type: application/json');
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

// Obtener todos las rutas
if ($method === 'GET' && !isset($_GET['id'])) {
    try {
        $stmt = $pdo->query("
SELECT r.id_ruta,r.cod_ruta,r.origen,r.destino,r.vel_max, r.estado
            FROM rutas r
        ");
        $rutas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rutas);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
    }
}

// Obtener un sola ruta por ID
elseif ($method === 'GET' && isset($_GET['id'])) {
    $id = $_GET['id'];
    try {
        $stmt = $pdo->prepare("
SELECT r.id_ruta,r.cod_ruta,r.origen,r.destino,r.vel_max, r.estado
            FROM rutas r
            WHERE r.id_ruta = ?
        ");
        $stmt->execute([$id]);
        $rutas = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($rutas) {
            echo json_encode($rutas);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Ruta no encontrado"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al buscar Ruta: " . $e->getMessage()]);
    }
}

//Agregar ruta

elseif ($method === 'POST' && isset($_POST['accion']) && $_POST['accion'] === 'agregar') {

    $cod_ruta = $_POST['cod_ruta'] ?? '';
    $origen = $_POST['origen'] ?? '';
    $destino = $_POST['destino'] ?? '';
    $vel_max = $_POST['vel_max'] ?? '';
    $estado = $_POST['estado'] ?? '';


    if (empty($cod_ruta) || empty($origen) || empty($destino) || empty($vel_max) || empty($estado)) {
        echo json_encode(["success" => false, "error" => "Todos los campos son obligatorios"]);
        exit;
    }

    // Verificacion de si el correo ya existe
    try {
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM rutas WHERE cod_ruta = ?");
        $stmtCheck->execute([$cod_ruta]);
        $existe = $stmtCheck->fetchColumn();

        if ($existe > 0) {
            echo json_encode(["success" => false, "error" => "La ruta ya está registrada"]);
            exit;
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => "Error al verificar la ruta: " . $e->getMessage()]);
        exit;
    }


    try {
        $pdo->beginTransaction();

        // Insertar en rutas
        $stmtRuta = $pdo->prepare("INSERT INTO rutas (cod_ruta, origen, destino, vel_max, estado) VALUES (?, ?, ?, ?, ?)");
        $stmtRuta->execute([
            $cod_ruta,
            $origen,
            $destino, 
            $vel_max, 
            $estado
        ]);

        $pdo->commit();
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}


// Editar ruta
elseif ($method === 'POST' && $_POST['accion'] === 'editar') {
    $id_ruta = $_POST['id_ruta'] ?? '';
    $cod_ruta = $_POST['cod_ruta'] ?? '';
    $origen = $_POST['origen'] ?? '';
    $destino = $_POST['destino'] ?? '';
    $vel_max = $_POST['vel_max'] ?? '';
    $estado = $_POST['estado'] ?? '';

    if (empty($cod_ruta) || empty($origen) || empty($destino) || empty($vel_max) || empty($estado)) {
        echo json_encode(["success" => false, "error" => "Todos los campos son obligatorios para editar"]);
        exit;
    }

    try {
        $pdo->beginTransaction();
        $stmtRuta = $pdo->prepare("SELECT id_ruta FROM rutas WHERE id_ruta = ?");
        $stmtRuta->execute([$id_ruta]);
        $id_ruta = $stmtRuta->fetchColumn();

        if (!$id_ruta) {
            throw new Exception("Ruta no encontrado");
        }

        // Actualizar datos en rutas
        $stmtUpdateVehiculo = $pdo->prepare("UPDATE rutas SET cod_ruta = ?, origen = ?, destino = ?, vel_max = ?, estado = ? WHERE id_ruta = ?");
        $stmtUpdateVehiculo->execute([$cod_ruta, $origen, $destino, $vel_max, $estado, $id_ruta]);

        $pdo->commit();
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}


// Eliminar Ruta
elseif ($method === 'POST' && $_POST['accion'] === 'eliminar') {
    $id = $_POST['id'] ?? '';

    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("SELECT id_ruta FROM rutas WHERE id_ruta = ?");
        $stmt->execute([$id]);
        $id_ruta = $stmt->fetchColumn();

        if (!$id_ruta) {
            throw new Exception("Ruta no encontrado");
        }
        $stmtDeleteConductor = $pdo->prepare("DELETE FROM rutas WHERE id_ruta = ?");
        $stmtDeleteConductor->execute([$id]);
        $pdo->commit();

        echo json_encode(["success" => true]);

    } catch (PDOException $e) {

        $pdo->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>
