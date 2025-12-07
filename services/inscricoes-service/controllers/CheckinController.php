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
            // Limpar CPF (remover pontos e hífen)
            $cpfLimpo = preg_replace('/[^0-9]/', '', $data['cpf']);
            
            // Buscar usuário por CPF (tentar com e sem formatação)
            $stmt = $this->db->prepare("
                SELECT u.id, u.nome, u.email, u.cpf, u.cadastro_completo
                FROM usuarios u
                WHERE REPLACE(REPLACE(u.cpf, '.', ''), '-', '') = :cpf_limpo
                   OR u.cpf = :cpf_formatado
            ");
            $stmt->execute([
                'cpf_limpo' => $cpfLimpo,
                'cpf_formatado' => $data['cpf']
            ]);
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
                WHERE i.usuario_id = :usuario_id 
                  AND i.evento_id = :evento_id
                  AND i.status = 'ativa'
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
            $this->db->beginTransaction();

            // Limpar CPF (remover pontos e hífen)
            $cpfLimpo = preg_replace('/[^0-9]/', '', $data['cpf']);
            
            // Buscar usuário por CPF
            $stmt = $this->db->prepare("
                SELECT id FROM usuarios 
                WHERE REPLACE(REPLACE(cpf, '.', ''), '-', '') = :cpf_limpo
                   OR cpf = :cpf_formatado
            ");
            $stmt->execute([
                'cpf_limpo' => $cpfLimpo,
                'cpf_formatado' => $data['cpf']
            ]);
            $usuario = $stmt->fetch();

            if (!$usuario) {
                $this->db->rollBack();
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

            // Se não tem inscrição, criar automaticamente
            $inscricaoCriada = false;
            if (!$inscricao) {
                // Verificar se o evento existe e tem vagas
                $stmt = $this->db->prepare("
                    SELECT id, vagas_disponiveis FROM eventos WHERE id = :evento_id
                ");
                $stmt->execute(['evento_id' => $data['evento_id']]);
                $evento = $stmt->fetch();
                
                if (!$evento) {
                    $this->db->rollBack();
                    http_response_code(404);
                    echo json_encode(['message' => 'Evento não encontrado']);
                    return;
                }

                if ($evento['vagas_disponiveis'] <= 0) {
                    $this->db->rollBack();
                    http_response_code(400);
                    echo json_encode(['message' => 'Não há vagas disponíveis para este evento']);
                    return;
                }

                // Criar inscrição automaticamente com presença já registrada
                $codigoInscricao = 'INS-' . date('YmdHis') . '-' . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
                
                $stmt = $this->db->prepare("
                    INSERT INTO inscricoes (usuario_id, evento_id, codigo_inscricao, status, data_inscricao, presenca_registrada, data_presenca)
                    VALUES (:usuario_id, :evento_id, :codigo_inscricao, 'ativa', CURRENT_TIMESTAMP, TRUE, CURRENT_TIMESTAMP)
                    RETURNING id, codigo_inscricao
                ");
                $stmt->execute([
                    'usuario_id' => $usuario['id'],
                    'evento_id' => $data['evento_id'],
                    'codigo_inscricao' => $codigoInscricao
                ]);
                $inscricao = $stmt->fetch();
                $inscricaoCriada = true;
                
                // Enviar email de inscrição
                EmailService::adicionarFila('inscricao', $usuario['id'], $data['evento_id'], [
                    'codigo_inscricao' => $codigoInscricao
                ]);
            } else {
                // Já tem inscrição - verificar se presença já foi registrada
                if ($inscricao['presenca_registrada']) {
                    $this->db->rollBack();
                    http_response_code(400);
                    echo json_encode(['message' => 'Presença já foi registrada']);
                    return;
                }

                // Registrar presença
                $resultado = $this->inscricaoModel->registrarPresenca($inscricao['codigo_inscricao']);
                
                if (!$resultado) {
                    $this->db->rollBack();
                    http_response_code(400);
                    echo json_encode(['message' => 'Erro ao registrar presença']);
                    return;
                }
            }

            $this->db->commit();

            // Enviar email de check-in
            EmailService::adicionarFila('checkin', $usuario['id'], $data['evento_id']);

            // Buscar dados completos da inscrição para retornar
            $stmt = $this->db->prepare("
                SELECT i.*, e.titulo as evento_titulo
                FROM inscricoes i
                INNER JOIN eventos e ON i.evento_id = e.id
                WHERE i.id = :inscricao_id
            ");
            $stmt->execute(['inscricao_id' => $inscricao['id']]);
            $inscricaoCompleta = $stmt->fetch();

            echo json_encode([
                'message' => $inscricaoCriada ? 
                    'Inscrição criada e check-in realizados com sucesso!' : 
                    'Check-in realizado com sucesso!',
                'inscricao_criada' => $inscricaoCriada,
                'data' => $inscricaoCompleta
            ]);

        } catch (PDOException $e) {
            $this->db->rollBack();
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

    // Sincronizar cadastros rápidos realizados offline
    public function sincronizarCadastros() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['usuarios']) || !is_array($data['usuarios'])) {
            http_response_code(400);
            echo json_encode(['message' => 'usuarios é obrigatório e deve ser um array']);
            return;
        }

        $resultados = [];
        
        foreach ($data['usuarios'] as $usuarioData) {
            try {
                $this->db->beginTransaction();

                // Verificar se CPF já existe
                $stmt = $this->db->prepare("SELECT id FROM usuarios WHERE cpf = :cpf");
                $stmt->execute(['cpf' => $usuarioData['cpf']]);
                $usuarioExistente = $stmt->fetch();

                if ($usuarioExistente) {
                    // Usuário já existe, apenas criar inscrição e check-in se necessário
                    $usuarioId = $usuarioExistente['id'];
                } else {
                    // Criar usuário
                    $senhaTemporaria = $usuarioData['senha_temporaria'] ?? bin2hex(random_bytes(8));
                    $senhaHash = password_hash($senhaTemporaria, PASSWORD_BCRYPT);
                    
                    $stmt = $this->db->prepare("
                        INSERT INTO usuarios (nome, email, senha, cpf, cadastro_completo, created_at)
                        VALUES (:nome, :email, :senha, :cpf, FALSE, CURRENT_TIMESTAMP)
                        RETURNING id
                    ");
                    $stmt->execute([
                        'nome' => $usuarioData['nome'] ?? 'Participante',
                        'email' => $usuarioData['email'],
                        'senha' => $senhaHash,
                        'cpf' => $usuarioData['cpf']
                    ]);
                    $usuario = $stmt->fetch();
                    $usuarioId = $usuario['id'];
                }

                // Verificar se já tem inscrição
                $stmt = $this->db->prepare("
                    SELECT id, presenca_registrada FROM inscricoes
                    WHERE usuario_id = :usuario_id AND evento_id = :evento_id AND status = 'ativa'
                ");
                $stmt->execute([
                    'usuario_id' => $usuarioId,
                    'evento_id' => $usuarioData['evento_id']
                ]);
                $inscricao = $stmt->fetch();

                if (!$inscricao) {
                    // Criar inscrição com check-in
                    $codigoInscricao = 'INS-' . date('YmdHis') . '-' . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
                    
                    $stmt = $this->db->prepare("
                        INSERT INTO inscricoes (usuario_id, evento_id, codigo_inscricao, status, data_inscricao, presenca_registrada, data_presenca)
                        VALUES (:usuario_id, :evento_id, :codigo_inscricao, 'ativa', CURRENT_TIMESTAMP, TRUE, CURRENT_TIMESTAMP)
                        RETURNING id, codigo_inscricao
                    ");
                    $stmt->execute([
                        'usuario_id' => $usuarioId,
                        'evento_id' => $usuarioData['evento_id'],
                        'codigo_inscricao' => $codigoInscricao
                    ]);
                    $inscricao = $stmt->fetch();

                    // Enviar email de inscrição
                    EmailService::adicionarFila('inscricao', $usuarioId, $usuarioData['evento_id'], [
                        'codigo_inscricao' => $codigoInscricao
                    ]);
                } else if (!$inscricao['presenca_registrada']) {
                    // Já tem inscrição mas não tem check-in - registrar presença
                    $stmt = $this->db->prepare("
                        SELECT codigo_inscricao FROM inscricoes WHERE id = :id
                    ");
                    $stmt->execute(['id' => $inscricao['id']]);
                    $inscricaoCompleta = $stmt->fetch();
                    
                    $this->inscricaoModel->registrarPresenca($inscricaoCompleta['codigo_inscricao']);
                }

                $this->db->commit();

                $resultados[] = [
                    'temp_id' => $usuarioData['temp_id'] ?? null,
                    'success' => true,
                    'usuario_id' => $usuarioId,
                    'inscricao_id' => $inscricao['id'] ?? null
                ];

                // Enviar email de check-in
                EmailService::adicionarFila('checkin', $usuarioId, $usuarioData['evento_id']);

            } catch (PDOException $e) {
                $this->db->rollBack();
                $resultados[] = [
                    'temp_id' => $usuarioData['temp_id'] ?? null,
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }

        echo json_encode([
            'message' => 'Sincronização de cadastros concluída',
            'resultados' => $resultados
        ]);
    }

    // Sincronizar check-ins realizados offline
    public function sincronizarCheckins() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['checkins']) || !is_array($data['checkins'])) {
            http_response_code(400);
            echo json_encode(['message' => 'checkins é obrigatório e deve ser um array']);
            return;
        }

        $resultados = [];
        
        foreach ($data['checkins'] as $checkinData) {
            try {
                $this->db->beginTransaction();

                $cpfLimpo = preg_replace('/[^0-9]/', '', $checkinData['cpf']);
                
                // Buscar usuário por CPF
                $stmt = $this->db->prepare("
                    SELECT id FROM usuarios 
                    WHERE REPLACE(REPLACE(cpf, '.', ''), '-', '') = :cpf_limpo
                       OR cpf = :cpf_formatado
                ");
                $stmt->execute([
                    'cpf_limpo' => $cpfLimpo,
                    'cpf_formatado' => $checkinData['cpf']
                ]);
                $usuario = $stmt->fetch();

                // Se não encontrou o usuário, tentar criar se tiver dados
                if (!$usuario && isset($checkinData['dados_usuario'])) {
                    $dadosUsuario = $checkinData['dados_usuario'];
                    
                    // Verificar se tem dados suficientes para criar (nome e email, ou pelo menos CPF)
                    $temDadosSuficientes = false;
                    $nome = null;
                    $email = null;
                    
                    // Se tiver dados parciais (do check-in direto offline)
                    if (isset($dadosUsuario['verificar_no_servidor']) && $dadosUsuario['verificar_no_servidor']) {
                        // Tem dados parciais - verificar se tem nome e email
                        if (!empty($dadosUsuario['nome']) && !empty($dadosUsuario['email'])) {
                            $temDadosSuficientes = true;
                            $nome = $dadosUsuario['nome'];
                            $email = $dadosUsuario['email'];
                        }
                    } else {
                        // Dados completos (do cadastro rápido offline)
                        if (!empty($dadosUsuario['nome']) && !empty($dadosUsuario['email'])) {
                            $temDadosSuficientes = true;
                            $nome = $dadosUsuario['nome'];
                            $email = $dadosUsuario['email'];
                        }
                    }
                    
                    if ($temDadosSuficientes) {
                        // Verificar se email já existe
                        $stmt = $this->db->prepare("SELECT id FROM usuarios WHERE email = :email");
                        $stmt->execute(['email' => $email]);
                        if ($stmt->fetch()) {
                            // Email já existe, não criar
                            $this->db->rollBack();
                            $resultados[] = [
                                'temp_id' => $checkinData['temp_id'] ?? null,
                                'success' => false,
                                'error' => 'Email já cadastrado para outro usuário'
                            ];
                            continue;
                        }
                        
                        // Criar usuário
                        $senhaTemporaria = bin2hex(random_bytes(8));
                        $senhaHash = password_hash($senhaTemporaria, PASSWORD_BCRYPT);
                        
                        $stmt = $this->db->prepare("
                            INSERT INTO usuarios (nome, email, senha, cpf, cadastro_completo, created_at)
                            VALUES (:nome, :email, :senha, :cpf, FALSE, CURRENT_TIMESTAMP)
                            RETURNING id
                        ");
                        $stmt->execute([
                            'nome' => $nome,
                            'email' => $email,
                            'senha' => $senhaHash,
                            'cpf' => $dadosUsuario['cpf'] ?? $cpfLimpo
                        ]);
                        $usuario = $stmt->fetch();
                    }
                }

                if (!$usuario) {
                    $this->db->rollBack();
                    $resultados[] = [
                        'temp_id' => $checkinData['temp_id'] ?? null,
                        'success' => false,
                        'error' => 'Usuário não encontrado. É necessário cadastrar o usuário primeiro quando houver conexão.'
                    ];
                    continue;
                }

                $usuarioId = $usuario['id'];

                // Verificar se já tem inscrição
                $stmt = $this->db->prepare("
                    SELECT id, codigo_inscricao, presenca_registrada
                    FROM inscricoes
                    WHERE usuario_id = :usuario_id AND evento_id = :evento_id AND status = 'ativa'
                ");
                $stmt->execute([
                    'usuario_id' => $usuarioId,
                    'evento_id' => $checkinData['evento_id']
                ]);
                $inscricao = $stmt->fetch();

                $inscricaoCriada = false;
                if (!$inscricao) {
                    // Criar inscrição com check-in
                    $codigoInscricao = 'INS-' . date('YmdHis') . '-' . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
                    
                    $stmt = $this->db->prepare("
                        INSERT INTO inscricoes (usuario_id, evento_id, codigo_inscricao, status, data_inscricao, presenca_registrada, data_presenca)
                        VALUES (:usuario_id, :evento_id, :codigo_inscricao, 'ativa', CURRENT_TIMESTAMP, TRUE, CURRENT_TIMESTAMP)
                        RETURNING id, codigo_inscricao
                    ");
                    $stmt->execute([
                        'usuario_id' => $usuarioId,
                        'evento_id' => $checkinData['evento_id'],
                        'codigo_inscricao' => $codigoInscricao
                    ]);
                    $inscricao = $stmt->fetch();
                    $inscricaoCriada = true;

                    // Enviar email de inscrição
                    EmailService::adicionarFila('inscricao', $usuarioId, $checkinData['evento_id'], [
                        'codigo_inscricao' => $codigoInscricao
                    ]);
                } else if (!$inscricao['presenca_registrada']) {
                    // Registrar presença
                    $this->inscricaoModel->registrarPresenca($inscricao['codigo_inscricao']);
                }

                $this->db->commit();

                // Enviar email de check-in
                EmailService::adicionarFila('checkin', $usuarioId, $checkinData['evento_id']);

                $resultados[] = [
                    'temp_id' => $checkinData['temp_id'] ?? null,
                    'success' => true,
                    'inscricao_criada' => $inscricaoCriada,
                    'inscricao_id' => $inscricao['id']
                ];

            } catch (PDOException $e) {
                $this->db->rollBack();
                $resultados[] = [
                    'temp_id' => $checkinData['temp_id'] ?? null,
                    'success' => false,
                    'error' => $e->getMessage()
                ];
            }
        }

        echo json_encode([
            'message' => 'Sincronização de check-ins concluída',
            'resultados' => $resultados
        ]);
    }
}

