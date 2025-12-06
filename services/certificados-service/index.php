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
require_once __DIR__ . '/config/jwt.php';
require_once __DIR__ . '/models/Certificado.php';
require_once __DIR__ . '/controllers/CertificadosController.php';

$db = getDatabaseConnection();
$controller = new CertificadosController($db);

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api/certificados', '', $path);

// Rotas
if ($path === '/emitir' && $method === 'POST') {
    $controller->emitirCertificado();
} elseif ($path === '/validar' && $method === 'GET') {
    $controller->validarCertificado();
} elseif (preg_match('/^\/inscricao\/(\d+)$/', $path, $matches) && $method === 'GET') {
    $inscricaoId = (int)$matches[1];
    $controller->obterCertificadoPorInscricao($inscricaoId);
} elseif (preg_match('/^\/(\d+)$/', $path, $matches) && $method === 'GET') {
    $id = (int)$matches[1];
    $controller->obterCertificado($id);
} else {
    http_response_code(404);
    echo json_encode(['message' => 'Endpoint não encontrado']);
}





