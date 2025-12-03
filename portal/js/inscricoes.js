// Funções relacionadas a inscrições
async function carregarMinhasInscricoes() {
    const inscricoesList = document.getElementById('inscricoesList');
    inscricoesList.innerHTML = '<div class="loading">Carregando inscrições...</div>';

    try {
        const data = await apiRequest(`${API_CONFIG.INSCRICOES}`);
        
        if (data.inscricoes && data.inscricoes.length > 0) {
            inscricoesList.innerHTML = '';
            
            data.inscricoes.forEach(inscricao => {
                inscricoesList.appendChild(criarItemInscricao(inscricao));
            });
        } else {
            inscricoesList.innerHTML = '<p>Você não possui inscrições.</p>';
        }
    } catch (error) {
        inscricoesList.innerHTML = `<div class="message error">${error.message}</div>`;
    }
}

function criarItemInscricao(inscricao) {
    const item = document.createElement('div');
    item.className = 'inscricao-item';
    
    const dataInscricao = new Date(inscricao.data_inscricao).toLocaleDateString('pt-BR');
    const dataEvento = new Date(inscricao.evento_data_inicio).toLocaleDateString('pt-BR');
    
    item.innerHTML = `
        <div class="info">
            <h3>${inscricao.evento_titulo}</h3>
            <p><strong>Código:</strong> ${inscricao.codigo_inscricao}</p>
            <p><strong>Data da Inscrição:</strong> ${dataInscricao}</p>
            <p><strong>Data do Evento:</strong> ${dataEvento}</p>
            <p><strong>Status:</strong> ${inscricao.status}</p>
            ${inscricao.presenca_registrada ? '<p style="color: green;"><strong>✓ Presença Registrada</strong></p>' : ''}
        </div>
        <div class="actions">
            ${inscricao.status === 'ativa' && !inscricao.presenca_registrada ? 
                `<button onclick="registrarPresenca('${inscricao.codigo_inscricao}')" class="btn btn-success">Registrar Presença</button>
                 <button onclick="cancelarInscricao(${inscricao.id})" class="btn btn-danger">Cancelar</button>` : 
                ''}
            ${inscricao.presenca_registrada ? 
                `<button onclick="emitirCertificado(${inscricao.id})" class="btn btn-primary">Emitir Certificado</button>` : 
                ''}
        </div>
    `;
    
    return item;
}

async function cancelarInscricao(inscricaoId) {
    if (!confirm('Tem certeza que deseja cancelar esta inscrição?')) {
        return;
    }

    try {
        if (isOnline()) {
            await apiRequest(`${API_CONFIG.INSCRICOES}/${inscricaoId}`, {
                method: 'PUT'
            });
            mostrarMensagem('Inscrição cancelada com sucesso!', 'success');
        } else {
            // Modo offline
            await offlineDB.adicionarCancelamentoPendente(inscricaoId);
            mostrarMensagem('Cancelamento salvo localmente. Será sincronizado quando a conexão for restaurada.', 'info');
        }
        
        carregarMinhasInscricoes();
    } catch (error) {
        mostrarMensagem(error.message || 'Erro ao cancelar inscrição', 'error');
    }
}

async function registrarPresenca(codigoInscricao) {
    try {
        if (isOnline()) {
            await apiRequest(`${API_CONFIG.INSCRICOES}/presenca`, {
                method: 'POST',
                body: JSON.stringify({ codigo_inscricao: codigoInscricao })
            });
            mostrarMensagem('Presença registrada com sucesso!', 'success');
        } else {
            // Modo offline
            await offlineDB.adicionarPresencaPendente(codigoInscricao);
            mostrarMensagem('Presença salva localmente. Será sincronizada quando a conexão for restaurada.', 'info');
        }
        
        carregarMinhasInscricoes();
    } catch (error) {
        mostrarMensagem(error.message || 'Erro ao registrar presença', 'error');
    }
}

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    switch(section) {
        case 'eventos':
            document.getElementById('eventosSection').classList.add('active');
            carregarEventos();
            break;
        case 'minhasInscricoes':
            document.getElementById('minhasInscricoesSection').classList.add('active');
            carregarMinhasInscricoes();
            break;
        case 'certificados':
            document.getElementById('certificadosSection').classList.add('active');
            carregarCertificados();
            break;
    }
}

