<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/services/EmailQueueService.php';

$db = getDatabaseConnection();
$service = new EmailQueueService($db);

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api/email', '', $path);

// Rotas
if ($path === '/processar' && $method === 'POST') {
    $service->processarFila();
} elseif ($path === '/status' && $method === 'GET') {
    $service->obterStatus();
} elseif ($path === '/fila' && $method === 'GET') {
    $service->listarFila();
} else {
    http_response_code(404);
    echo json_encode(['message' => 'Endpoint não encontrado']);
}





