<?php
header('Content-Type: application/json');
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET' && isset($_GET['id'])) {

        $idConductor = $_GET['id'];

        $stmt = $pdo->prepare("
SELECT 
    hv.fecha_viaje,
                v.placa,
                v.marca,
                v.modelo,
                r.origen,
                r.destino,
                r.vel_max
FROM historial_viajes hv
JOIN vehiculos v ON hv.id_vehiculo = v.id_vehiculo
JOIN rutas r ON hv.id_ruta = r.id_ruta
JOIN conductores c ON hv.id_conductor = c.id_conductor
WHERE c.id_usuario = ?
ORDER BY hv.fecha_viaje DESC;
        ");
        $stmt->execute([$idConductor]);
        $historial = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($historial);
        exit;
    }

    if ($method === 'POST') {
        $idConductor = $_POST['id_conductor'] ?? null;
        $codRuta = $_POST['cod_ruta'] ?? null;
        $fechaViaje = $_POST['fecha_viaje'] ?? null;

        if (!$idConductor) {
            http_response_code(400);
            echo json_encode(['error' => 'Falta el ID del conductor.']);
            exit;
        }

        $sql = "
            SELECT 
                hv.fecha_viaje,
                v.placa,
                v.marca,
                v.modelo,
                r.origen,
                r.destino,
                r.vel_max
            FROM historial_viajes hv
JOIN vehiculos v ON hv.id_vehiculo = v.id_vehiculo
JOIN rutas r ON hv.id_ruta = r.id_ruta
JOIN conductores c ON hv.id_conductor = c.id_conductor
WHERE c.id_usuario = ?
        ";

        $params = [$idConductor];

        if (!empty($codRuta)) {
        $sql .= " AND r.cod_ruta LIKE ?";
        $params[] = "%$codRuta%";
        }



        if (!empty($fechaViaje)) {
            $sql .= " AND hv.fecha_viaje = ?";
            $params[] = $fechaViaje;
        }

        $sql .= " ORDER BY hv.fecha_viaje DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $historial = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($historial);
        exit;
    }


    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
