<?php
header('Content-Type: application/json');
require_once 'conexion.php';

try {
    if (!isset($_GET['id_usuario'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Falta el ID del usuario.']);
        exit;
    }

    $idUsuario = $_GET['id_usuario'];

    // Obtener el ID del conductor desde el ID de usuario
    $stmt = $pdo->prepare("SELECT id_conductor FROM conductores WHERE id_usuario = ?");
    $stmt->execute([$idUsuario]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Conductor no encontrado']);
        exit;
    }

    $idConductor = $row['id_conductor'];
    $data = [];

    // ALERTAS DE VELOCIDAD para conductor
    $stmt = $pdo->prepare("
        SELECT a.id_alerta, a.velocidad_detectada, a.fecha_alerta, v.placa
        FROM alertas_velocidad a
        JOIN asignacion_rutas ar ON a.id_asignacion = ar.id_asignacion
        JOIN vehiculos v ON ar.id_vehiculo = v.id_vehiculo
        WHERE ar.id_conductor = ?
        ORDER BY a.fecha_alerta DESC
        LIMIT 10
    ");
    $stmt->execute([$idConductor]);
    $data['alertas'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // INCIDENCIAS propias
    $stmt = $pdo->prepare("
        SELECT descripcion, estado, fecha_incidencia
        FROM incidencias
        WHERE id_conductor = ?
        ORDER BY fecha_incidencia DESC
        LIMIT 10
    ");
    $stmt->execute([$idConductor]);
    $data['incidencias'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($data);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
