<?php
header('Content-Type: application/json');
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

// Obtener todos los conductores
if ($method === 'GET' && !isset($_GET['id'])) {
    try {
        $stmt = $pdo->query("
SELECT c.id_conductor, c.id_usuario, c.dni, c.licencia_conducir, c.fecha_vencimiento_licencia, c.telefono,
                   u.nombre, u.apellido, u.correo AS email
            FROM conductores c
            JOIN usuarios u ON c.id_usuario = u.id_usuario;
        ");
        $conductores = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($conductores);
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
            SELECT c.id_conductor, c.id_usuario, c.dni ,c.licencia_conducir, c.fecha_vencimiento_licencia, c.telefono,
                   u.nombre, u.apellido, u.correo AS email
            FROM conductores c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            WHERE c.id_conductor = ?
        ");
        $stmt->execute([$id]);
        $conductor = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($conductor) {
            echo json_encode($conductor);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Conductor no encontrado"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al buscar conductor: " . $e->getMessage()]);
    }
}

//Agregar conductor

elseif ($method === 'POST' && isset($_POST['accion']) && $_POST['accion'] === 'agregar') {

    $nombre = $_POST['nombre'] ?? '';
    $apellido = $_POST['apellido'] ?? '';
    $email = $_POST['email'] ?? '';
    $passwordPlano = $_POST['password'] ?? '';
    $tipo_usuario = $_POST['tipo_usuario'] ?? 'conductor';

    $dni = $_POST['dni'] ?? '';
    $licencia = $_POST['licencia_conducir'] ?? '';
    $fecha = $_POST['fecha_vencimiento_licencia'] ?? '';
    $telefono = $_POST['telefono'] ?? '';

    if (empty($nombre) || empty($apellido) || empty($email) || empty($passwordPlano) || empty($dni) || empty($licencia) || empty($fecha) || empty($telefono)) {
        echo json_encode(["success" => false, "error" => "Todos los campos son obligatorios"]);
        exit;
    }

    // Verificacion de si el correo ya existe
    try {
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM usuarios WHERE correo = ?");
        $stmtCheck->execute([$email]);
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
            $email,
            $passwordHash,
            'Conductor',
            'Activo' 
        ]);
        $id_usuario = $pdo->lastInsertId();

        // Insertar en conductores
        $stmtConductor = $pdo->prepare("INSERT INTO conductores (id_usuario, dni, licencia_conducir, fecha_vencimiento_licencia, telefono) VALUES (?, ?, ?, ?, ?)");
        $stmtConductor->execute([
            $id_usuario,
            $dni,
            $licencia,
            $fecha,
            $telefono
        ]);

        $pdo->commit();
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}


// Editar conductor
elseif ($method === 'POST' && $_POST['accion'] === 'editar') {
    $id_conductor = $_POST['id_conductor'] ?? '';
    $nombre = $_POST['nombre'] ?? '';
    $apellido = $_POST['apellido'] ?? '';
    $email = $_POST['email'] ?? '';
    $dni = $_POST['dni'] ?? '';
    $licencia = $_POST['licencia_conducir'] ?? '';
    $fecha = $_POST['fecha_vencimiento_licencia'] ?? '';
    $telefono = $_POST['telefono'] ?? '';

    if (empty($id_conductor) || empty($nombre) || empty($apellido) || empty($email) || empty($dni) || empty($licencia) || empty($fecha) || empty($telefono)) {
        echo json_encode(["success" => false, "error" => "Todos los campos son obligatorios para editar"]);
        exit;
    }

    try {
        $pdo->beginTransaction();
        $stmtUsuario = $pdo->prepare("SELECT id_usuario FROM conductores WHERE id_conductor = ?");
        $stmtUsuario->execute([$id_conductor]);
        $id_usuario = $stmtUsuario->fetchColumn();

        if (!$id_usuario) {
            throw new Exception("Usuario no encontrado");
        }

        // Actualizar datos en usuarios
        $stmtUpdateUser = $pdo->prepare("UPDATE usuarios SET nombre = ?, apellido = ?, correo = ? WHERE id_usuario = ?");
        $stmtUpdateUser->execute([$nombre, $apellido, $email, $id_usuario]);

        // Actualizar datos en conductores
        $stmtUpdateConductor = $pdo->prepare("UPDATE conductores SET dni = ?, licencia_conducir = ?, fecha_vencimiento_licencia = ?, telefono = ? WHERE id_conductor = ?");
        $stmtUpdateConductor->execute([$dni, $licencia, $fecha, $telefono, $id_conductor]);

        $pdo->commit();
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}


// Eliminar un conductor
elseif ($method === 'POST' && $_POST['accion'] === 'eliminar') {
    $id = $_POST['id'] ?? '';

    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("SELECT id_usuario FROM conductores WHERE id_conductor = ?");
        $stmt->execute([$id]);
        $id_usuario = $stmt->fetchColumn();

        if (!$id_usuario) {
            throw new Exception("Conductor no encontrado");
        }
        $stmtDeleteConductor = $pdo->prepare("DELETE FROM conductores WHERE id_conductor = ?");
        $stmtDeleteConductor->execute([$id]);
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
