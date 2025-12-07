<?php
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Rota para Swagger UI (verificar ANTES de definir headers JSON)
if ($path === '/swagger' || $path === '/swagger/' || strpos($path, '/swagger') === 0) {
    // Se for exatamente /swagger ou /swagger/, mostrar a UI
    if ($path === '/swagger' || $path === '/swagger/') {
        include __DIR__ . '/swagger.php';
        exit;
    }
    // Se for /swagger.yaml, servir o arquivo YAML
    if ($path === '/swagger.yaml') {
        header('Content-Type: application/yaml; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        readfile(__DIR__ . '/swagger.yaml');
        exit;
    }
}

// Headers para rotas da API (após verificar Swagger)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';
require_once __DIR__ . '/models/Inscricao.php';
require_once __DIR__ . '/controllers/InscricoesController.php';
require_once __DIR__ . '/controllers/CheckinController.php';

$db = getDatabaseConnection();
$controller = new InscricoesController($db);
$checkinController = new CheckinController($db);

// Remover /api/inscricoes se presente, ou apenas / se estiver na raiz
if (strpos($path, '/api/inscricoes') !== false) {
    $path = str_replace('/api/inscricoes', '', $path);
} elseif ($path === '/api/inscricoes') {
    $path = '/';
}
if (empty($path)) {
    $path = '/';
}

// Rotas
if ($path === '' || $path === '/') {
    if ($method === 'POST') {
        $controller->registrarInscricao();
    } elseif ($method === 'GET') {
        $controller->consultarInscricoes();
    }
} elseif (preg_match('/^\/(\d+)$/', $path, $matches)) {
    $id = (int)$matches[1];
    if ($method === 'GET') {
        $controller->consultarInscricao($id);
    } elseif ($method === 'PUT') {
        $controller->cancelarInscricao($id);
    }
} elseif ($path === '/presenca' && $method === 'POST') {
    $controller->registrarPresenca();
} elseif ($path === '/sincronizar' && $method === 'POST') {
    $controller->sincronizarInscricoes();
} elseif ($path === '/presenca/sincronizar' && $method === 'POST') {
    $controller->sincronizarPresencas();
} elseif ($path === '/cancelar/sincronizar' && $method === 'POST') {
    $controller->sincronizarCancelamentos();
} elseif ($path === '/checkin/buscar' && $method === 'POST') {
    $checkinController->buscarPorCpf();
} elseif ($path === '/checkin/registrar' && $method === 'POST') {
    $checkinController->registrarPresencaPorCpf();
} elseif ($path === '/checkin/cadastro-rapido' && $method === 'POST') {
    $checkinController->cadastroRapido();
} elseif ($path === '/checkin/sincronizar-cadastros' && $method === 'POST') {
    $checkinController->sincronizarCadastros();
} elseif ($path === '/checkin/sincronizar' && $method === 'POST') {
    $checkinController->sincronizarCheckins();
} else {
    http_response_code(404);
    echo json_encode(['message' => 'Endpoint não encontrado']);
}

