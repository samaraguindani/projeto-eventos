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
    
    // Verificar se está logado
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    
    if (!token || !usuario) {
        // Usuário não logado - mostrar apenas validação pública
        certificadosList.innerHTML = `
            <div class="validacao-publica">
                <h2>Validar Certificado</h2>
                <p>Digite o código de validação do certificado para verificar sua autenticidade.</p>
                <div class="form-group" style="max-width: 400px; margin: 20px auto;">
                    <label>Código de Validação:</label>
                    <input type="text" id="codigoValidacaoPublico" class="form-control" 
                           placeholder="CERT-XXXXXXXX" style="text-transform: uppercase;">
                    <button onclick="validarCertificadoPublico()" class="btn btn-primary" style="margin-top: 10px; width: 100%;">
                        Validar Certificado
                    </button>
                </div>
                <div id="resultadoValidacaoPublico" style="margin-top: 20px;"></div>
            </div>
        `;
        return;
    }

    // Usuário logado - mostrar seus certificados
    certificadosList.innerHTML = '<div class="loading">Carregando certificados...</div>';

    // Buscar certificados através das inscrições com presença
    try {
        const inscricoes = await apiRequest(`${API_CONFIG.INSCRICOES}`);
        const inscricoesComPresenca = inscricoes.inscricoes.filter(i => i.presenca_registrada);
        
        if (inscricoesComPresenca.length === 0) {
            certificadosList.innerHTML = `
                <p>Você não possui certificados disponíveis.</p>
                <hr style="margin: 30px 0;">
                <h3>Validar Certificado de Outro Participante</h3>
                <div class="form-group" style="max-width: 400px; margin: 20px auto;">
                    <label>Código de Validação:</label>
                    <input type="text" id="codigoValidacaoPublico" class="form-control" 
                           placeholder="CERT-XXXXXXXX" style="text-transform: uppercase;">
                    <button onclick="validarCertificadoPublico()" class="btn btn-primary" style="margin-top: 10px; width: 100%;">
                        Validar Certificado
                    </button>
                </div>
                <div id="resultadoValidacaoPublico" style="margin-top: 20px;"></div>
            `;
            return;
        }

        certificadosList.innerHTML = '';
        
        for (const inscricao of inscricoesComPresenca) {
            try {
                // Tentar buscar certificado usando o ID da inscrição
                const certificado = await apiRequest(`${API_CONFIG.CERTIFICADOS}/inscricao/${inscricao.id}`);
                certificadosList.appendChild(criarItemCertificado(certificado, inscricao));
            } catch (error) {
                // Certificado ainda não emitido
                certificadosList.appendChild(criarItemCertificadoPendente(inscricao));
            }
        }
        
        // Adicionar seção de validação pública no final
        const validacaoDiv = document.createElement('div');
        validacaoDiv.style.marginTop = '40px';
        validacaoDiv.style.paddingTop = '20px';
        validacaoDiv.style.borderTop = '2px solid #ddd';
        validacaoDiv.innerHTML = `
            <h3>Validar Certificado de Outro Participante</h3>
            <div class="form-group" style="max-width: 400px; margin: 20px auto;">
                <label>Código de Validação:</label>
                <input type="text" id="codigoValidacaoPublico" class="form-control" 
                       placeholder="CERT-XXXXXXXX" style="text-transform: uppercase;">
                <button onclick="validarCertificadoPublico()" class="btn btn-primary" style="margin-top: 10px; width: 100%;">
                    Validar Certificado
                </button>
            </div>
            <div id="resultadoValidacaoPublico" style="margin-top: 20px;"></div>
        `;
        certificadosList.appendChild(validacaoDiv);
        
    } catch (error) {
        certificadosList.innerHTML = `<div class="message error">${error.message}</div>`;
    }
}

async function validarCertificadoPublico() {
    const codigo = document.getElementById('codigoValidacaoPublico').value.trim().toUpperCase();
    const resultadoDiv = document.getElementById('resultadoValidacaoPublico');
    
    if (!codigo) {
        resultadoDiv.innerHTML = '<div class="message error">Por favor, informe o código de validação</div>';
        return;
    }

    try {
        // Validação pública - não precisa de token
        const response = await fetch(`${API_CONFIG.CERTIFICADOS}/validar?codigo=${encodeURIComponent(codigo)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (response.ok && data.valido) {
            resultadoDiv.innerHTML = `
                <div class="message success">
                    <h4>✓ Certificado Válido!</h4>
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
        resultadoDiv.innerHTML = `<div class="message error">Erro ao validar certificado: ${error.message}</div>`;
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
        <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button onclick="downloadCertificado(${certificado.id})" class="btn btn-success">
                📥 Baixar Certificado
            </button>
            <button onclick="validarCertificadoModal('${certificado.codigo_validacao}')" class="btn btn-primary">
                Validar Certificado
            </button>
        </div>
    `;
    
    return item;
}

async function downloadCertificado(certificadoId) {
    try {
        const token = localStorage.getItem('token');
        
        // Fazer download do arquivo
        const response = await fetch(`${API_CONFIG.CERTIFICADOS}/download/${certificadoId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao baixar certificado');
        }

        // Obter o conteúdo do arquivo
        const texto = await response.text();
        
        // Criar blob e fazer download
        const blob = new Blob([texto], { type: 'text/plain; charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificado_${certificadoId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        mostrarMensagem('Certificado baixado com sucesso!', 'success');
        
    } catch (error) {
        mostrarMensagem(error.message || 'Erro ao baixar certificado', 'error');
    }
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





