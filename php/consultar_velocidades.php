<?php
header('Content-Type: application/json');
require_once 'conexion.php';

try {
    $stmt = $pdo->query("
        SELECT 
        ar.id_asignacion,
        u.nombre AS nombre_conductor,
        u.apellido AS apellido_conductor,
        v.placa,
        r.cod_ruta,
        r.vel_max,
        ar.velocidad_actual,
        ar.estado_ruta_asig,
        ar.fecha_programada
    FROM asignacion_rutas ar
    INNER JOIN conductores c ON ar.id_conductor = c.id_conductor
    INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
    INNER JOIN vehiculos v ON ar.id_vehiculo = v.id_vehiculo
    INNER JOIN rutas r ON ar.id_ruta = r.id_ruta
    WHERE ar.estado_ruta_asig = 'En ejecucion'
    ");

    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($resultados);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al consultar velocidades: ' . $e->getMessage()]);
}
?>
