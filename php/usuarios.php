<?php
header('Content-Type: application/json');
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

// Obtener todos los usuarios
if ($method === 'GET' && !isset($_GET['id'])) {
    try {
        $stmt = $pdo->query("
SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.contrasena, u.rol, u.estado
FROM usuarios u;
        ");
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($usuarios);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
    }
}

// Obtener un solo conductor por ID
elseif ($method === 'GET' && isset($_GET['id'])) {
    $id = $_GET['id'];
    try {
        $stmt = $pdo->prepare("
SELECT u.id_usuario, u.nombre, u.apellido, u.correo , u.contrasena, u.rol, u.estado
            FROM usuarios u
            WHERE u.id_usuario = ?
        ");
        $stmt->execute([$id]);
        $usuarios = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuarios) {
            error_log("Usuario encontrado: " . print_r($usuarios, true));

            echo json_encode($usuarios);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "usuario no encontrado"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al buscar usuario: " . $e->getMessage()]);
    }
}

//Agregar conductor

elseif ($method === 'POST' && isset($_POST['accion']) && $_POST['accion'] === 'agregar') {

    $nombre = $_POST['nombre'] ?? '';
    $apellido = $_POST['apellido'] ?? '';
    $correo = $_POST['correo'] ?? '';
    $passwordPlano = $_POST['contrasena'] ?? '';
    $rol = $_POST['rol'] ?? '';
    $estado = $_POST['estado'] ?? '';

    if (empty($nombre) || empty($apellido) || empty($correo) || empty($passwordPlano) || empty($rol) || empty($estado)) {
        echo json_encode(["success" => false, "error" => "Todos los campos son obligatorios"]);
        exit;
    }

    // Verificacion de si el correo ya existe
    try {
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE correo = ?");
        $stmtCheck->execute([$correo]);
        $existe = $stmtCheck->fetchColumn();

        if ($existe > 0) {
            echo json_encode(["success" => false, "error" => "El correo ya está registrado"]);
            exit;
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => "Error al verificar el correo: " . $e->getMessage()]);
        exit;
    }

    // Encriptacion de la contraseña
    $passwordHash = password_hash($passwordPlano, PASSWORD_DEFAULT);

    try {
        $pdo->beginTransaction();

        // Insertar en usuarios
        $stmtUsuario = $pdo->prepare("INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol, estado) VALUES (?, ?, ?, ?, ?, ?)");
        $stmtUsuario->execute([
            $nombre,
            $apellido,
            $correo,
            $passwordHash,
            $rol,
            $estado 
        ]);
        $id_usuario = $pdo->lastInsertId();

        $pdo->commit();
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}


// Editar conductor
elseif ($method === 'POST' && $_POST['accion'] === 'editar') {


    $id_usuario = $_POST['id_usuario'] ?? '';
    $nombre = $_POST['nombre'] ?? '';
    $apellido = $_POST['apellido'] ?? '';
    $correo = $_POST['correo'] ?? '';
    $passwordPlano = $_POST['contrasena'] ?? '';
    $rol = $_POST['rol'] ?? '';
    $estado = $_POST['estado'] ?? '';

    

    if (empty($id_usuario) || empty($nombre) || empty($apellido) || empty($correo) || empty($passwordPlano) || empty($rol) || empty($estado)) {
        echo json_encode(["success" => false, "error" => "Todos los campos son obligatorios para editar"]);
        exit;
    }
    $passwordHash = password_hash($passwordPlano, PASSWORD_DEFAULT);
    try {
        $pdo->beginTransaction();
        $stmtUsuario = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE id_usuario = ?");
        $stmtUsuario->execute([$id_usuario]);
        $id_usuario = $stmtUsuario->fetchColumn();

        if (!$id_usuario) {
            throw new Exception("Usuario no encontrado");
        }

        // Actualizar datos en usuarios
        $stmtUpdateUser = $pdo->prepare("UPDATE usuarios SET nombre = ?, apellido = ?, correo = ?, contrasena = ?, rol = ?, estado= ? WHERE id_usuario = ?");
        $stmtUpdateUser->execute([$nombre, $apellido, $correo,$passwordHash, $rol, $estado, $id_usuario]);

        $pdo->commit();
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}


// Eliminar un usuario

if ($method === 'POST' && $_POST['accion'] === 'eliminar') {
    $id = $_POST['id'] ?? '';

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE id_usuario = ?");
        $stmt->execute([$id]);
        $id_usuario = $stmt->fetchColumn();

        if (!$id_usuario) {
            throw new Exception("Usuario no encontrado");
        }

        $stmtDeleteConductor = $pdo->prepare("DELETE FROM conductores WHERE id_usuario = ?");
        $stmtDeleteConductor->execute([$id_usuario]);

        $stmtDeleteUsuario = $pdo->prepare("DELETE FROM usuarios WHERE id_usuario = ?");
        $stmtDeleteUsuario->execute([$id_usuario]);

        $pdo->commit();
        echo json_encode(["success" => true]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>
