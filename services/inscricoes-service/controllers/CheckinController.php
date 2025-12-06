<?php

require_once __DIR__ . '/../models/Inscricao.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../services/EmailService.php';

class CheckinController {
    private $db;
    private $inscricaoModel;

    public function __construct($db) {
        $this->db = $db;
        $this->inscricaoModel = new Inscricao($db);
    }

    // Buscar participante por CPF
    public function buscarPorCpf() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['cpf']) || !isset($data['evento_id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'CPF e evento_id são obrigatórios']);
            return;
        }

        try {
            // Buscar usuário por CPF
            $stmt = $this->db->prepare("
                SELECT u.id, u.nome, u.email, u.cpf, u.cadastro_completo
                FROM usuarios u
                WHERE u.cpf = :cpf
            ");
            $stmt->execute(['cpf' => $data['cpf']]);
            $usuario = $stmt->fetch();

            if (!$usuario) {
                http_response_code(404);
                echo json_encode([
                    'encontrado' => false,
                    'message' => 'Participante não encontrado'
                ]);
                return;
            }

            // Verificar se tem inscrição no evento
            $stmt = $this->db->prepare("
                SELECT i.*, e.titulo as evento_titulo
                FROM inscricoes i
                INNER JOIN eventos e ON i.evento_id = e.id
                WHERE i.usuario_id = :usuario_id AND i.evento_id = :evento_id
            ");
            $stmt->execute([
                'usuario_id' => $usuario['id'],
                'evento_id' => $data['evento_id']
            ]);
            $inscricao = $stmt->fetch();

            echo json_encode([
                'encontrado' => true,
                'usuario' => $usuario,
                'inscricao' => $inscricao ?: null,
                'tem_inscricao' => $inscricao !== false
            ]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Erro ao buscar participante: ' . $e->getMessage()]);
        }
    }

    // Registrar presença por CPF
    public function registrarPresencaPorCpf() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['cpf']) || !isset($data['evento_id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'CPF e evento_id são obrigatórios']);
            return;
        }

        try {
            // Buscar usuário
            $stmt = $this->db->prepare("SELECT id FROM usuarios WHERE cpf = :cpf");
            $stmt->execute(['cpf' => $data['cpf']]);
            $usuario = $stmt->fetch();

            if (!$usuario) {
                http_response_code(404);
                echo json_encode(['message' => 'Usuário não encontrado']);
                return;
            }

            // Buscar inscrição
            $stmt = $this->db->prepare("
                SELECT id, codigo_inscricao, presenca_registrada
                FROM inscricoes
                WHERE usuario_id = :usuario_id AND evento_id = :evento_id AND status = 'ativa'
            ");
            $stmt->execute([
                'usuario_id' => $usuario['id'],
                'evento_id' => $data['evento_id']
            ]);
            $inscricao = $stmt->fetch();

            if (!$inscricao) {
                http_response_code(404);
                echo json_encode(['message' => 'Inscrição não encontrada']);
                return;
            }

            if ($inscricao['presenca_registrada']) {
                http_response_code(400);
                echo json_encode(['message' => 'Presença já foi registrada']);
                return;
            }

            // Registrar presença
            $resultado = $this->inscricaoModel->registrarPresenca($inscricao['codigo_inscricao']);

            if (!$resultado) {
                http_response_code(400);
                echo json_encode(['message' => 'Erro ao registrar presença']);
                return;
            }

            // Enviar email
            EmailService::adicionarFila('checkin', $usuario['id'], $data['evento_id']);

            echo json_encode([
                'message' => 'Presença registrada com sucesso!',
                'data' => $resultado
            ]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Erro ao registrar presença: ' . $e->getMessage()]);
        }
    }

    // Cadastro rápido + inscrição + check-in (tudo de uma vez)
    public function cadastroRapido() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['cpf']) || !isset($data['email']) || !isset($data['evento_id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'CPF, email e evento_id são obrigatórios']);
            return;
        }

        try {
            $this->db->beginTransaction();

            // Verificar se CPF já existe
            $stmt = $this->db->prepare("SELECT id FROM usuarios WHERE cpf = :cpf");
            $stmt->execute(['cpf' => $data['cpf']]);
            if ($stmt->fetch()) {
                $this->db->rollBack();
                http_response_code(400);
                echo json_encode(['message' => 'CPF já cadastrado']);
                return;
            }

            // Verificar se email já existe
            $stmt = $this->db->prepare("SELECT id FROM usuarios WHERE email = :email");
            $stmt->execute(['email' => $data['email']]);
            if ($stmt->fetch()) {
                $this->db->rollBack();
                http_response_code(400);
                echo json_encode(['message' => 'Email já cadastrado']);
                return;
            }

            // Criar usuário com cadastro incompleto
            $senhaTemporaria = bin2hex(random_bytes(8)); // Senha temporária
            $senhaHash = password_hash($senhaTemporaria, PASSWORD_BCRYPT);
            
            $stmt = $this->db->prepare("
                INSERT INTO usuarios (nome, email, senha, cpf, cadastro_completo, created_at)
                VALUES (:nome, :email, :senha, :cpf, FALSE, CURRENT_TIMESTAMP)
                RETURNING id
            ");
            $stmt->execute([
                'nome' => $data['nome'] ?? 'Participante',
                'email' => $data['email'],
                'senha' => $senhaHash,
                'cpf' => $data['cpf']
            ]);
            $usuario = $stmt->fetch();
            $usuarioId = $usuario['id'];

            // Criar inscrição
            $codigoInscricao = 'INS-' . date('YmdHis') . '-' . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            
            $stmt = $this->db->prepare("
                INSERT INTO inscricoes (usuario_id, evento_id, codigo_inscricao, status, data_inscricao, presenca_registrada, data_presenca)
                VALUES (:usuario_id, :evento_id, :codigo_inscricao, 'ativa', CURRENT_TIMESTAMP, TRUE, CURRENT_TIMESTAMP)
                RETURNING id, codigo_inscricao
            ");
            $stmt->execute([
                'usuario_id' => $usuarioId,
                'evento_id' => $data['evento_id'],
                'codigo_inscricao' => $codigoInscricao
            ]);
            $inscricao = $stmt->fetch();

            $this->db->commit();

            // Enviar email com instruções
            EmailService::adicionarFila('cadastro_rapido', $usuarioId, $data['evento_id'], [
                'codigo_inscricao' => $inscricao['codigo_inscricao'],
                'senha_temporaria' => $senhaTemporaria
            ]);

            echo json_encode([
                'message' => 'Cadastro e check-in realizados com sucesso!',
                'usuario_id' => $usuarioId,
                'inscricao_id' => $inscricao['id'],
                'codigo_inscricao' => $inscricao['codigo_inscricao'],
                'senha_temporaria' => $senhaTemporaria
            ]);

        } catch (PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['message' => 'Erro ao realizar cadastro: ' . $e->getMessage()]);
        }
    }
}

