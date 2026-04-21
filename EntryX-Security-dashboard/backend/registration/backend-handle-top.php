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

    // AUTO DELETE OLD DATA
    $deleteOld = $pdo->prepare("
        DELETE FROM visitor_enter
        WHERE date_today < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ");
    $deleteOld->execute();

    switch ($request->action) {

        // ─── RFID TAP ───
        case "rfid_tap":
            if (empty($request->rfidcards)) {
                echo json_encode(["status"=>"error","message"=>"RFID UID required"]);
                exit();
            }

            $rfid = trim($request->rfidcards);

            // Auto-close old sessions (overnight)
            $autoClose = $pdo->prepare("
                UPDATE visitor_enter
                SET status = 'Not Checked Out', checkout = CONCAT(date_today,' 23:59:59')
                WHERE rfidcards = ? 
                AND checkout IS NULL 
                AND date_today < CURDATE()
            ");
            $autoClose->execute([$rfid]);

            // Get visitor info
            $stmt = $pdo->prepare("SELECT firstName, middleName, lastName FROM visitor_register WHERE rfidcards = ?");
            $stmt->execute([$rfid]);
            $visitor = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$visitor) {
                echo json_encode(["status"=>"error","message"=>"RFID not registered"]);
                exit();
            }
            $fullName = trim($visitor['firstName']." ".($visitor['middleName'] ?? "")." ".$visitor['lastName']);

            // Check active session today
            $check = $pdo->prepare("
                SELECT record_id 
                FROM visitor_enter 
                WHERE rfidcards = ? 
                AND checkout IS NULL
                AND date_today = CURDATE()
                ORDER BY record_id DESC 
                LIMIT 1
            ");
            $check->execute([$rfid]);
            $active = $check->fetch(PDO::FETCH_ASSOC);

            if ($active) {
                echo json_encode(["status"=>"confirm_checkout","record_id"=>$active['record_id'],"fullName"=>$fullName]);
                exit();
            }

            echo json_encode(["status"=>"need_details","rfidcards"=>$rfid,"fullName"=>$fullName]);
            exit();

        // ─── CHECKIN SUBMIT ───
        case "checkin_submit":
            if (empty($request->rfidcards) || empty($request->personToVisit) || empty($request->purpose)) {
                echo json_encode(["status"=>"error","message"=>"Missing required fields"]);
                exit();
            }

            // Get visitor full name
            $stmt = $pdo->prepare("SELECT firstName, middleName, lastName FROM visitor_register WHERE rfidcards = ?");
            $stmt->execute([$request->rfidcards]);
            $visitor = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$visitor) {
                echo json_encode(["status"=>"error","message"=>"Visitor not found"]);
                exit();
            }
            $fullName = trim($visitor['firstName']." ".($visitor['middleName'] ?? "")." ".$visitor['lastName']);

            // Insert new check-in
            $insert = $pdo->prepare("
                INSERT INTO visitor_enter 
                (rfidcards, fullName, personToVisit, purpose, checkin, date_today, status)
                VALUES (?, ?, ?, ?, ?, ?, 'Inside')
            ");
            $insert->execute([$request->rfidcards, $fullName, $request->personToVisit, $request->purpose, $timeNow, $dateToday]);

            echo json_encode(["status"=>"success","type"=>"checkin","time"=>$timeNow]);
            break;

        // ─── CONFIRM CHECKOUT ───
        case "confirm_checkout":
            if(empty($request->record_id)){
                echo json_encode(["status"=>"error","message"=>"Record ID required"]);
                exit();
            }

            $timeNow = date("Y-m-d H:i:s"); // exact time
            $update = $pdo->prepare("
                UPDATE visitor_enter 
                SET checkout = ?, status = 'Checked Out'
                WHERE record_id = ?
            ");
            $update->execute([$timeNow,$request->record_id]);

            echo json_encode(["status"=>"success","type"=>"checkout","time"=>$timeNow]);
            break;

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
                WHERE date_today = CURDATE()
                ORDER BY record_id DESC
            ");
            $stmt->execute();
            $visitors = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["status"=>"success","data"=>$visitors]);
        break;

        case "auto_checkout":
            // Update all visitors today who didn't check out
            $autoUpdate = $pdo->prepare("
                UPDATE visitor_enter
                SET status = 'Not Checked Out', checkout = CONCAT(date_today,' 23:59:59')
                WHERE checkout IS NULL 
                AND date_today = CURDATE()
            ");
            $autoUpdate->execute();

            echo json_encode([
                "status"=>"success",
                "message"=>"Auto-checked out visitors who didn't check out today."
            ]);
        break;

        default:
            echo json_encode(["status"=>"error","message"=>"Invalid action"]);
    }

} catch(PDOException $e){
    echo json_encode(["status"=>"error","message"=>$e->getMessage()]);
}