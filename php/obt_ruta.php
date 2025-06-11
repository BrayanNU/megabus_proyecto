<?php
/*
header('Content-Type: application/json');
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' && isset($_GET['id_asignacion'])) {
    $idAsignacion = $_GET['id_asignacion'];

    try {
        $stmt = $pdo->prepare("
            SELECT 
                r.origen,
                r.destino,
                r.vel_max
            FROM asignacion_rutas ar
            JOIN rutas r ON ar.id_ruta = r.id_ruta
            WHERE ar.id_asignacion = ?
            LIMIT 1;
        ");
        $stmt->execute([$idAsignacion]);
        $ruta = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($ruta) {
            echo json_encode($ruta);
        } else {
            echo json_encode(["error" => "Ruta no encontrada."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Solicitud no válida. Se requiere id_asignacion por GET."]);
}
*/