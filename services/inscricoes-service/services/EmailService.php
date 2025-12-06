<?php

class EmailService {
    private static $db;

    public static function getDb() {
        if (!self::$db) {
            $host = getenv('DB_HOST') ?: 'localhost';
            $port = getenv('DB_PORT') ?: '5432';
            $dbname = getenv('DB_NAME') ?: 'eventos_db';
            $username = getenv('DB_USER') ?: 'postgres';
            $password = getenv('DB_PASSWORD') ?: 'postgres';
            
            $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
            self::$db = new PDO($dsn, $username, $password);
            self::$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        }
        return self::$db;
    }

    public static function adicionarFila($tipo, $usuarioId, $eventoId, $dadosExtras = []) {
        try {
            $db = self::getDb();
            
            // Buscar dados do usuário e evento
            $stmt = $db->prepare("SELECT email, nome FROM usuarios WHERE id = :usuario_id");
            $stmt->execute(['usuario_id' => $usuarioId]);
            $usuario = $stmt->fetch();
            
            if (!$usuario) {
                return false;
            }

            $stmt = $db->prepare("SELECT titulo, data_inicio, localizacao FROM eventos WHERE id = :evento_id");
            $stmt->execute(['evento_id' => $eventoId]);
            $evento = $stmt->fetch();
            
            if (!$evento) {
                return false;
            }

            // Gerar assunto e corpo do email
            $assunto = self::gerarAssunto($tipo, $evento);
            $corpo = self::gerarCorpo($tipo, $usuario, $evento, $dadosExtras);

            // Inserir na fila
            $stmt = $db->prepare("
                INSERT INTO email_queue (destinatario, assunto, corpo, tipo, status)
                VALUES (:destinatario, :assunto, :corpo, :tipo, 'pending')
            ");
            $stmt->execute([
                'destinatario' => $usuario['email'],
                'assunto' => $assunto,
                'corpo' => $corpo,
                'tipo' => $tipo
            ]);

            return true;
        } catch (PDOException $e) {
            error_log("Erro ao adicionar email à fila: " . $e->getMessage());
            return false;
        }
    }

    private static function gerarAssunto($tipo, $evento) {
        switch ($tipo) {
            case 'inscricao':
                return "Confirmação de Inscrição - " . $evento['titulo'];
            case 'cancelamento':
                return "Cancelamento de Inscrição - " . $evento['titulo'];
            case 'checkin':
                return "Check-in Realizado - " . $evento['titulo'];
            case 'certificado':
                return "Seu Certificado - " . $evento['titulo'];
            case 'cadastro_rapido':
                return "Bem-vindo! Complete seu cadastro - " . $evento['titulo'];
            default:
                return "Notificação de Evento";
        }
    }

    private static function gerarCorpo($tipo, $usuario, $evento, $dadosExtras) {
        $html = "<html><body style='font-family: Arial, sans-serif;'>";
        $html .= "<h2>Olá, " . htmlspecialchars($usuario['nome']) . "!</h2>";
        
        switch ($tipo) {
            case 'inscricao':
                $html .= "<p>Sua inscrição no evento <strong>" . htmlspecialchars($evento['titulo']) . "</strong> foi confirmada!</p>";
                $html .= "<p><strong>Data:</strong> " . date('d/m/Y H:i', strtotime($evento['data_inicio'])) . "</p>";
                $html .= "<p><strong>Local:</strong> " . htmlspecialchars($evento['localizacao']) . "</p>";
                if (isset($dadosExtras['codigo_inscricao'])) {
                    $html .= "<p><strong>Código de Inscrição:</strong> " . htmlspecialchars($dadosExtras['codigo_inscricao']) . "</p>";
                }
                break;
            case 'cancelamento':
                $html .= "<p>Sua inscrição no evento <strong>" . htmlspecialchars($evento['titulo']) . "</strong> foi cancelada.</p>";
                break;
            case 'checkin':
                $html .= "<p>Seu check-in no evento <strong>" . htmlspecialchars($evento['titulo']) . "</strong> foi registrado com sucesso!</p>";
                $html .= "<p>Em breve você receberá seu certificado de participação.</p>";
                break;
            case 'certificado':
                $html .= "<p>Seu certificado do evento <strong>" . htmlspecialchars($evento['titulo']) . "</strong> está disponível!</p>";
                if (isset($dadosExtras['codigo_validacao'])) {
                    $html .= "<p><strong>Código de Validação:</strong> " . htmlspecialchars($dadosExtras['codigo_validacao']) . "</p>";
                }
                break;
            case 'cadastro_rapido':
                $html .= "<p>Bem-vindo ao evento <strong>" . htmlspecialchars($evento['titulo']) . "</strong>!</p>";
                $html .= "<p>Seu cadastro e check-in foram realizados com sucesso na portaria do evento.</p>";
                $html .= "<p><strong>Importante:</strong> Complete seu cadastro para ter acesso total ao sistema.</p>";
                $html .= "<hr>";
                $html .= "<h3>Dados de Acesso Temporários:</h3>";
                $html .= "<p><strong>Email:</strong> " . htmlspecialchars($usuario['email']) . "</p>";
                if (isset($dadosExtras['senha_temporaria'])) {
                    $html .= "<p><strong>Senha Temporária:</strong> " . htmlspecialchars($dadosExtras['senha_temporaria']) . "</p>";
                }
                if (isset($dadosExtras['codigo_inscricao'])) {
                    $html .= "<p><strong>Código de Inscrição:</strong> " . htmlspecialchars($dadosExtras['codigo_inscricao']) . "</p>";
                }
                $html .= "<p><a href='http://localhost:8080' style='background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;'>Acessar Sistema</a></p>";
                break;
        }
        
        $html .= "<p>Atenciosamente,<br>Equipe de Eventos</p>";
        $html .= "</body></html>";
        
        return $html;
    }
}


