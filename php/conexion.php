<?php
// conexion.php

$host = 'localhost';
$dbname = 'megabus_proyecto';
$username = 'root';
$password = ''; // (si tu XAMPP no tiene contraseña)

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    // Configuración para mostrar errores de PDO (útil en desarrollo)
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
?>
