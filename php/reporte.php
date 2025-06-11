<?php
header('Content-Type: application/json');
require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['tipo'])) {
    $tipo = $_GET['tipo'];

    try {
        $stmt = $pdo->prepare("SELECT 
          reportes.id_reporte,
          CONCAT(usuarios.nombre, ' ', usuarios.apellido) AS nombre,
          reportes.tipo_reporte,
          reportes.descripcion,
          reportes.foto,
          reportes.fecha_generacion
        FROM reportes
        INNER JOIN usuarios ON reportes.id_usuario = usuarios.id_usuario
        WHERE reportes.tipo_reporte = ?
");
        $stmt->execute([$tipo]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($data);
    } catch (PDOException $e) {
        echo json_encode(["error" => "Error al obtener reportes: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "Parámetro 'tipo' faltante o método incorrecto."]);
}
