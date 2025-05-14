<?php
echo "Servidor funcionando";



$password = "12345";
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

echo "Contraseña original: " . $password . "\n";
echo "Contraseña encriptada: " . $hashedPassword . "\n";
?>
