<?php
echo "🛠 Ejecutando desde: " . __FILE__;
exit;


$host = 'localhost';
$dbname = 'parking_proyecto';
$username = 'root';
$password = ''; 
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
error_log("Conectando a la base de datos: $dbname");

?>
