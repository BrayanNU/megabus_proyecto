<?php
header('Content-Type: application/json');
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' && isset($_GET['id'])) {
    $id = $_GET['id'];
    try {
        $stmt = $pdo->prepare("
            SELECT 
                ar.id_asignacion,
                ar.fecha_programada,
                v.placa,
                v.marca,
                v.modelo,
                r.origen,
                r.destino,
                r.vel_max,
                u.nombre AS nombre_conductor
            FROM asignacion_rutas ar
            JOIN vehiculos v ON ar.id_vehiculo = v.id_vehiculo
            JOIN rutas r ON ar.id_ruta = r.id_ruta
            JOIN conductores c ON ar.id_conductor = c.id_conductor
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            WHERE u.id_usuario = ?
            AND ar.estado_ruta_asig = 'No iniciada';
        ");
        $stmt->execute([$id]);
        $rutas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($rutas);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al buscar Ruta del conductor: " . $e->getMessage()]);
    }
}elseif ($method === 'POST' && $_POST['accion'] === 'comenzar') {
    $idAsignacion = $_POST['id_asignacion'] ?? null;

    if (!$idAsignacion) {
        echo json_encode(["success" => false, "error" => "ID de asignación no recibido."]);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Actualizar el estado de la asignación de ruta
        $stmtUpdate = $pdo->prepare("UPDATE asignacion_rutas SET estado_ruta_asig = 'En ejecucion' WHERE id_asignacion = ?");
        $stmtUpdate->execute([$idAsignacion]);

        $pdo->commit();
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}