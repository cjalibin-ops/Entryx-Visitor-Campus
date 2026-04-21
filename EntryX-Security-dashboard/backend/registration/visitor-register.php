<?php

// CORS HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

define('API_KEY', 'SuperSecretToken123');

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if ($authHeader !== 'Bearer SuperSecretToken123') {
    echo json_encode(["status"=>"error","message"=>"Unauthorized"]);
    exit();
}

$request = json_decode(file_get_contents("php://input"));

if (!isset($request->action)) {
    echo json_encode(["status" => "connected", "message" => "Connected successfully!"]);
    exit();
}

// DATABASE CONNECTION
$host = 'localhost';
$dbname = 'visitor_management';
$username = 'root';
$password = '';
$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    switch ($request->action) {

        // INSERT
        case "insert":

            if (
                empty($request->rfidcards) ||
                empty($request->lastName) ||
                empty($request->firstName) ||
                empty($request->middleName) ||
                empty($request->province) ||
                empty($request->municipality) ||
                empty($request->barangay)
            ) {
                echo json_encode(["status" => "error", "message" => "Missing fields"]);
                exit();
            }

            $check = $pdo->prepare("SELECT COUNT(*) FROM visitor_register WHERE rfidcards = ?");
            $check->execute([$request->rfidcards]);

            if ($check->fetchColumn() > 0) {
                echo json_encode(["status" => "error", "message" => "RFID already registered"]);
                exit();
            }

            $stmt = $pdo->prepare("
                INSERT INTO visitor_register 
                (rfidcards, lastName, firstName, middleName, province, municipality, barangay, zipcode)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                htmlspecialchars($request->rfidcards),
                htmlspecialchars($request->lastName),
                htmlspecialchars($request->firstName),
                htmlspecialchars($request->middleName),
                htmlspecialchars($request->province),
                htmlspecialchars($request->municipality),
                htmlspecialchars($request->barangay),
                htmlspecialchars($request->zipcode ?? '')
            ]);

            echo json_encode(["status" => "success", "message" => "Visitor registered"]);
            break;

        // UPDATE
        case "update":

            if (empty($request->rfidcards)) {
                echo json_encode(["status" => "error", "message" => "RFID required"]);
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
                htmlspecialchars($request->lastName),
                htmlspecialchars($request->firstName),
                htmlspecialchars($request->middleName),
                htmlspecialchars($request->province),
                htmlspecialchars($request->municipality),
                htmlspecialchars($request->barangay),
                htmlspecialchars($request->zipcode ?? ''),
                htmlspecialchars($request->rfidcards)
            ]);

            echo json_encode([
                "status" => $stmt->rowCount() > 0 ? "success" : "warning",
                "message" => $stmt->rowCount() > 0 ? "Updated successfully" : "No changes made"
            ]);
            break;

        // DELETE
        case "delete":
            $stmt = $pdo->prepare("DELETE FROM visitor_register WHERE rfidcards = ?");
            $stmt->execute([$request->rfidcards]);

            echo json_encode([
                "status" => $stmt->rowCount() > 0 ? "success" : "warning",
                "message" => $stmt->rowCount() > 0 ? "Deleted" : "Not found"
            ]);
            break;

        // LOAD
        case "load":
            $stmt = $pdo->query("SELECT * FROM visitor_register");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        // COUNT
        case "count":
            $stmt = $pdo->query("SELECT COUNT(*) AS total FROM visitor_register");
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Invalid action"]);
            break;
    }

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>