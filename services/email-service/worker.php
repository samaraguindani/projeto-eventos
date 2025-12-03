<?php
/**
 * Worker para processar fila de emails
 * Execute este script periodicamente via cron:
 * * * * * * php /caminho/para/worker.php
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/services/EmailQueueService.php';

$db = getDatabaseConnection();
$service = new EmailQueueService($db);

// Processar até 50 emails por execução
$service->processarFila(50);

