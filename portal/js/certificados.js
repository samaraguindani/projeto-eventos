// Funções relacionadas a certificados
async function emitirCertificado(inscricaoId) {
    try {
        const data = await apiRequest(`${API_CONFIG.CERTIFICADOS}/emitir`, {
            method: 'POST',
            body: JSON.stringify({ inscricao_id: inscricaoId })
        });
        
        mostrarMensagem('Certificado emitido com sucesso!', 'success');
        carregarCertificados();
    } catch (error) {
        mostrarMensagem(error.message || 'Erro ao emitir certificado', 'error');
    }
}

async function carregarCertificados() {
    const certificadosList = document.getElementById('certificadosList');
    certificadosList.innerHTML = '<div class="loading">Carregando certificados...</div>';

    // Buscar certificados através das inscrições com presença
    try {
        const inscricoes = await apiRequest(`${API_CONFIG.INSCRICOES}`);
        const inscricoesComPresenca = inscricoes.inscricoes.filter(i => i.presenca_registrada);
        
        if (inscricoesComPresenca.length === 0) {
            certificadosList.innerHTML = '<p>Você não possui certificados disponíveis.</p>';
            return;
        }

        certificadosList.innerHTML = '';
        
        for (const inscricao of inscricoesComPresenca) {
            try {
                // Tentar buscar certificado
                const certificado = await apiRequest(`${API_CONFIG.CERTIFICADOS}/${inscricao.id}`);
                certificadosList.appendChild(criarItemCertificado(certificado, inscricao));
            } catch (error) {
                // Certificado ainda não emitido
                certificadosList.appendChild(criarItemCertificadoPendente(inscricao));
            }
        }
    } catch (error) {
        certificadosList.innerHTML = `<div class="message error">${error.message}</div>`;
    }
}

function criarItemCertificado(certificado, inscricao) {
    const item = document.createElement('div');
    item.className = 'certificado-item';
    
    const dataEmissao = new Date(certificado.data_emissao).toLocaleDateString('pt-BR');
    
    item.innerHTML = `
        <h3>${inscricao.evento_titulo}</h3>
        <p><strong>Código de Validação:</strong> ${certificado.codigo_validacao}</p>
        <p><strong>Data de Emissão:</strong> ${dataEmissao}</p>
        <div style="margin-top: 15px;">
            <button onclick="validarCertificadoModal('${certificado.codigo_validacao}')" class="btn btn-primary">Validar Certificado</button>
        </div>
    `;
    
    return item;
}

function criarItemCertificadoPendente(inscricao) {
    const item = document.createElement('div');
    item.className = 'certificado-item';
    
    item.innerHTML = `
        <h3>${inscricao.evento_titulo}</h3>
        <p>Certificado disponível para emissão</p>
        <button onclick="emitirCertificado(${inscricao.id})" class="btn btn-primary">Emitir Certificado</button>
    `;
    
    return item;
}

function validarCertificadoModal(codigo = null) {
    const modal = document.getElementById('modalValidacao');
    const codigoInput = document.getElementById('codigoValidacao');
    
    if (codigo) {
        codigoInput.value = codigo;
    }
    
    modal.style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function validarCertificado() {
    const codigo = document.getElementById('codigoValidacao').value;
    const resultadoDiv = document.getElementById('resultadoValidacao');
    
    if (!codigo) {
        resultadoDiv.innerHTML = '<div class="message error">Por favor, informe o código de validação</div>';
        return;
    }

    try {
        const data = await apiRequest(`${API_CONFIG.CERTIFICADOS}/validar?codigo=${codigo}`);
        
        if (data.valido) {
            resultadoDiv.innerHTML = `
                <div class="message success">
                    <h4>Certificado Válido!</h4>
                    <p><strong>Usuário:</strong> ${data.data.usuario_nome}</p>
                    <p><strong>Evento:</strong> ${data.data.evento_titulo}</p>
                    <p><strong>Data do Evento:</strong> ${new Date(data.data.data_evento).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Data de Emissão:</strong> ${new Date(data.data.data_emissao).toLocaleDateString('pt-BR')}</p>
                </div>
            `;
        } else {
            resultadoDiv.innerHTML = '<div class="message error">Certificado inválido ou não encontrado</div>';
        }
    } catch (error) {
        resultadoDiv.innerHTML = `<div class="message error">${error.message}</div>`;
    }
}

