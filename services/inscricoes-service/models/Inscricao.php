<?php

class Inscricao {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function criar($usuarioId, $eventoId) {
        // Verificar se já existe inscrição
        $stmt = $this->db->prepare("
            SELECT id FROM inscricoes 
            WHERE usuario_id = :usuario_id AND evento_id = :evento_id
        ");
        $stmt->execute(['usuario_id' => $usuarioId, 'evento_id' => $eventoId]);
        
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'Usuário já está inscrito neste evento'];
        }

        // Verificar vagas disponíveis
        $stmt = $this->db->prepare("
            SELECT vagas_disponiveis FROM eventos WHERE id = :evento_id
        ");
        $stmt->execute(['evento_id' => $eventoId]);
        $evento = $stmt->fetch();
        
        if (!$evento) {
            return ['success' => false, 'message' => 'Evento não encontrado'];
        }

        if ($evento['vagas_disponiveis'] <= 0) {
            return ['success' => false, 'message' => 'Não há vagas disponíveis'];
        }

        // Gerar código de inscrição
        $codigoInscricao = 'INS-' . date('YmdHis') . '-' . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                INSERT INTO inscricoes (usuario_id, evento_id, codigo_inscricao, status, data_inscricao)
                VALUES (:usuario_id, :evento_id, :codigo_inscricao, 'ativa', CURRENT_TIMESTAMP)
                RETURNING id, codigo_inscricao, data_inscricao
            ");
            $stmt->execute([
                'usuario_id' => $usuarioId,
                'evento_id' => $eventoId,
                'codigo_inscricao' => $codigoInscricao
            ]);

            $inscricao = $stmt->fetch();
            $this->db->commit();

            return ['success' => true, 'data' => $inscricao];
        } catch (PDOException $e) {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'Erro ao criar inscrição: ' . $e->getMessage()];
        }
    }

    public function consultarPorId($id) {
        $stmt = $this->db->prepare("
            SELECT i.*, u.nome as usuario_nome, u.email as usuario_email,
                   e.titulo as evento_titulo, e.data_inicio, e.data_fim, e.localizacao
            FROM inscricoes i
            INNER JOIN usuarios u ON i.usuario_id = u.id
            INNER JOIN eventos e ON i.evento_id = e.id
            WHERE i.id = :id
        ");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function consultarPorUsuario($usuarioId) {
        $stmt = $this->db->prepare("
            SELECT i.*, e.titulo as evento_titulo, e.data_inicio, e.data_fim, 
                   e.localizacao, e.categoria, e.status as evento_status
            FROM inscricoes i
            INNER JOIN eventos e ON i.evento_id = e.id
            WHERE i.usuario_id = :usuario_id
            ORDER BY i.data_inscricao DESC
        ");
        $stmt->execute(['usuario_id' => $usuarioId]);
        return $stmt->fetchAll();
    }

    public function cancelar($id, $usuarioId) {
        // Primeiro, buscar os dados da inscrição antes de deletar
        $stmt = $this->db->prepare("
            SELECT id, evento_id, usuario_id
            FROM inscricoes 
            WHERE id = :id AND usuario_id = :usuario_id AND status = 'ativa'
        ");
        $stmt->execute(['id' => $id, 'usuario_id' => $usuarioId]);
        $inscricao = $stmt->fetch();
        
        if (!$inscricao) {
            return false;
        }
        
        // Deletar a inscrição (isso vai liberar a vaga através do trigger)
        $stmt = $this->db->prepare("
            DELETE FROM inscricoes 
            WHERE id = :id AND usuario_id = :usuario_id
        ");
        $stmt->execute(['id' => $id, 'usuario_id' => $usuarioId]);
        
        return $inscricao;
    }

    public function registrarPresenca($codigoInscricao) {
        $stmt = $this->db->prepare("
            UPDATE inscricoes 
            SET presenca_registrada = TRUE, data_presenca = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE codigo_inscricao = :codigo AND status = 'ativa' AND presenca_registrada = FALSE
            RETURNING id, usuario_id, evento_id
        ");
        $stmt->execute(['codigo' => $codigoInscricao]);
        return $stmt->fetch();
    }

    public function sincronizarInscricoes($inscricoes) {
        $resultados = [];
        
        foreach ($inscricoes as $inscricao) {
            $resultado = $this->criar($inscricao['usuario_id'], $inscricao['evento_id']);
            $resultados[] = [
                'temp_id' => $inscricao['temp_id'] ?? null,
                'success' => $resultado['success'],
                'data' => $resultado['data'] ?? null,
                'message' => $resultado['message'] ?? null
            ];
        }
        
        return $resultados;
    }
}





