<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 🔐 API TOKEN
define('API_KEY', 'SuperSecretToken123');

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!hash_equals('Bearer ' . API_KEY, $authHeader)) {
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized access"
    ]);
    exit();
}

// 📥 GET JSON BODY
$request = json_decode(file_get_contents("php://input"), true);

if (!is_array($request)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON request"
    ]);
    exit();
}

// 🔗 DATABASE
$pdo = new PDO(
    "mysql:host=localhost;dbname=visitor_management;charset=utf8mb4",
    "root",
    "",
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

// 🧼 CLEAN FUNCTION
function clean($value) {
    return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
}

// ================= ACTION =================
if (!isset($request['action'])) {
    echo json_encode([
        "success" => false,
        "message" => "No action provided"
    ]);
    exit();
}

switch ($request['action']) {

    // ================= REGISTER =================
    case "register_user":

        // ✅ MATCH HTML IDs
        $user_id   = clean($request['userId'] ?? '');
        $user_name = clean($request['userName'] ?? '');
        $password  = $request['password'] ?? '';
        $user_type = clean($request['userType'] ?? '');

        // ✅ VALIDATION
        if (!$user_id || !$user_name || !$password || !$user_type) {
            echo json_encode([
                "success" => false,
                "message" => "All fields are required"
            ]);
            exit();
        }

        if (strlen($password) < 6) {
            echo json_encode([
                "success" => false,
                "message" => "Password must be at least 6 characters"
            ]);
            exit();
        }

        // ✅ VALID ROLE
        $allowedRoles = ['admin', 'guard'];
        if (!in_array($user_type, $allowedRoles)) {
            echo json_encode([
                "success" => false,
                "message" => "Invalid user type"
            ]);
            exit();
        }

        // 🔍 CHECK DUPLICATE
        $check = $pdo->prepare("SELECT id FROM users WHERE user_id = ?");
        $check->execute([$user_id]);

        if ($check->rowCount() > 0) {
            echo json_encode([
                "success" => false,
                "message" => "User ID already exists"
            ]);
            exit();
        }

        // 🔐 HASH PASSWORD
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // 💾 INSERT
        $stmt = $pdo->prepare("
            INSERT INTO users (user_id, user_name, password, user_type)
            VALUES (?, ?, ?, ?)
        ");

        $stmt->execute([
            $user_id,
            $user_name,
            $hashedPassword,
            $user_type
        ]);

        echo json_encode([
            "success" => true,
            "message" => "User registered successfully"
        ]);

    break;

    // ================= GET USERS =================
    case "get_users":

        $stmt = $pdo->query("
            SELECT id, user_id, user_name, user_type, created_at 
            FROM users 
            ORDER BY id DESC
        ");

        echo json_encode([
            "success" => true,
            "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);

    break;

    // ================= DELETE =================
    case "delete_user":

        if (!isset($request['id'])) {
            echo json_encode([
                "success" => false,
                "message" => "User ID missing"
            ]);
            exit();
        }

        $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = ?");
        $stmt->execute([$request['id']]);

        echo json_encode([
            "success" => true,
            "message" => "User deleted successfully"
        ]);

    break;

    // ================= UPDATE =================
    case "update_user":

        $stmt = $pdo->prepare("
            UPDATE users 
            SET user_name = ?, user_type = ?
            WHERE id = ?
        ");

        $stmt->execute([
            clean($request['user_name']),
            clean($request['user_type']),
            $request['id']
        ]);

        echo json_encode([
            "success" => true,
            "message" => "User updated successfully"
        ]);

    break;

    default:
        echo json_encode([
            "success" => false,
            "message" => "Invalid action"
        ]);
}
?>