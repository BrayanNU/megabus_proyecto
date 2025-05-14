<?php
session_start();
require_once 'conexion.php';

header('Content-Type: application/json');

$correo = filter_var($_POST['correo'] ?? '', FILTER_SANITIZE_EMAIL);
$contrasena = $_POST['contrasena'] ?? '';

if (!$correo || !$contrasena) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos.']);
    exit;
}

$sql = "SELECT * FROM usuarios WHERE correo = :correo AND estado = 'Activo'";
$stmt = $pdo->prepare($sql);
$stmt->bindParam(':correo', $correo);
$stmt->execute();
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);
// Validar si hay un error con la conexión a la base de datos
if (!$usuario) {
    echo json_encode(['success' => false, 'message' => 'Error al obtener los datos del usuario.']);
    exit;
}

if ($usuario && password_verify($contrasena, $usuario['contrasena'])) {
    $_SESSION['id_usuario'] = $usuario['id_usuario'];
    $_SESSION['nombre'] = $usuario['nombre'];
    $_SESSION['rol'] = $usuario['rol'];

    echo json_encode(['success' => true, 'rol' => $usuario['rol']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Correo o contraseña incorrectos.']);
}
