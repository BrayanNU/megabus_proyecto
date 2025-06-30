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
    $consulta = $pdo->prepare("
        SELECT r.vel_max 
        FROM rutas r
        INNER JOIN asignacion_rutas ar ON ar.id_ruta = r.id_ruta
        WHERE ar.id_asignacion = ?
    ");
    $consulta->execute([$id_asignacion]);
    $ruta = $consulta->fetch(PDO::FETCH_ASSOC);

    if ($ruta && $velocidad > floatval($ruta['vel_max'])) {
        // Para evitar alertas duplicadas, podrías verificar si ya se insertó en los últimos X segundos
        $verificar = $pdo->prepare("
            SELECT 1 FROM alertas_velocidad 
            WHERE id_asignacion = ? 
            AND fecha_alerta >= NOW() - INTERVAL 10 SECOND
        ");
        $verificar->execute([$id_asignacion]);

        if (!$verificar->fetch()) {
            $insert = $pdo->prepare("INSERT INTO alertas_velocidad (id_asignacion, velocidad_detectada, fecha_alerta) VALUES (?, ?, NOW())");
            $insert->execute([$id_asignacion, $velocidad]);
        }
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
