<?php
header('Content-Type: application/json');
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST' && isset($_POST['accion']) && $_POST['accion'] === 'agregar') {

    $id_conductor = $_POST['id_conductor'] ?? '';
    $id_vehiculo = $_POST['id_vehiculo'] ?? '';
    $id_ruta = $_POST['id_ruta'] ?? '';
    $fecha_programada = $_POST['fecha_programada'] ?? '';

    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("INSERT INTO asignacion_rutas (id_conductor, id_vehiculo, id_ruta, fecha_programada) VALUES (?, ?, ?, ?)");
        $stmt->execute([$id_conductor, $id_vehiculo, $id_ruta, $fecha_programada]);

        $pdo->commit();
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }

} elseif ($method === 'GET' && isset($_GET['id'], $_GET['tipo'])) {

    $id = $_GET['id'];
    $tipo = $_GET['tipo'];

    if ($tipo === 'conductor') {
        $stmt = $pdo->prepare("SELECT c.*, u.nombre, u.apellido FROM conductores c INNER JOIN usuarios u ON c.id_usuario = u.id_usuario WHERE c.id_conductor = ?");
        $stmt->execute([$id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($data ?: []);
        exit;
    }

    if ($tipo === 'vehiculo') {
        $stmt = $pdo->prepare("SELECT * FROM vehiculos WHERE id_vehiculo = ?");
        $stmt->execute([$id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($data ?: []);
        exit;
    }

    if ($tipo === 'ruta') {
        $stmt = $pdo->prepare("SELECT * FROM rutas WHERE id_ruta = ?");
        $stmt->execute([$id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($data ?: []);
        exit;
    }

    echo json_encode(["error" => "Tipo no válido"]);
    exit;

} else {
    echo json_encode(["error" => "Método o parámetros no válidos"]);
    exit;
}
