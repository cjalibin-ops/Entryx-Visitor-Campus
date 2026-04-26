<?php

define('API_KEY', 'SuperSecretToken123');

function checkAuth() {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? '';

    if (!hash_equals("Bearer " . API_KEY, $auth)) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Unauthorized"
        ]);
        exit();
    }
}
?>