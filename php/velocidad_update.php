<?php
header('Content-Type: application/json');
require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);
$id_asignacion = $data['id_asignacion'] ?? '';
$velocidad = $data['velocidad'] ?? '';

if (!$id_asignacion || !$velocidad) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

try {
    // Solo actualiza la velocidad actual
    $stmt = $pdo->prepare("UPDATE asignacion_rutas SET velocidad_actual = ? WHERE id_asignacion = ?");
    $stmt->execute([$velocidad, $id_asignacion]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
