<?php
header('Content-Type: application/json');
require_once 'conexion.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['accion'] === 'agregar') {
    $id_usuario = $_POST['id_usuario'] ?? '';
    $tipo_reporte = $_POST['tipo_reporte'] ?? '';
    $descripcion = $_POST['descripcion'] ?? '';
    $fecha_generacion = date('Y-m-d H:i:s');

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
        $stmt = $pdo->prepare("INSERT INTO reportes (id_usuario, tipo_reporte, descripcion, foto, fecha_generacion)
                               VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$id_usuario, $tipo_reporte, $descripcion, $foto_nombre, $fecha_generacion]);

        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
