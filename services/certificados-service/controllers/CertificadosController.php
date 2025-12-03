<?php

require_once __DIR__ . '/../models/Certificado.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../services/EmailService.php';

class CertificadosController {
    private $db;
    private $certificadoModel;

    public function __construct($db) {
        $this->db = $db;
        $this->certificadoModel = new Certificado($db);
    }

    public function emitirCertificado() {
        $usuarioId = obterUsuarioIdDoToken();
        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(['message' => 'Token inválido ou ausente']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['inscricao_id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'inscricao_id é obrigatório']);
            return;
        }

        // Verificar se a inscrição pertence ao usuário
        $stmt = $this->db->prepare("SELECT id, evento_id FROM inscricoes WHERE id = :id AND usuario_id = :usuario_id");
        $stmt->execute(['id' => $data['inscricao_id'], 'usuario_id' => $usuarioId]);
        $inscricao = $stmt->fetch();

        if (!$inscricao) {
            http_response_code(404);
            echo json_encode(['message' => 'Inscrição não encontrada']);
            return;
        }

        $resultado = $this->certificadoModel->emitir($data['inscricao_id']);

        if (!$resultado['success']) {
            http_response_code(400);
            echo json_encode($resultado);
            return;
        }

        // Adicionar à fila de email
        EmailService::adicionarFila('certificado', $usuarioId, $inscricao['evento_id'], [
            'codigo_validacao' => $resultado['data']['codigo_validacao']
        ]);

        echo json_encode([
            'message' => 'Certificado emitido com sucesso',
            'data' => $resultado['data']
        ]);
    }

    public function validarCertificado() {
        $codigo = $_GET['codigo'] ?? null;
        
        if (!$codigo) {
            http_response_code(400);
            echo json_encode(['message' => 'Código de validação é obrigatório']);
            return;
        }

        $certificado = $this->certificadoModel->validar($codigo);

        if (!$certificado) {
            http_response_code(404);
            echo json_encode([
                'valido' => false,
                'message' => 'Certificado não encontrado ou código inválido'
            ]);
            return;
        }

        echo json_encode([
            'valido' => true,
            'data' => [
                'usuario_nome' => $certificado['usuario_nome'],
                'evento_titulo' => $certificado['evento_titulo'],
                'data_emissao' => $certificado['data_emissao'],
                'data_evento' => $certificado['data_inicio']
            ]
        ]);
    }

    public function obterCertificado($id) {
        $certificado = $this->certificadoModel->obterPorId($id);

        if (!$certificado) {
            http_response_code(404);
            echo json_encode(['message' => 'Certificado não encontrado']);
            return;
        }

        echo json_encode($certificado);
    }
}

