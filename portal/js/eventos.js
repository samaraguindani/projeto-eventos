// Funções relacionadas a eventos
async function carregarEventos() {
    const eventosList = document.getElementById('eventosList');
    eventosList.innerHTML = '<div class="loading">Carregando eventos...</div>';

    try {
        let eventos = [];
        
        if (isOnline()) {
            // Online: buscar do servidor
            const data = await apiRequest(`${API_CONFIG.EVENTOS}/eventos`);
            eventos = data.eventos || [];
            
            // Salvar no cache para uso offline
            if (eventos.length > 0) {
                await offlineDB.init();
                await offlineDB.salvarEventosCache(eventos);
            }
        } else {
            // Offline: usar cache
            await offlineDB.init();
            eventos = await offlineDB.obterEventosCache();
            
            if (eventos.length === 0) {
                eventosList.innerHTML = '<div class="message warning">Nenhum evento em cache. Conecte-se à internet para carregar eventos.</div>';
                return;
            }
        }
        
        if (eventos.length > 0) {
            eventosList.innerHTML = '';
            
            // Preencher filtro de categorias
            const categorias = [...new Set(eventos.map(e => e.categoria).filter(Boolean))];
            const filtroCategoria = document.getElementById('filtroCategoria');
            if (filtroCategoria) {
                // Limpar opções existentes (exceto a primeira)
                while (filtroCategoria.children.length > 1) {
                    filtroCategoria.removeChild(filtroCategoria.lastChild);
                }
                categorias.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat;
                    option.textContent = cat;
                    filtroCategoria.appendChild(option);
                });
            }
            
            eventos.forEach(evento => {
                eventosList.appendChild(criarCardEvento(evento));
            });
        } else {
            eventosList.innerHTML = '<p>Nenhum evento encontrado.</p>';
        }
    } catch (error) {
        // Se falhar online, tentar cache
        if (isOnline()) {
            try {
                await offlineDB.init();
                const eventos = await offlineDB.obterEventosCache();
                if (eventos.length > 0) {
                    eventosList.innerHTML = '';
                    eventos.forEach(evento => {
                        eventosList.appendChild(criarCardEvento(evento));
                    });
                    mostrarMensagem('Usando eventos em cache devido a erro na conexão', 'warning');
                    return;
                }
            } catch (cacheError) {
                console.error('Erro ao carregar cache:', cacheError);
            }
        }
        eventosList.innerHTML = `<div class="message error">${error.message}</div>`;
    }
}

function criarCardEvento(evento) {
    const card = document.createElement('div');
    card.className = 'evento-card';
    card.onclick = () => mostrarDetalhesEvento(evento);
    
    const dataInicio = new Date(evento.data_inicio).toLocaleDateString('pt-BR');
    const dataFim = new Date(evento.data_fim).toLocaleDateString('pt-BR');
    
    const numeroParticipantes = evento.numero_participantes || 0;
    
    card.innerHTML = `
        <h3>${evento.titulo}</h3>
        <div class="evento-info"><strong>Data:</strong> ${dataInicio} - ${dataFim}</div>
        <div class="evento-info"><strong>Local:</strong> ${evento.localizacao || 'A definir'}</div>
        <div class="evento-info"><strong>Participantes:</strong> ${numeroParticipantes}</div>
        <div class="evento-info"><strong>Vagas:</strong> ${evento.vagas_disponiveis || 0} disponíveis</div>
        <div class="evento-info"><strong>Valor:</strong> R$ ${parseFloat(evento.valor_inscricao || 0).toFixed(2)}</div>
        <span class="evento-status ${evento.status}">${evento.status}</span>
    `;
    
    return card;
}

async function mostrarDetalhesEvento(evento) {
    const detalhesSection = document.getElementById('eventoDetalhesSection');
    const detalhesDiv = document.getElementById('eventoDetalhes');
    
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    detalhesSection.classList.add('active');
    
    const dataInicio = new Date(evento.data_inicio).toLocaleString('pt-BR');
    const dataFim = new Date(evento.data_fim).toLocaleString('pt-BR');
    const numeroParticipantes = evento.numero_participantes || 0;
    
    // Verificar se é admin ou atendente
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const isAdminOuAtendente = usuario && (usuario.papel === 'admin' || usuario.papel === 'atendente');
    
    let botoesHtml = '';
    if (isAdminOuAtendente) {
        // Botão único para Admin/Atendente - Check-in faz tudo automaticamente
        botoesHtml = `
            <div style="margin-top: 20px;">
                <button onclick="abrirCheckinEvento(${evento.id}, '${evento.titulo.replace(/'/g, "\\'")}')" class="btn btn-success btn-lg">
                    Check-in de Participante
                </button>
                <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                    <small>O sistema irá automaticamente: verificar participante, inscrever se necessário e registrar o check-in.</small>
                </p>
            </div>
        `;
    } else {
        // Botão para usuário comum
        botoesHtml = `
            <div style="margin-top: 20px;">
                <button onclick="inscreverNoEvento(${evento.id})" class="btn btn-primary">Inscrever-se</button>
            </div>
        `;
    }
    
    detalhesDiv.innerHTML = `
        <div class="evento-card">
            <h2>${evento.titulo}</h2>
            <div class="evento-info"><strong>Descrição:</strong> ${evento.descricao || 'Sem descrição'}</div>
            <div class="evento-info"><strong>Data de Início:</strong> ${dataInicio}</div>
            <div class="evento-info"><strong>Data de Término:</strong> ${dataFim}</div>
            <div class="evento-info"><strong>Local:</strong> ${evento.localizacao || 'A definir'}</div>
            <div class="evento-info"><strong>Capacidade:</strong> ${evento.capacidade_maxima || 'Ilimitada'}</div>
            <div class="evento-info"><strong>Participantes Inscritos:</strong> ${numeroParticipantes}</div>
            <div class="evento-info"><strong>Vagas Disponíveis:</strong> ${evento.vagas_disponiveis || 0}</div>
            <div class="evento-info"><strong>Valor:</strong> R$ ${parseFloat(evento.valor_inscricao || 0).toFixed(2)}</div>
            <div class="evento-info"><strong>Categoria:</strong> ${evento.categoria || 'Sem categoria'}</div>
            ${botoesHtml}
        </div>
    `;
}

// Funções auxiliares para admin/atendente
function abrirCheckinEvento(eventoId, eventoTitulo) {
    // Ir para seção de check-in
    showSection('checkin');
    
    // Selecionar o evento automaticamente
    setTimeout(() => {
        const select = document.getElementById('eventoCheckin');
        if (select) {
            select.value = eventoId;
            selecionarEvento();
            document.getElementById('cpfInput').focus();
        }
    }, 200);
}

// Função removida - não é mais necessária
// O check-in já faz tudo automaticamente: busca, cadastra se necessário, inscreve se necessário e valida entrada

function filtrarEventos() {
    // Implementação simples - em produção, fazer requisição com filtros
    carregarEventos();
}

async function inscreverNoEvento(eventoId) {
    if (!verificarAutenticacao()) {
        mostrarMensagem('Você precisa estar logado para se inscrever', 'error');
        return;
    }

    try {
        if (isOnline()) {
            await apiRequest(`${API_CONFIG.INSCRICOES}`, {
                method: 'POST',
                body: JSON.stringify({ evento_id: eventoId })
            });
            mostrarMensagem('Inscrição realizada com sucesso!', 'success');
        } else {
            // Modo offline - salvar localmente
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            await offlineDB.adicionarInscricaoPendente(usuario.id, eventoId);
            mostrarMensagem('Inscrição salva localmente. Será sincronizada quando a conexão for restaurada.', 'info');
        }
        
        carregarMinhasInscricoes();
    } catch (error) {
        mostrarMensagem(error.message || 'Erro ao realizar inscrição', 'error');
    }
}





