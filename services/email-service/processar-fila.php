<?php
/**
 * Worker para processar fila de emails
 * Execute: php processar-fila.php
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/services/EmailQueueService.php';

echo "=========================================\n";
echo "  WORKER DE EMAILS INICIADO\n";
echo "=========================================\n";
echo "Processando fila de emails...\n\n";

$db = getDatabaseConnection();
$emailService = new EmailQueueService($db);

// Loop infinito processando emails a cada 10 segundos
$contador = 0;
while (true) {
    $contador++;
    echo "[" . date('Y-m-d H:i:s') . "] Ciclo #$contador - Processando fila...\n";
    
    try {
        // Capturar a saída JSON
        ob_start();
        $emailService->processarFila(10);
        $resultado = ob_get_clean();
        
        $dados = json_decode($resultado, true);
        if ($dados) {
            echo "  → Processados: {$dados['processados']} | Erros: {$dados['erros']} | Total: {$dados['total']}\n";
            
            if ($dados['total'] == 0) {
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

