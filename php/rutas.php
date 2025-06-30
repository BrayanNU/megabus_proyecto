<?php
header('Content-Type: application/json');
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

// Obtener TODAS las rutas
if ($method === 'GET' && !isset($_GET['id'])) {
    try {
        $stmt = $pdo->query("SELECT id_ruta, cod_ruta, origen, destino, vel_max, estado FROM rutas");
        $rutas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rutas);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
    }
}

// Obtener UNA ruta por ID
elseif ($method === 'GET' && isset($_GET['id'])) {
    $id = $_GET['id'];
    try {
        $stmt = $pdo->prepare("SELECT id_ruta, cod_ruta, origen, destino, vel_max, estado FROM rutas WHERE id_ruta = ?");
        $stmt->execute([$id]);
        $ruta = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($ruta) {
            echo json_encode($ruta);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Ruta no encontrada"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al obtener la ruta: " . $e->getMessage()]);
    }
}

// AGREGAR una ruta
elseif ($method === 'POST' && $_POST['accion'] === 'agregar') {
    $cod_ruta = trim($_POST['cod_ruta'] ?? '');
    $origen = trim($_POST['origen'] ?? '');
    $destino = trim($_POST['destino'] ?? '');
    $vel_max = trim($_POST['vel_max'] ?? '');
    $estado = trim($_POST['estado'] ?? '');

    // Validación básica
    if (!$cod_ruta || !$origen || !$destino || !$vel_max || !$estado) {
        echo json_encode(["success" => false, "error" => "Todos los campos son obligatorios"]);
        exit;
    }

    try {
        // Verificar si ya existe la ruta
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM rutas WHERE cod_ruta = ?");
        $stmt->execute([$cod_ruta]);

        if ($stmt->fetchColumn() > 0) {
            echo json_encode(["success" => false, "error" => "La ruta ya está registrada"]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO rutas (cod_ruta, origen, destino, vel_max, estado) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$cod_ruta, $origen, $destino, $vel_max, $estado]);

        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => "Error al agregar ruta: " . $e->getMessage()]);
    }
}

// EDITAR ruta
elseif ($method === 'POST' && $_POST['accion'] === 'editar') {
    $id_ruta = $_POST['id_ruta'] ?? '';
    $cod_ruta = trim($_POST['cod_ruta'] ?? '');
    $origen = trim($_POST['origen'] ?? '');
    $destino = trim($_POST['destino'] ?? '');
    $vel_max = trim($_POST['vel_max'] ?? '');
    $estado = trim($_POST['estado'] ?? '');

    if (!$id_ruta || !$cod_ruta || !$origen || !$destino || !$vel_max || !$estado) {
        echo json_encode(["success" => false, "error" => "Todos los campos son obligatorios para editar"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT id_ruta FROM rutas WHERE id_ruta = ?");
        $stmt->execute([$id_ruta]);
        if (!$stmt->fetchColumn()) {
            echo json_encode(["success" => false, "error" => "Ruta no encontrada"]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE rutas SET cod_ruta = ?, origen = ?, destino = ?, vel_max = ?, estado = ? WHERE id_ruta = ?");
        $stmt->execute([$cod_ruta, $origen, $destino, $vel_max, $estado, $id_ruta]);

        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => "Error al editar ruta: " . $e->getMessage()]);
    }
}

// ELIMINAR ruta
elseif ($method === 'POST' && $_POST['accion'] === 'eliminar') {
    $id = $_POST['id'] ?? '';

    try {
        $stmt = $pdo->prepare("SELECT id_ruta FROM rutas WHERE id_ruta = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetchColumn()) {
            echo json_encode(["success" => false, "error" => "Ruta no encontrada"]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM rutas WHERE id_ruta = ?");
        $stmt->execute([$id]);

        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => "Error al eliminar ruta: " . $e->getMessage()]);
    }
}
?>
