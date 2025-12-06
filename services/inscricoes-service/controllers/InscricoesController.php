<?php

require_once __DIR__ . '/../models/Inscricao.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../services/EmailService.php';

class InscricoesController {
    private $db;
    private $inscricaoModel;

    public function __construct($db) {
        $this->db = $db;
        $this->inscricaoModel = new Inscricao($db);
    }

    public function registrarInscricao() {
        $usuarioId = obterUsuarioIdDoToken();
        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(['message' => 'Token inválido ou ausente']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['evento_id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'evento_id é obrigatório']);
            return;
        }

        $resultado = $this->inscricaoModel->criar($usuarioId, $data['evento_id']);

        if (!$resultado['success']) {
            http_response_code(400);
            echo json_encode($resultado);
            return;
        }

        // Adicionar à fila de email
        $this->enviarEmailInscricao($usuarioId, $data['evento_id'], $resultado['data']['codigo_inscricao']);

        http_response_code(201);
        echo json_encode([
            'message' => 'Inscrição realizada com sucesso',
            'data' => $resultado['data']
        ]);
    }

    public function consultarInscricoes() {
        $usuarioId = obterUsuarioIdDoToken();
        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(['message' => 'Token inválido ou ausente']);
            return;
        }

        $inscricoes = $this->inscricaoModel->consultarPorUsuario($usuarioId);
        
        echo json_encode([
            'total' => count($inscricoes),
            'inscricoes' => $inscricoes
        ]);
    }

    public function consultarInscricao($id) {
        $usuarioId = obterUsuarioIdDoToken();
        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(['message' => 'Token inválido ou ausente']);
            return;
        }

        $inscricao = $this->inscricaoModel->consultarPorId($id);
        
        if (!$inscricao || $inscricao['usuario_id'] != $usuarioId) {
            http_response_code(404);
            echo json_encode(['message' => 'Inscrição não encontrada']);
            return;
        }

        echo json_encode($inscricao);
    }

    public function cancelarInscricao($id) {
        $usuarioId = obterUsuarioIdDoToken();
        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(['message' => 'Token inválido ou ausente']);
            return;
        }

        $inscricao = $this->inscricaoModel->cancelar($id, $usuarioId);
        
        if (!$inscricao) {
            http_response_code(404);
            echo json_encode(['message' => 'Inscrição não encontrada ou já cancelada']);
            return;
        }

        // Adicionar à fila de email
        $this->enviarEmailCancelamento($usuarioId, $inscricao['evento_id']);

        echo json_encode([
            'message' => 'Inscrição cancelada com sucesso',
            'data' => $inscricao
        ]);
    }

    public function registrarPresenca() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['codigo_inscricao'])) {
            http_response_code(400);
            echo json_encode(['message' => 'codigo_inscricao é obrigatório']);
            return;
        }

        $inscricao = $this->inscricaoModel->registrarPresenca($data['codigo_inscricao']);
        
        if (!$inscricao) {
            http_response_code(404);
            echo json_encode(['message' => 'Inscrição não encontrada ou presença já registrada']);
            return;
        }

        // Adicionar à fila de email
        $this->enviarEmailCheckin($inscricao['usuario_id'], $inscricao['evento_id']);

        echo json_encode([
            'message' => 'Presença registrada com sucesso',
            'data' => $inscricao
        ]);
    }

    public function sincronizarInscricoes() {
        $usuarioId = obterUsuarioIdDoToken();
        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(['message' => 'Token inválido ou ausente']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['inscricoes']) || !is_array($data['inscricoes'])) {
            http_response_code(400);
            echo json_encode(['message' => 'inscricoes é obrigatório e deve ser um array']);
            return;
        }

        $resultados = $this->inscricaoModel->sincronizarInscricoes($data['inscricoes']);
        
        echo json_encode([
            'message' => 'Sincronização concluída',
            'resultados' => $resultados
        ]);
    }

    public function sincronizarPresencas() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['presencas']) || !is_array($data['presencas'])) {
            http_response_code(400);
            echo json_encode(['message' => 'presencas é obrigatório e deve ser um array']);
            return;
        }

        $resultados = [];
        foreach ($data['presencas'] as $presenca) {
            $inscricao = $this->inscricaoModel->registrarPresenca($presenca['codigo_inscricao']);
            $resultados[] = [
                'temp_id' => $presenca['temp_id'] ?? null,
                'success' => $inscricao !== false,
                'data' => $inscricao
            ];
        }

        echo json_encode([
            'message' => 'Sincronização de presenças concluída',
            'resultados' => $resultados
        ]);
    }

    public function sincronizarCancelamentos() {
        $usuarioId = obterUsuarioIdDoToken();
        if (!$usuarioId) {
            http_response_code(401);
            echo json_encode(['message' => 'Token inválido ou ausente']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['cancelamentos']) || !is_array($data['cancelamentos'])) {
            http_response_code(400);
            echo json_encode(['message' => 'cancelamentos é obrigatório e deve ser um array']);
            return;
        }

        $resultados = [];
        foreach ($data['cancelamentos'] as $cancelamento) {
            $inscricao = $this->inscricaoModel->cancelar($cancelamento['inscricao_id'], $usuarioId);
            $resultados[] = [
                'temp_id' => $cancelamento['temp_id'] ?? null,
                'success' => $inscricao !== false,
                'data' => $inscricao
            ];
        }

        echo json_encode([
            'message' => 'Sincronização de cancelamentos concluída',
            'resultados' => $resultados
        ]);
    }

    private function enviarEmailInscricao($usuarioId, $eventoId, $codigoInscricao) {
        EmailService::adicionarFila('inscricao', $usuarioId, $eventoId, ['codigo_inscricao' => $codigoInscricao]);
    }

    private function enviarEmailCancelamento($usuarioId, $eventoId) {
        EmailService::adicionarFila('cancelamento', $usuarioId, $eventoId);
    }

    private function enviarEmailCheckin($usuarioId, $eventoId) {
        EmailService::adicionarFila('checkin', $usuarioId, $eventoId);
    }
}





