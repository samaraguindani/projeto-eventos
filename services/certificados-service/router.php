<?php
// Router para servidor PHP built-in
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Se for uma rota do Swagger, servir diretamente
if ($path === '/swagger' || $path === '/swagger/' || $path === '/swagger.yaml') {
    if ($path === '/swagger.yaml') {
        header('Content-Type: application/yaml; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        readfile(__DIR__ . '/swagger.yaml');
        exit;
    } else {
        include __DIR__ . '/swagger.php';
        exit;
    }
}

// Para todas as outras rotas, usar o index.php
if (file_exists(__DIR__ . '/index.php')) {
    return false; // Deixa o servidor PHP processar normalmente
}

// Se não encontrar, retornar 404
http_response_code(404);
echo "404 Not Found";




