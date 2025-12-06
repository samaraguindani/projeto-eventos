<?php
/**
 * Worker para processar fila de emails
 * Execute: php processar-fila.php
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/services/EmailQueueService.php';

// Carregar .env se existir
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($name, $value) = explode('=', $line, 2);
        putenv(trim($name) . '=' . trim($value));
    }
}

echo "=========================================\n";
echo "  WORKER DE EMAILS INICIADO\n";
echo "=========================================\n";

// Verificar se SMTP está configurado
$smtpUser = getenv('SMTP_USER');
$smtpPass = getenv('SMTP_PASS');
if (empty($smtpUser) || empty($smtpPass)) {
    echo "AVISO: SMTP_USER ou SMTP_PASS nao configurados!\n";
    echo "   Os emails nao serao enviados. Configure as credenciais SMTP para enviar emails reais.\n";
    echo "   Veja: GUIA_CONFIGURACAO_EMAIL.md\n\n";
} else {
    echo "SMTP configurado: " . getenv('SMTP_HOST') . "\n";
}

echo "Processando fila de emails...\n\n";

$db = getDatabaseConnection();
$emailService = new EmailQueueService($db);

// Loop infinito processando emails a cada 10 segundos
$contador = 0;
while (true) {
    $contador++;
    echo "[" . date('Y-m-d H:i:s') . "] Ciclo #$contador - Processando fila...\n";
    
    try {
        // Processar fila (retorna JSON)
        $resultado = $emailService->processarFila(10);
        
        $dados = json_decode($resultado, true);
        if ($dados) {
            if ($dados['total'] > 0) {
                echo "  → Processados: {$dados['processados']} | Erros: {$dados['erros']} | Total: {$dados['total']}\n";
            } else {
                echo "  → Nenhum email na fila\n";
            }
        }
    } catch (Exception $e) {
        echo "  → ERRO: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
    
    // Aguardar 10 segundos antes do próximo ciclo
    sleep(10);
}

