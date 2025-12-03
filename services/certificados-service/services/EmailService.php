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
        }
        return self::$db;
    }

    public static function adicionarFila($tipo, $usuarioId, $eventoId, $dadosExtras = []) {
        try {
            $db = self::getDb();
            
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

            $assunto = self::gerarAssunto($tipo, $evento);
            $corpo = self::gerarCorpo($tipo, $usuario, $evento, $dadosExtras);

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
            case 'certificado':
                return "Seu Certificado - " . $evento['titulo'];
            default:
                return "Notificação de Evento";
        }
    }

    private static function gerarCorpo($tipo, $usuario, $evento, $dadosExtras) {
        $html = "<html><body style='font-family: Arial, sans-serif;'>";
        $html .= "<h2>Olá, " . htmlspecialchars($usuario['nome']) . "!</h2>";
        
        if ($tipo === 'certificado') {
            $html .= "<p>Seu certificado do evento <strong>" . htmlspecialchars($evento['titulo']) . "</strong> está disponível!</p>";
            if (isset($dadosExtras['codigo_validacao'])) {
                $html .= "<p><strong>Código de Validação:</strong> " . htmlspecialchars($dadosExtras['codigo_validacao']) . "</p>";
            }
        }
        
        $html .= "<p>Atenciosamente,<br>Equipe de Eventos</p>";
        $html .= "</body></html>";
        
        return $html;
    }
}

