<?php

// TCPDF será instalado via composer se necessário
// require_once __DIR__ . '/../vendor/autoload.php';

class Certificado {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function emitir($inscricaoId) {
        // Verificar se a inscrição existe e tem presença registrada
        $stmt = $this->db->prepare("
            SELECT i.id, i.usuario_id, i.presenca_registrada,
                   u.nome as usuario_nome,
                   e.titulo as evento_titulo, e.data_inicio, e.data_fim
            FROM inscricoes i
            INNER JOIN usuarios u ON i.usuario_id = u.id
            INNER JOIN eventos e ON i.evento_id = e.id
            WHERE i.id = :inscricao_id AND i.status = 'ativa'
        ");
        $stmt->execute(['inscricao_id' => $inscricaoId]);
        $inscricao = $stmt->fetch();

        if (!$inscricao) {
            return ['success' => false, 'message' => 'Inscrição não encontrada'];
        }

        if (!$inscricao['presenca_registrada']) {
            return ['success' => false, 'message' => 'Presença não registrada para esta inscrição'];
        }

        // Verificar se já existe certificado
        $stmt = $this->db->prepare("SELECT id, codigo_validacao FROM certificados WHERE inscricao_id = :inscricao_id");
        $stmt->execute(['inscricao_id' => $inscricaoId]);
        $certificadoExistente = $stmt->fetch();

        if ($certificadoExistente) {
            return [
                'success' => true,
                'message' => 'Certificado já existe',
                'data' => [
                    'id' => $certificadoExistente['id'],
                    'codigo_validacao' => $certificadoExistente['codigo_validacao']
                ]
            ];
        }

        // Gerar código de validação único
        $codigoValidacao = 'CERT-' . strtoupper(bin2hex(random_bytes(16)));

        try {
            $this->db->beginTransaction();

            // Criar diretório de certificados se não existir
            $certDir = __DIR__ . '/../certificados/';
            if (!is_dir($certDir)) {
                mkdir($certDir, 0755, true);
            }

            // Gerar PDF
            $nomeArquivo = 'certificado_' . $inscricaoId . '_' . time() . '.pdf';
            $caminhoArquivo = $certDir . $nomeArquivo;
            
            $this->gerarPDF($inscricao, $codigoValidacao, $caminhoArquivo);

            // Salvar no banco
            $stmt = $this->db->prepare("
                INSERT INTO certificados (inscricao_id, codigo_validacao, caminho_arquivo, data_emissao)
                VALUES (:inscricao_id, :codigo_validacao, :caminho_arquivo, CURRENT_TIMESTAMP)
                RETURNING id, codigo_validacao, data_emissao
            ");
            $stmt->execute([
                'inscricao_id' => $inscricaoId,
                'codigo_validacao' => $codigoValidacao,
                'caminho_arquivo' => $caminhoArquivo
            ]);

            $certificado = $stmt->fetch();
            $this->db->commit();

            return [
                'success' => true,
                'data' => [
                    'id' => $certificado['id'],
                    'codigo_validacao' => $certificado['codigo_validacao'],
                    'data_emissao' => $certificado['data_emissao'],
                    'arquivo' => '/api/certificados/download/' . $certificado['id']
                ]
            ];
        } catch (Exception $e) {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'Erro ao emitir certificado: ' . $e->getMessage()];
        }
    }

    public function validar($codigoValidacao) {
        $stmt = $this->db->prepare("
            SELECT c.*, i.codigo_inscricao,
                   u.nome as usuario_nome, u.email as usuario_email,
                   e.titulo as evento_titulo, e.data_inicio
            FROM certificados c
            INNER JOIN inscricoes i ON c.inscricao_id = i.id
            INNER JOIN usuarios u ON i.usuario_id = u.id
            INNER JOIN eventos e ON i.evento_id = e.id
            WHERE c.codigo_validacao = :codigo
        ");
        $stmt->execute(['codigo' => $codigoValidacao]);
        return $stmt->fetch();
    }

    public function obterPorId($id) {
        $stmt = $this->db->prepare("
            SELECT c.*, i.codigo_inscricao,
                   u.nome as usuario_nome,
                   e.titulo as evento_titulo
            FROM certificados c
            INNER JOIN inscricoes i ON c.inscricao_id = i.id
            INNER JOIN usuarios u ON i.usuario_id = u.id
            INNER JOIN eventos e ON i.evento_id = e.id
            WHERE c.id = :id
        ");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function obterPorInscricaoId($inscricaoId) {
        $stmt = $this->db->prepare("
            SELECT c.*, i.codigo_inscricao,
                   u.nome as usuario_nome,
                   e.titulo as evento_titulo
            FROM certificados c
            INNER JOIN inscricoes i ON c.inscricao_id = i.id
            INNER JOIN usuarios u ON i.usuario_id = u.id
            INNER JOIN eventos e ON i.evento_id = e.id
            WHERE i.id = :inscricao_id
        ");
        $stmt->execute(['inscricao_id' => $inscricaoId]);
        return $stmt->fetch();
    }

    private function gerarPDF($inscricao, $codigoValidacao, $caminhoArquivo) {
        // Gerar PDF simples usando funções nativas do PHP
        // Em produção, instale TCPDF via composer: composer require tecnickcom/tcpdf
        $this->gerarPDFSimples($inscricao, $codigoValidacao, $caminhoArquivo);
    }

    private function gerarPDFSimples($inscricao, $codigoValidacao, $caminhoArquivo) {
        // PDF básico usando funções nativas
        // Nota: Para produção, use TCPDF ou FPDF instalado via composer
        $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Certificado de Participação</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                h1 { color: #333; }
                .certificado { border: 5px solid #667eea; padding: 40px; margin: 20px; }
                .codigo { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class='certificado'>
                <h1>CERTIFICADO DE PARTICIPAÇÃO</h1>
                <p>Certificamos que</p>
                <h2>{$inscricao['usuario_nome']}</h2>
                <p>participou do evento</p>
                <h3>{$inscricao['evento_titulo']}</h3>
                <p>realizado em " . date('d/m/Y', strtotime($inscricao['data_inicio'])) . "</p>
                <div class='codigo'>
                    <p>Código de Validação: <strong>{$codigoValidacao}</strong></p>
                    <p>Emitido em " . date('d/m/Y H:i:s') . "</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        // Salvar como HTML (em produção, converter para PDF usando biblioteca como TCPDF)
        // Por enquanto, salvar como HTML. Para produção, instale TCPDF via composer
        file_put_contents($caminhoArquivo . '.html', $html);
        
        // Para produção real com TCPDF, descomente e ajuste:
        /*
        require_once __DIR__ . '/../vendor/autoload.php';
        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $pdf->SetCreator('Sistema de Eventos');
        $pdf->SetAuthor('Sistema de Eventos');
        $pdf->SetTitle('Certificado de Participação');
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->AddPage();
        $pdf->SetFont('helvetica', 'B', 24);
        $pdf->Cell(0, 20, 'CERTIFICADO DE PARTICIPAÇÃO', 0, 1, 'C');
        $pdf->Ln(10);
        $pdf->SetFont('helvetica', '', 14);
        $texto = "Certificamos que\n\n" . $inscricao['usuario_nome'] . "\n\nparticipou do evento\n\n" . 
                 $inscricao['evento_titulo'] . "\n\nrealizado em " . date('d/m/Y', strtotime($inscricao['data_inicio'])) . 
                 "\n\nCódigo de Validação: " . $codigoValidacao;
        $pdf->MultiCell(0, 10, $texto, 0, 'C');
        $pdf->Output($caminhoArquivo, 'F');
        */
    }
}

