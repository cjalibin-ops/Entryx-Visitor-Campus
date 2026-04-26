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

    switch ($request->action) {

        // DELETE VISITOR
        case "delete_visitor":
            $stmt = $pdo->prepare("DELETE FROM visitor_register WHERE rfidcards = ?");
            $stmt->execute([$request->rfidcards]);
            echo json_encode(["status"=>"success","message"=>"Visitor deleted"]);
            break;

        // UPDATE VISITOR
        case "update_visitor":

            if (
                empty($request->rfidcards) ||
                empty($request->lastName) ||
                empty($request->firstName) ||
                empty($request->province) || 
                empty($request->municipality) ||
                empty($request->barangay) ||
                empty($request->zipcode)
            ) {
                echo json_encode([
                    "status" => "error",
                    "message" => "All required fields must have a value."
                ]);
                exit();
            }

            $stmt = $pdo->prepare("
                UPDATE visitor_register SET 
                    lastName = ?, 
                    firstName = ?, 
                    middleName = ?, 
                    province = ?,
                    municipality = ?, 
                    barangay = ?, 
                    zipcode = ?
                WHERE rfidcards = ?
            ");

            $stmt->execute([
                trim($request->lastName),
                trim($request->firstName),
                trim($request->middleName ?? ''),
                trim($request->province),
                trim($request->municipality),
                trim($request->barangay),
                trim($request->zipcode),
                trim($request->rfidcards)
            ]);

            echo json_encode([
                "status" => "success",
                "message" => "Visitor updated successfully"
            ]);

        break;

        // LOAD VISITORS
        case "load_visitors":
            $stmt = $pdo->prepare("
                SELECT 
                    rfidcards,
                    lastName,
                    firstName,
                    middleName,
                    province,
                    municipality,
                    barangay,
                    zipcode
                FROM visitor_register
                ORDER BY rfidcards DESC
            ");
            $stmt->execute();
            $visitors = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["status"=>"success","data"=>$visitors]);
            break;

        default:
            echo json_encode(["status"=>"error","message"=>"Invalid action"]);
    }

} catch(PDOException $e){
    echo json_encode(["status"=>"error","message"=>$e->getMessage()]);
}