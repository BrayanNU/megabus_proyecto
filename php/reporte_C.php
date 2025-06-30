<?php
header('Content-Type: application/json');
require_once 'conexion.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Obtener nombre de la ruta por id_asignacion (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['accion'] === 'obtenerNombreRuta') {
    $id_asignacion = $_GET['id_asignacion'] ?? '';

    if (empty($id_asignacion)) {
        echo json_encode(["success" => false, "error" => "ID de asignación no recibido."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            SELECT r.cod_ruta
            FROM asignacion_rutas a
            JOIN rutas r ON a.id_ruta = r.id_ruta
            WHERE a.id_asignacion = ?
        ");
        $stmt->execute([$id_asignacion]);
        $nombre = $stmt->fetchColumn();

        if ($nombre) {
            echo json_encode(["success" => true, "nombre_ruta" => $nombre]);
        } else {
            echo json_encode(["success" => false, "error" => "Ruta no encontrada."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
    exit;
}

// Agregar nuevo reporte (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['accion'] === 'agregar') {
    $id_usuario = $_POST['id_usuario'] ?? '';
    $id_asignacion = $_POST['id_asignacion'] ?? '';
    $tipo_reporte = $_POST['tipo_reporte'] ?? '';
    $descripcion = $_POST['descripcion'] ?? '';
    $fecha_generacion = date('Y-m-d H:i:s');

    if (empty($id_usuario) || empty($id_asignacion) || empty($tipo_reporte) || empty($descripcion)) {
        echo json_encode(["success" => false, "error" => "Faltan campos obligatorios."]);
        exit;
    }

    // Manejo de la imagen
    $foto_nombre = '';
    if (!empty($_FILES['foto']['name'])) {
        $foto_tmp = $_FILES['foto']['tmp_name'];
        $foto_nombre = uniqid() . '_' . basename($_FILES['foto']['name']);
        $foto_ruta = __DIR__ . '/../uploads/' . $foto_nombre;

        if (!move_uploaded_file($foto_tmp, $foto_ruta)) {
            echo json_encode(["success" => false, "error" => "Error al subir la imagen."]);
            exit;
        }
    }

    try {
        // Iniciar transacción
        $pdo->beginTransaction();

        // 1. Insertar el reporte
        $stmt = $pdo->prepare("
            INSERT INTO reportes (id_usuario, id_asignacion_ruta, tipo_reporte, descripcion, foto, fecha_generacion)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$id_usuario, $id_asignacion, $tipo_reporte, $descripcion, $foto_nombre, $fecha_generacion]);

        // 2. Cambiar estado de la asignación a 'Finalizada'
        $stmtUpdate = $pdo->prepare("
            UPDATE asignacion_rutas 
            SET estado_ruta_asig = 'Finalizada' 
            WHERE id_asignacion = ?
        ");
        $stmtUpdate->execute([$id_asignacion]);

        // Confirmar cambios
        $pdo->commit();

        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        $pdo->rollBack(); // Revertir si algo falla
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
