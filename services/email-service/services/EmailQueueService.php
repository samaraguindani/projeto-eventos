<?php

class EmailQueueService {
    private $db;
    private $smtpHost;
    private $smtpPort;
    private $smtpUser;
    private $smtpPass;
    private $smtpFrom;

    public function __construct($db) {
        $this->db = $db;
        $this->smtpHost = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
        $this->smtpPort = getenv('SMTP_PORT') ?: 587;
        $this->smtpUser = getenv('SMTP_USER') ?: '';
        $this->smtpPass = getenv('SMTP_PASS') ?: '';
        $this->smtpFrom = getenv('SMTP_FROM') ?: 'noreply@eventos.com';
    }

    public function processarFila($limite = 10) {
        try {
            // Buscar emails pendentes
            $stmt = $this->db->prepare("
                SELECT id, destinatario, assunto, corpo, tipo, tentativas
                FROM email_queue
                WHERE status = 'pending'
                ORDER BY created_at ASC
                LIMIT :limite
            ");
            $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
            $stmt->execute();
            $emails = $stmt->fetchAll();

            $processados = 0;
            $erros = 0;

            foreach ($emails as $email) {
                // Marcar como processando
                $stmt = $this->db->prepare("
                    UPDATE email_queue 
                    SET status = 'processing', tentativas = tentativas + 1
                    WHERE id = :id
                ");
                $stmt->execute(['id' => $email['id']]);

                // Enviar email
                $enviado = $this->enviarEmail(
                    $email['destinatario'],
                    $email['assunto'],
                    $email['corpo']
                );

                if ($enviado) {
                    $stmt = $this->db->prepare("
                        UPDATE email_queue 
                        SET status = 'sent', processado_at = CURRENT_TIMESTAMP
                        WHERE id = :id
                    ");
                    $stmt->execute(['id' => $email['id']]);
                    $processados++;
                } else {
                    if ($email['tentativas'] >= 3) {
                        $stmt = $this->db->prepare("
                            UPDATE email_queue 
                            SET status = 'failed', processado_at = CURRENT_TIMESTAMP,
                                erro = 'Número máximo de tentativas atingido'
                            WHERE id = :id
                        ");
                    } else {
                        $stmt = $this->db->prepare("
                            UPDATE email_queue 
                            SET status = 'pending', erro = 'Erro ao enviar email'
                            WHERE id = :id
                        ");
                    }
                    $stmt->execute(['id' => $email['id']]);
                    $erros++;
                }
            }

            echo json_encode([
                'message' => 'Processamento concluído',
                'processados' => $processados,
                'erros' => $erros,
                'total' => count($emails)
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Erro ao processar fila', 'error' => $e->getMessage()]);
        }
    }

    public function obterStatus() {
        $stmt = $this->db->prepare("
            SELECT 
                status,
                COUNT(*) as total
            FROM email_queue
            GROUP BY status
        ");
        $stmt->execute();
        $status = $stmt->fetchAll();

        $total = 0;
        $porStatus = [];
        foreach ($status as $s) {
            $porStatus[$s['status']] = (int)$s['total'];
            $total += (int)$s['total'];
        }

        echo json_encode([
            'total' => $total,
            'por_status' => $porStatus
        ]);
    }

    public function listarFila($limite = 50) {
        $stmt = $this->db->prepare("
            SELECT id, destinatario, assunto, tipo, status, tentativas, created_at, processado_at
            FROM email_queue
            ORDER BY created_at DESC
            LIMIT :limite
        ");
        $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
        $stmt->execute();
        $emails = $stmt->fetchAll();

        echo json_encode([
            'total' => count($emails),
            'emails' => $emails
        ]);
    }

    private function enviarEmail($destinatario, $assunto, $corpo) {
        // Usar PHPMailer ou função mail() nativa
        // Por simplicidade, vamos usar mail() nativa
        // Em produção, use PHPMailer com SMTP
        
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: " . $this->smtpFrom . "\r\n";
        $headers .= "Reply-To: " . $this->smtpFrom . "\r\n";

        // Para desenvolvimento, apenas simular o envio
        // Em produção, descomente a linha abaixo e configure SMTP
        // return mail($destinatario, $assunto, $corpo, $headers);
        
        // Simulação para desenvolvimento
        error_log("Email enviado para: $destinatario | Assunto: $assunto");
        return true;
    }
}





