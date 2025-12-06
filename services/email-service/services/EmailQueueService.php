<?php

require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailQueueService {
    private $db;
    private $smtpHost;
    private $smtpPort;
    private $smtpUser;
    private $smtpPass;
    private $smtpSecure;
    private $fromEmail;
    private $fromName;

    public function __construct($db) {
        $this->db = $db;
        
        // Configurações SMTP (suporta Gmail, Outlook, Mailgun, etc.)
        $this->smtpHost = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
        $this->smtpPort = (int)(getenv('SMTP_PORT') ?: 587);
        $this->smtpUser = getenv('SMTP_USER') ?: '';
        $this->smtpPass = getenv('SMTP_PASS') ?: '';
        $this->smtpSecure = getenv('SMTP_SECURE') ?: 'tls'; // 'tls' ou 'ssl'
        $this->fromEmail = getenv('EMAIL_FROM') ?: $this->smtpUser;
        $this->fromName = getenv('EMAIL_FROM_NAME') ?: 'Sistema de Eventos';
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

            return json_encode([
                'message' => 'Processamento concluído',
                'processados' => $processados,
                'erros' => $erros,
                'total' => count($emails)
            ]);
        } catch (PDOException $e) {
            return json_encode([
                'message' => 'Erro ao processar fila',
                'error' => $e->getMessage(),
                'processados' => 0,
                'erros' => 0,
                'total' => 0
            ]);
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
        // Se não tiver credenciais SMTP configuradas, apenas loga
        if (empty($this->smtpUser) || empty($this->smtpPass)) {
            error_log("SMTP_USER ou SMTP_PASS nao configurados. Email nao enviado para: $destinatario | Assunto: $assunto");
            return false;
        }

        $mail = null;
        try {
            $mail = new PHPMailer(true);
            
            // Configuracoes do servidor SMTP
            $mail->isSMTP();
            $mail->Host = $this->smtpHost;
            $mail->SMTPAuth = true;
            $mail->Username = $this->smtpUser;
            $mail->Password = $this->smtpPass;
            $mail->SMTPSecure = $this->smtpSecure;
            $mail->Port = $this->smtpPort;
            $mail->CharSet = 'UTF-8';
            
            // Para debug (descomente se necessario)
            // $mail->SMTPDebug = SMTP::DEBUG_SERVER;
            
            // Remetente
            $mail->setFrom($this->fromEmail, $this->fromName);
            
            // Destinatario
            $mail->addAddress($destinatario);
            
            // Conteudo
            $mail->isHTML(true);
            $mail->Subject = $assunto;
            
            // Converter corpo para HTML se necessario
            $corpoHtml = $this->converterParaHTML($corpo);
            $mail->Body = $corpoHtml;
            $mail->AltBody = strip_tags($corpo);
            
            // Enviar
            $mail->send();
            
            error_log("Email enviado com sucesso para: $destinatario | Assunto: $assunto");
            return true;
            
        } catch (Exception $e) {
            $errorMsg = $mail ? $mail->ErrorInfo : $e->getMessage();
            error_log("Erro ao enviar email para $destinatario: $errorMsg");
            return false;
        }
    }

    private function converterParaHTML($corpo) {
        // Se já for HTML, retornar como está
        if (strip_tags($corpo) !== $corpo) {
            return $corpo;
        }

        // Converter quebras de linha para HTML
        $html = nl2br(htmlspecialchars($corpo));
        
        // Aplicar template HTML básico
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 8px 8px 0 0;
                    margin: -30px -30px 20px -30px;
                }
                .content {
                    padding: 20px 0;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    font-size: 12px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 0;
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1 style='margin: 0;'>Sistema de Eventos</h1>
                </div>
                <div class='content'>
                    $html
                </div>
                <div class='footer'>
                    <p>Este é um email automático, por favor não responda.</p>
                    <p>&copy; " . date('Y') . " Sistema de Eventos. Todos os direitos reservados.</p>
                </div>
            </div>
        </body>
        </html>";
    }
}





