<?php
// ─── CORS FIX ───
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ─── API TOKEN PROTECTION ───
define('API_KEY', 'SuperSecretToken123');

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
if ($authHeader !== 'Bearer ' . API_KEY) {
    echo json_encode(["status"=>"error","message"=>"Unauthorized!"]);
    exit();
}

// ─── READ JSON INPUT ───
$request = json_decode(file_get_contents("php://input"));
if (!isset($request->action)) {
    echo json_encode(["status" => "connected", "message" => "Connected successfully!"]);
    exit();
}

// ─── DATABASE CONNECTION ───
$host = 'localhost';
$dbname = 'visitor_management';
$username = 'root';
$password = '';
$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    date_default_timezone_set('Asia/Manila'); // Set PHP to your timezone
    $timeNow = date("Y-m-d H:i:s");           // exact local time
    $dateToday = date("Y-m-d");

    switch ($request->action) {

        // ─── LOAD VISITORS ───
        case "load_visitors":
            $stmt = $pdo->prepare("
                SELECT 
                    record_id,
                    rfidcards,
                    fullName,
                    personToVisit,
                    purpose,
                    checkin,
                    checkout,
                    date_today,
                    status
                FROM visitor_enter
                ORDER BY record_id DESC
            ");
            $stmt->execute();
            $visitors = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["status"=>"success","data"=>$visitors]);
            break;

        // ─── TODAY COUNT ───
        case "total_today":
            $stmt = $pdo->prepare("
                SELECT COUNT(*) as total 
                FROM visitor_enter 
                WHERE DATE(checkin) = CURDATE()
            ");
            $stmt->execute();
            $total = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode(["status"=>"success","total"=>$total["total"]]);
        break;


        // ─── WEEK COUNT ───
        case "total_week":
            $stmt = $pdo->prepare("
                SELECT COUNT(*) as total 
                FROM visitor_enter 
                WHERE YEARWEEK(checkin, 1) = YEARWEEK(CURDATE(), 1)
            ");
            $stmt->execute();
            $total = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode(["status"=>"success","total"=>$total["total"]]);
        break;


        // ─── MONTH COUNT ───
        case "total_month":
            $stmt = $pdo->prepare("
                SELECT COUNT(*) as total 
                FROM visitor_enter 
                WHERE MONTH(checkin) = MONTH(CURDATE())
                AND YEAR(checkin) = YEAR(CURDATE())
            ");
            $stmt->execute();
            $total = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode(["status"=>"success","total"=>$total["total"]]);
        break;

        default:
            echo json_encode(["status"=>"error","message"=>"Invalid action"]);
    }

} catch(PDOException $e){
    echo json_encode(["status"=>"error","message"=>$e->getMessage()]);
}