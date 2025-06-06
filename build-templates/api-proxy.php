<?php
// Toggl API Proxy für CORS-Probleme - Production Deployment
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');

// Debug-Logging deaktiviert (Produktion)
// error_log("=== TOGGL PROXY DEBUG ===");

// Rate Limiting deaktiviert (Session-Probleme)
// TODO: Implementierung mit File-basiertem System

// Preflight-Request für CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Endpoint-Parameter validieren
if (!isset($_GET['endpoint'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Endpoint-Parameter fehlt']);
    exit;
}

// Input-Sanitization
$endpoint = filter_var($_GET['endpoint'], FILTER_SANITIZE_URL);
if ($endpoint === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Ungültiger Endpoint']);
    exit;
}

// SSRF-Schutz: Nur erlaubte Endpunkte
$allowedPaths = [
    '/api/v9/me',
    '/api/v9/workspaces',
    '/reports/api/v3/shared/'
];

$isAllowed = false;
foreach ($allowedPaths as $allowedPath) {
    if (strpos($endpoint, $allowedPath) === 0) {
        $isAllowed = true;
        break;
    }
}

if (!$isAllowed) {
    http_response_code(403);
    echo json_encode(['error' => 'Endpoint nicht erlaubt']);
    exit;
}

$baseUrl = 'https://api.track.toggl.com';
$fullUrl = $baseUrl . $endpoint;

// HTTP Context für cURL erstellen
$headers = [];

// Authorization Header weiterleiten (mehrere Varianten prüfen)
$authHeader = null;
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
} elseif (function_exists('apache_request_headers')) {
    $requestHeaders = apache_request_headers();
    if (isset($requestHeaders['Authorization'])) {
        $authHeader = $requestHeaders['Authorization'];
    }
}

if ($authHeader) {
    $headers[] = 'Authorization: ' . $authHeader;
}

// Content-Type für POST/PUT
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH'])) {
    $headers[] = 'Content-Type: application/json';
}

// User-Agent
$headers[] = 'User-Agent: TogglWebSense/1.2.3';

// cURL-Request konfigurieren
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $fullUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_CUSTOMREQUEST => $_SERVER['REQUEST_METHOD'],
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_USERAGENT => 'TogglWebSense-Proxy/1.0'
]);

// POST/PUT/PATCH-Daten weiterleiten
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'PATCH'])) {
    $inputData = file_get_contents('php://input');
    if ($inputData) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $inputData);
    }
}

// Request ausführen
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

// Fehlerbehandlung
if (curl_errno($ch)) {
    $error = curl_error($ch);
    curl_close($ch);
    
    http_response_code(500);
    echo json_encode([
        'error' => 'cURL-Fehler: ' . $error,
        'proxy_info' => 'Toggl-API nicht erreichbar'
    ]);
    exit;
}

curl_close($ch);

// Response-Header setzen
http_response_code($httpCode);
if ($contentType) {
    header('Content-Type: ' . $contentType);
}

// Response ausgeben
echo $response;
?> 