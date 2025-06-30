<?php
header('Content-Type: application/json');
require_once 'conexion.php';

$resultadoFinal = [];

try {
    // 1. Vehículos activos
    $stmt = $pdo->query("SELECT COUNT(*) AS totalVehiculosActivos FROM vehiculos WHERE estado = 'Activo'");
    $resultadoFinal['vehiculosActivos'] = $stmt->fetch(PDO::FETCH_ASSOC)['totalVehiculosActivos'];

    // 2. Conductores activos
    $stmt = $pdo->query("SELECT COUNT(*) AS totalConductores FROM conductores INNER JOIN usuarios ON conductores.id_usuario = usuarios.id_usuario WHERE usuarios.estado = 'Activo'");
    $resultadoFinal['conductoresActivos'] = $stmt->fetch(PDO::FETCH_ASSOC)['totalConductores'];

    // 3. Alertas de velocidad registradas hoy
    $stmt = $pdo->query("SELECT COUNT(*) AS alertasHoy FROM alertas_velocidad WHERE DATE(fecha_alerta) = CURDATE()");
    $resultadoFinal['alertasHoy'] = $stmt->fetch(PDO::FETCH_ASSOC)['alertasHoy'];

    // 4. Viajes completados hoy
    $stmt = $pdo->query("SELECT COUNT(*) AS viajesHoy FROM historial_viajes WHERE DATE(fecha_viaje) = CURDATE()");
    $resultadoFinal['viajesHoy'] = $stmt->fetch(PDO::FETCH_ASSOC)['viajesHoy'];

    // 5. Vehículos en mantenimiento
    $stmt = $pdo->query("SELECT COUNT(*) AS totalMantenimiento FROM vehiculos WHERE estado = 'Mantenimiento'");
    $resultadoFinal['vehiculosMantenimiento'] = $stmt->fetch(PDO::FETCH_ASSOC)['totalMantenimiento'];

    // 6. Estado de vehículos (para gráfico de anillo)
    $stmt = $pdo->query("SELECT estado, COUNT(*) AS total FROM vehiculos GROUP BY estado");
    $resultadoFinal['estadoVehiculos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 7. Tipos de incidencias (para gráfico de anillo)
    $stmt = $pdo->query("SELECT estado AS tipo, COUNT(*) AS total FROM incidencias GROUP BY estado");
    $resultadoFinal['tiposIncidencias'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 8. Alertas por vehículo (últimos 7 días)
    $stmt = $pdo->query("
        SELECT vehiculos.placa, COUNT(*) AS total_alertas
        FROM alertas_velocidad 
        INNER JOIN asignacion_rutas ON alertas_velocidad.id_asignacion = asignacion_rutas.id_asignacion
        INNER JOIN vehiculos ON asignacion_rutas.id_vehiculo = vehiculos.id_vehiculo
        WHERE fecha_alerta >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY vehiculos.placa
        ORDER BY total_alertas DESC
        LIMIT 10;
    ");
    $resultadoFinal['alertasPorVehiculo'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 9. Viajes por día (últimos 7 días para gráfico de línea)
    $stmt = $pdo->query("
        SELECT COUNT(*) AS total_viajes_mes
        FROM historial_viajes
        WHERE MONTH(fecha_viaje) = MONTH(CURDATE())
        AND YEAR(fecha_viaje) = YEAR(CURDATE())
    ");
    $resultadoFinal['viajesMes'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_viajes_mes'];

    // 10. Últimas 3 notificaciones
    $stmt = $pdo->query("
        SELECT CONCAT('🔔 Exceso de velocidad: ', velocidad_detectada, ' km/h el ', DATE_FORMAT(fecha_alerta, '%d/%m/%Y %H:%i')) AS mensaje
        FROM alertas_velocidad
        ORDER BY fecha_alerta DESC
        LIMIT 3
    ");
    $resultadoFinal['notificaciones'] = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // 11. Viajes por día (últimos 7 días para gráfico de línea)
    $stmt = $pdo->query("
        SELECT DATE(fecha_viaje) AS dia, COUNT(*) AS total_viajes
        FROM historial_viajes
        WHERE fecha_viaje >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(fecha_viaje)
        ORDER BY dia
    ");
    $resultadoFinal['viajesPorDia'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 12. Historial reciente de viajes (últimos 5 viajes)
    $stmt = $pdo->query("
        SELECT v.placa AS vehiculo, r.cod_ruta AS ruta, DATE_FORMAT(hv.fecha_viaje, '%d/%m/%Y %H:%i') AS fecha
        FROM historial_viajes hv
        INNER JOIN asignacion_rutas ar ON hv.id_asignacion_ruta = ar.id_asignacion
        INNER JOIN vehiculos v ON ar.id_vehiculo = v.id_vehiculo
        INNER JOIN rutas r ON ar.id_ruta = r.id_ruta
        ORDER BY hv.fecha_viaje DESC
        LIMIT 5;
    ");
    $resultadoFinal['historialReciente'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($resultadoFinal);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
}
?>
