<?php
session_start();
require_once 'conexion.php';

header('Content-Type: application/json');

$correo = $_POST['correo'] ?? '';
$contrasena = $_POST['contrasena'] ?? '';

if (empty($correo) || empty($contrasena)) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos.']);
    exit;
}

// buscar correo activo
$sql = "SELECT * FROM usuarios WHERE correo = :correo AND estado = 'Activo'";
$stmt = $pdo->prepare($sql);
$stmt->bindParam(':correo', $correo);
$stmt->execute();
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

// Verificar usuario
if (!$usuario) {
    echo json_encode(['success' => false, 'message' => 'Usuario no encontrado o inactivo.']);
    exit;
}

// Verificar contraseña
if (password_verify($contrasena, $usuario['contrasena'])) {
    $_SESSION['id_usuario'] = $usuario['id_usuario'];
    $_SESSION['nombre'] = $usuario['nombre'];
    $_SESSION['rol'] = $usuario['rol'];

    echo json_encode(['success' => true,'nombre' => $usuario['nombre'], 'id_usuario' => $usuario['id_usuario'], 'rol' => $usuario['rol']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Correo o contraseña incorrectos.']);
}
