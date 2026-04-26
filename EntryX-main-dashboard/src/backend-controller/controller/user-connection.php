<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

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

$rawInput = file_get_contents("php://input");
$request = json_decode($rawInput, true);

if (!is_array($request)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON"
    ]);
    exit();
}

$allowedActions = ["login"];

if (!isset($request['action']) || !in_array($request['action'], $allowedActions)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid action"
    ]);
    exit();
}

$host = 'localhost';
$dbname = 'visitor_management';
$db_user = 'root';
$db_pass = '';

try {

    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $db_user,
        $db_pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    function clean($value) {
        return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
    }

    switch ($request['action']) {

        //login for user
        case "login":

            if (empty($request['user_id']) || empty($request['password'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "User ID and password are required"
                ]);
                exit();
            }

            $stmt = $pdo->prepare("
                SELECT id, user_id, user_name, password, user_type
                FROM users
                WHERE user_id = ?
                LIMIT 1
            ");

            $stmt->execute([clean($request['user_id'])]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || !password_verify($request['password'], $user['password'])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid User ID or Password"
                ]);
                exit();
            }

            // Save session
            $_SESSION['user'] = [
                "id" => $user['id'],
                "user_id" => $user['user_id'],
                "user_name" => $user['user_name'],
                "user_type" => $user['user_type'],
                "login_time" => time()
            ];

            // ROLE CHECK (IMPORTANT)
            $access_page = "";

            if ($user['user_type'] === "admin") {
                $access_page = "admin_dashboard.html";
            } elseif ($user['user_type'] === "guard") {
                $access_page = "guard_dashboard.html";
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid user type"
                ]);
                exit();
            }

            echo json_encode([
                "success" => true,
                "message" => "Login successful",
                "redirect" => $access_page,
                "user" => [
                    "id" => $user['id'],
                    "user_id" => $user['user_id'],
                    "user_name" => $user['user_name'],
                    "user_type" => $user['user_type']
                ]
            ]);

        break;
    }

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Server error",
        "debug" => $e->getMessage()
    ]); 
}
?>

