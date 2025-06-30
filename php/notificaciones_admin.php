<?php
header('Content-Type: application/json');
require_once 'conexion.php';

try {
    $data = [];

    // ALERTAS DE VELOCIDAD
    $stmt = $pdo->query("
        SELECT a.id_alerta, a.velocidad_detectada, a.fecha_alerta, v.placa
        FROM alertas_velocidad a
        JOIN asignacion_rutas ar ON a.id_asignacion = ar.id_asignacion
        JOIN vehiculos v ON ar.id_vehiculo = v.id_vehiculo
        ORDER BY a.fecha_alerta DESC
        LIMIT 10
    ");
    $data['alertas'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // REPORTES
    $stmt = $pdo->query("
        SELECT r.id_reporte, u.nombre, r.tipo_reporte, r.descripcion, r.fecha_generacion
        FROM reportes r
        LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
        ORDER BY r.fecha_generacion DESC
        LIMIT 10
    ");
    $data['reportes'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // INCIDENCIAS
    $stmt = $pdo->query("
        SELECT i.id_incidencia, CONCAT(u.nombre, ' ', u.apellido) AS nombre_conductor, i.descripcion, i.estado, i.fecha_incidencia FROM incidencias i LEFT JOIN conductores c ON i.id_conductor = c.id_conductor LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario ORDER BY i.fecha_incidencia DESC LIMIT 10;
    ");
    $data['incidencias'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($data);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
