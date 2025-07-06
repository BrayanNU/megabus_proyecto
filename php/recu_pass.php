<?php
header('Content-Type: application/json');
require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['accion'] === 'confirmar') {
    $dni = $_POST['dni'] ?? '';
    $nombre = $_POST['nombre'] ?? '';
    $apellido = $_POST['apellido'] ?? '';
    $licencia = $_POST['licencia_conducir'] ?? '';
    $telefono = $_POST['telefono'] ?? '';
    $nuevaPassword = $_POST['password'] ?? '';

    try {

        $stmt = $pdo->prepare("SELECT c.id_conductor, u.id_usuario 
            FROM conductores c 
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            WHERE c.dni = ? AND u.nombre = ? AND u.apellido = ? AND c.licencia_conducir = ? AND c.telefono = ?");
        $stmt->execute([$dni, $nombre, $apellido, $licencia, $telefono]);

        $datos = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$datos) {
            throw new Exception("Datos no coinciden con ningún conductor registrado.");
        }

        $id_usuario = $datos['id_usuario'];


        $stmtUpdate = $pdo->prepare("UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?");
        $nuevaPasswordHash = password_hash($nuevaPassword, PASSWORD_DEFAULT);
        $stmtUpdate->execute([$nuevaPasswordHash, $id_usuario]);


        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>