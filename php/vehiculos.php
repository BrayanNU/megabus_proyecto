<?php
header('Content-Type: application/json');
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

// Obtener todos los vehiculos
if ($method === 'GET' && !isset($_GET['id'])) {
    try {
        $stmt = $pdo->query("
SELECT v.id_vehiculo, v.placa,v.marca,v.modelo,v.ano,v.tipo_bus,v.num_pasajeros,v.max_velocidad,v.kilometraje,v.ult_mantenimiento,v.estado
            FROM vehiculos v
        ");
        $vehiculos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($vehiculos);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
    }
}

// Obtener un solo vehiculo por ID
elseif ($method === 'GET' && isset($_GET['id'])) {
    $id = $_GET['id'];
    try {
        $stmt = $pdo->prepare("
    SELECT v.id_vehiculo, v.placa,v.marca,v.modelo,v.ano,v.tipo_bus,v.num_pasajeros,v.max_velocidad,v.kilometraje,v.ult_mantenimiento,v.estado
            FROM vehiculos v
            WHERE v.id_vehiculo = ?
        ");
        $stmt->execute([$id]);
        $vehiculos = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($vehiculos) {
            echo json_encode($vehiculos);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Vehiculo no encontrado"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al buscar vehiculo: " . $e->getMessage()]);
    }
}

//Agregar conductor

elseif ($method === 'POST' && isset($_POST['accion']) && $_POST['accion'] === 'agregar') {

    $placa = $_POST['placa'] ?? '';
    $marca = $_POST['marca'] ?? '';
    $modelo = $_POST['modelo'] ?? '';
    $ano = $_POST['ano'] ?? '';
    $tipo_bus = $_POST['tipo_bus'] ?? '';
    $num_pasajeros = $_POST['num_pasajeros'] ?? '';
    $max_velocidad = $_POST['max_velocidad'] ?? '';
    $kilometraje = $_POST['kilometraje'] ?? '';
    $ult_mantenimiento = $_POST['ult_mantenimiento'] ?? '';
    $estado = $_POST['estado'] ?? '';


    if (empty($placa) || empty($marca) || empty($modelo) || empty($ano) ||
    empty($tipo_bus) || empty($num_pasajeros) || empty($max_velocidad) || empty($kilometraje) ||
    empty($ult_mantenimiento) || empty($estado)) {
        echo json_encode(["success" => false, "error" => "Todos los campos son obligatorios"]);
        exit;
    }

    // Verificacion de si el correo ya existe
    try {
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM vehiculos WHERE placa = ?");
        $stmtCheck->execute([$placa]);
        $existe = $stmtCheck->fetchColumn();

        if ($existe > 0) {
            echo json_encode(["success" => false, "error" => "El vehiculo ya está registrado"]);
            exit;
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => "Error al verificar el vehiculo: " . $e->getMessage()]);
        exit;
    }


    try {
        $pdo->beginTransaction();

        // Insertar en vehiculos
        $stmtVehiculo = $pdo->prepare("INSERT INTO vehiculos (placa, marca, modelo, ano, tipo_bus, num_pasajeros, max_velocidad,kilometraje,ult_mantenimiento, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtVehiculo->execute([
            $placa,
            $marca,
            $modelo, 
            $ano, 
            $tipo_bus, 
            $num_pasajeros, 
            $max_velocidad, 
            $kilometraje, 
            $ult_mantenimiento, 
            $estado
        ]);

        $pdo->commit();
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}


// Editar conductor
elseif ($method === 'POST' && $_POST['accion'] === 'editar') {
    $id_vehiculo = $_POST['id_vehiculo'] ?? '';
    $placa = $_POST['placa'] ?? '';
    $marca = $_POST['marca'] ?? '';
    $modelo = $_POST['modelo'] ?? '';
    $ano = $_POST['ano'] ?? '';
    $tipo_bus = $_POST['tipo_bus'] ?? '';
    $num_pasajeros = $_POST['num_pasajeros'] ?? '';
    $max_velocidad = $_POST['max_velocidad'] ?? '';
    $kilometraje = $_POST['kilometraje'] ?? '';
    $ult_mantenimiento = $_POST['ult_mantenimiento'] ?? '';
    $estado = $_POST['estado'] ?? '';

    if (empty($placa) || empty($marca) || empty($modelo) || empty($ano) || empty($tipo_bus) || empty($num_pasajeros) || empty($max_velocidad) || empty($kilometraje) ||empty($ult_mantenimiento) || empty($estado)) {
        echo json_encode(["success" => false, "error" => "Todos los campos son obligatorios para editar"]);
        exit;
    }

    try {
        $pdo->beginTransaction();
        $stmtVehiculo = $pdo->prepare("SELECT id_vehiculo FROM vehiculos WHERE id_vehiculo = ?");
        $stmtVehiculo->execute([$id_vehiculo]);
        $id_vehiculo = $stmtVehiculo->fetchColumn();

        if (!$id_vehiculo) {
            throw new Exception("Vehiculo no encontrado");
        }

        // Actualizar datos en vehiculos
        $stmtUpdateVehiculo = $pdo->prepare("UPDATE vehiculos SET placa = ?, marca = ?, modelo = ?, ano = ?, tipo_bus = ?, num_pasajeros = ?, max_velocidad = ?, kilometraje = ?, ult_mantenimiento = ?, estado = ? WHERE id_vehiculo = ?");
        $stmtUpdateVehiculo->execute([$placa, $marca, $modelo, $ano, $tipo_bus, $num_pasajeros, $max_velocidad, $kilometraje, $ult_mantenimiento, $estado, $id_vehiculo]);

        $pdo->commit();
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}



// Eliminar un vehiculo 
elseif ($method === 'POST' && $_POST['accion'] === 'eliminar') {
    $id = $_POST['id'] ?? '';

    try {
        $pdo->beginTransaction();

        // Verificar si el vehículo existe
        $stmt = $pdo->prepare("SELECT id_vehiculo FROM vehiculos WHERE id_vehiculo = ?");
        $stmt->execute([$id]);
        $id_vehiculo = $stmt->fetchColumn();

        if (!$id_vehiculo) {
            throw new Exception("Vehículo no encontrado");
        }

        // Intentar eliminar el vehículo
        $stmtDelete = $pdo->prepare("DELETE FROM vehiculos WHERE id_vehiculo = ?");
        $stmtDelete->execute([$id]);

        $pdo->commit();
        echo json_encode(["success" => true]);

    } catch (PDOException $e) {
        $pdo->rollBack();

        // Detectar error de integridad referencial (vehículo en uso)
        if (strpos($e->getMessage(), 'a foreign key constraint fails') !== false) {
            echo json_encode([
                "success" => false,
                "error" => "No se puede eliminar el vehículo porque está siendo utilizado actualmente en otro registro."
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "error" => "Error al eliminar vehículo: " . $e->getMessage()
            ]);
        }
    }
}

?>
