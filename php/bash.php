<?php
// hash_password.php

// Contraseña a encriptar
$plainPassword = 'admin123';

// Generar el hash usando el algoritmo por defecto (bcrypt)
$hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);

// Mostrar resultado
echo "Contraseña original: $plainPassword\n";
echo "Hash generado: $hashedPassword\n";
