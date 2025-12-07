// Funções de check-in para atendentes

let eventoSelecionado = null;

async function carregarEventosParaCheckin() {
    const select = document.getElementById('eventoCheckin');
    select.innerHTML = '<option value="">Carregando...</option>';

    try {
        let eventos = [];
        
        if (isOnline()) {
            // Online: buscar do servidor e atualizar cache
            const data = await apiRequest(`${API_CONFIG.EVENTOS}/eventos`);
            eventos = data.eventos || [];
            
            // Salvar no cache
            if (eventos.length > 0) {
                await offlineDB.init();
                await offlineDB.salvarEventosCache(eventos);
            }
        } else {
            // Offline: usar cache
            await offlineDB.init();
            eventos = await offlineDB.obterEventosCache();
            
            if (eventos.length === 0) {
                select.innerHTML = '<option value="">Nenhum evento em cache. Conecte-se à internet para carregar eventos.</option>';
                mostrarMensagem('Modo offline: usando eventos em cache. Conecte-se à internet para atualizar.', 'info');
                return;
            }
        }
        
        select.innerHTML = '<option value="">Selecione um evento</option>';
        
        if (eventos.length > 0) {
            eventos.forEach(evento => {
                const option = document.createElement('option');
                option.value = evento.id;
                option.textContent = `${evento.titulo} - ${new Date(evento.data_inicio).toLocaleDateString('pt-BR')}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        // Se falhar online, tentar cache
        if (isOnline()) {
            try {
                await offlineDB.init();
                const eventos = await offlineDB.obterEventosCache();
                if (eventos.length > 0) {
                    select.innerHTML = '<option value="">Selecione um evento</option>';
                    eventos.forEach(evento => {
                        const option = document.createElement('option');
                        option.value = evento.id;
                        option.textContent = `${evento.titulo} - ${new Date(evento.data_inicio).toLocaleDateString('pt-BR')}`;
                        select.appendChild(option);
                    });
                    mostrarMensagem('Usando eventos em cache devido a erro na conexão', 'warning');
                    return;
                }
            } catch (cacheError) {
                console.error('Erro ao carregar cache:', cacheError);
            }
        }
        
        select.innerHTML = '<option value="">Erro ao carregar eventos</option>';
        mostrarMensagem('Erro ao carregar eventos', 'error');
    }
}

function selecionarEvento() {
    const select = document.getElementById('eventoCheckin');
    eventoSelecionado = select.value;
    
    if (eventoSelecionado) {
        document.getElementById('areaCheckin').style.display = 'block';
        document.getElementById('cpfInput').focus();
    } else {
        document.getElementById('areaCheckin').style.display = 'none';
    }
}

async function buscarParticipante() {
    let cpf = document.getElementById('cpfInput').value.trim();
    
    if (!cpf) {
        mostrarMensagem('Digite o CPF do participante', 'error');
        return;
    }

    if (!eventoSelecionado) {
        mostrarMensagem('Selecione um evento primeiro', 'error');
        return;
    }

    // Normalizar CPF (remover pontos e hífen para busca)
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    // Se tiver menos de 11 dígitos, não é um CPF válido
    if (cpfLimpo.length !== 11) {
        mostrarMensagem('CPF inválido. Digite 11 dígitos.', 'error');
        return;
    }

    // Se estiver offline, buscar no IndexedDB
    if (!isOnline()) {
        await buscarParticipanteOffline(cpf, cpfLimpo);
        return;
    }

    // Online: buscar no servidor
    try {
        const response = await fetch(`${API_CONFIG.INSCRICOES}/checkin/buscar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                cpf: cpf,
                evento_id: parseInt(eventoSelecionado)
            })
        });

        const data = await response.json();

        // Se retornou 404, usuário não encontrado - mostrar cadastro rápido
        if (response.status === 404) {
            mostrarFormularioCadastroRapido(cpf);
            return;
        }

        // Se não foi 200, lançar erro
        if (!response.ok) {
            throw new Error(data.message || 'Erro ao buscar participante');
        }

        // Se encontrou o usuário
        if (data.encontrado) {
            // Salvar usuário no cache local para uso offline
            if (data.usuario) {
                await offlineDB.init();
                await offlineDB.salvarUsuarioCache(data.usuario);
            }
            mostrarDadosParticipante(data);
        } else {
            // Usuário não encontrado - mostrar formulário de cadastro rápido
            mostrarFormularioCadastroRapido(cpf);
        }
    } catch (error) {
        // Se der erro de rede, tentar buscar offline
        if (error.message && error.message.includes('Sem conexão')) {
            await buscarParticipanteOffline(cpf, cpfLimpo);
        } else if (error.message && (error.message.includes('não encontrado') || error.message.includes('Participante não encontrado') || error.message.includes('404'))) {
            mostrarFormularioCadastroRapido(cpf);
        } else {
            // Outros erros - mostrar mensagem
            console.error('Erro ao buscar participante:', error);
            mostrarMensagem(error.message || 'Erro ao buscar participante', 'error');
        }
    }
}

// Buscar participante offline (no SQLite)
async function buscarParticipanteOffline(cpf, cpfLimpo) {
    try {
        await offlineDB.init();
        
        // Buscar usuário cadastrado offline
        const usuarioOffline = await offlineDB.buscarUsuarioOfflinePorCpf(cpfLimpo);
        
        if (usuarioOffline) {
            // Usuário encontrado no cache offline ou do servidor
            mostrarDadosParticipante({
                encontrado: true,
                usuario: {
                    id: usuarioOffline.temp_id || usuarioOffline.id, // ID temporário ou do servidor
                    nome: usuarioOffline.nome,
                    email: usuarioOffline.email,
                    cpf: usuarioOffline.cpf,
                    cadastro_completo: usuarioOffline.cadastro_completo || false
                },
                inscricao: null,
                tem_inscricao: false,
                offline: true,
                do_servidor: usuarioOffline.do_servidor || false // Indica se veio do cache do servidor
            });
        } else {
            // Usuário não encontrado localmente - mas pode existir no servidor
            // Mostrar opção de check-in direto (o backend vai verificar/criar na sincronização)
            mostrarCheckinDiretoOffline(cpf);
        }
    } catch (error) {
        console.error('Erro ao buscar participante offline:', error);
        // Se der erro, permitir check-in direto
        mostrarCheckinDiretoOffline(cpf);
    }
}

// Mostrar opção de check-in direto quando offline e usuário não encontrado localmente
function mostrarCheckinDiretoOffline(cpf) {
    const resultado = document.getElementById('resultadoBusca');
    
    resultado.innerHTML = `
        <div class="checkin-direto-offline">
            <h3>Cadastro Rápido na Portaria</h3>
            <div class="alert alert-warning">
                <strong>⚠ Modo Offline</strong><br>
                Usuário não encontrado. Preencha os dados para cadastro, inscrição e check-in.
            </div>
            <p><strong>CPF:</strong> ${cpf}</p>
            
            <form onsubmit="event.preventDefault(); fazerCheckinDiretoOffline('${cpf}');" style="margin-top: 20px;">
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" id="emailCheckinDireto" class="form-control" required>
                </div>
                
                <div class="alert alert-info" style="margin-top: 15px;">
                    <small>
                        <strong>Atenção:</strong> Uma senha temporária será gerada e enviada por email.
                        O participante deverá completar o cadastro posteriormente.
                    </small>
                </div>
                
                <div style="margin-top: 20px;">
                    <button type="submit" class="btn btn-success btn-lg">
                        Cadastrar, Inscrever e Fazer Check-in
                    </button>
                    <button type="button" onclick="limparBusca()" class="btn btn-secondary" style="margin-left: 10px;">
                        Cancelar
                    </button>
                </div>
                <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                    <small>Os dados serão salvos localmente e sincronizados quando houver conexão.</small>
                </p>
            </form>
        </div>
    `;
}

// Fazer check-in direto offline (quando usuário não encontrado localmente)
async function fazerCheckinDiretoOffline(cpf) {
    const email = document.getElementById('emailCheckinDireto')?.value.trim();
    
    // Validar campos obrigatórios
    if (!email) {
        mostrarMensagem('Preencha o campo obrigatório (Email)', 'error');
        return;
    }
    
    try {
        await offlineDB.init();
        
        const cpfLimpo = cpf.replace(/\D/g, '');
        
        // Gerar senha temporária local
        const senhaTemporaria = Math.random().toString(36).slice(-8);
        
        // Salvar usuário offline primeiro (cadastro rápido) - sem nome
        const usuarioTempId = await offlineDB.adicionarUsuarioOffline({
            nome: null, // Nome será preenchido pelo backend na sincronização
            email: email,
            cpf: cpfLimpo,
            senha_temporaria: senhaTemporaria,
            evento_id: parseInt(eventoSelecionado)
        });
        
        // Salvar check-in offline também - sem nome
        await offlineDB.adicionarCheckinOffline(
            cpf,
            parseInt(eventoSelecionado),
            usuarioTempId,
            {
                email: email,
                cpf: cpfLimpo
            }
        );
        
        mostrarMensagem('Cadastro e check-in salvos localmente. Serão sincronizados quando a conexão for restaurada.', 'success');
        
        // Mostrar senha temporária
        alert(`Cadastro salvo offline!\n\nSenha temporária: ${senhaTemporaria}\n\nAnote esta senha e informe ao participante.\n\nOs dados serão sincronizados quando houver conexão.`);
        
        limparBusca();
        
    } catch (error) {
        console.error('Erro ao salvar check-in offline:', error);
        mostrarMensagem('Erro ao salvar check-in offline', 'error');
    }
}

function mostrarDadosParticipante(data) {
    const resultado = document.getElementById('resultadoBusca');
    const isOffline = data.offline || !isOnline();
    
    let html = `
        <div class="participante-encontrado">
            <h3>✓ Participante Encontrado</h3>
            ${isOffline ? '<div class="alert alert-warning"><strong>⚠ Modo Offline</strong> - Dados serão sincronizados quando a conexão for restaurada.</div>' : ''}
            <p><strong>Nome:</strong> ${data.usuario.nome}</p>
            <p><strong>Email:</strong> ${data.usuario.email}</p>
            <p><strong>CPF:</strong> ${data.usuario.cpf}</p>
    `;

    if (data.tem_inscricao && !isOffline) {
        if (data.inscricao.presenca_registrada) {
            html += `
                <div class="alert alert-info">
                    <strong>✓ Check-in já realizado!</strong><br>
                    Data: ${new Date(data.inscricao.data_presenca).toLocaleString('pt-BR')}
                </div>
            `;
        } else {
            html += `
                <button onclick="confirmarCheckin('${data.usuario.cpf}')" class="btn btn-success btn-lg">
                    Registrar Check-in
                </button>
            `;
        }
    } else {
        html += `
            <div class="alert alert-info">
                <strong>ℹ Participante não inscrito neste evento</strong>
            </div>
            <p>O sistema irá <strong>inscrever automaticamente</strong> e registrar o check-in.</p>
            <button onclick="confirmarCheckin('${data.usuario.cpf}')" class="btn btn-success btn-lg">
                Fazer Check-in (Inscrever Automaticamente)
            </button>
        `;
    }

    html += '</div>';
    resultado.innerHTML = html;
}

function mostrarFormularioCadastroRapido(cpf) {
    const resultado = document.getElementById('resultadoBusca');
    
    resultado.innerHTML = `
        <div class="cadastro-rapido">
            <h3>Cadastro Rápido na Portaria</h3>
            <p>Participante não encontrado. Preencha os dados básicos:</p>
            <div class="alert alert-info" style="margin-bottom: 15px;">
                <small><strong>ℹ O sistema irá:</strong> Cadastrar → Inscrever → Fazer Check-in (tudo automaticamente)</small>
            </div>
            
            <form onsubmit="event.preventDefault(); realizarCadastroRapido();">
                <div class="form-group">
                    <label>Nome Completo *</label>
                    <input type="text" id="nomeRapido" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label>CPF *</label>
                    <input type="text" id="cpfRapido" class="form-control" value="${cpf}" required>
                </div>
                
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" id="emailRapido" class="form-control" required>
                </div>
                
                <div class="alert alert-info">
                    <small>
                        <strong>Atenção:</strong> Uma senha temporária será gerada e enviada por email.
                        O participante deverá completar o cadastro posteriormente.
                    </small>
                </div>
                
                <button type="submit" class="btn btn-success btn-lg">
                    Cadastrar, Inscrever e Fazer Check-in
                </button>
                <button type="button" onclick="limparBusca()" class="btn btn-secondary">
                    Cancelar
                </button>
            </form>
        </div>
    `;
}

async function confirmarCheckin(cpf) {
    if (!confirm('Confirmar check-in do participante?\n\n✓ Se já estiver inscrito: apenas valida a entrada\n✓ Se não estiver inscrito: inscreve automaticamente e valida\n✓ Tudo em uma única ação!')) {
        return;
    }

    // Se estiver offline, salvar no IndexedDB
    if (!isOnline()) {
        await confirmarCheckinOffline(cpf);
        return;
    }

    // Online: registrar no servidor
    try {
        const data = await apiRequest(`${API_CONFIG.INSCRICOES}/checkin/registrar`, {
            method: 'POST',
            body: JSON.stringify({
                cpf: cpf,
                evento_id: parseInt(eventoSelecionado)
            })
        });

        if (data.inscricao_criada) {
            mostrarMensagem('Inscrição criada e check-in realizado com sucesso!', 'success');
        } else {
            mostrarMensagem('Check-in realizado com sucesso!', 'success');
        }
        
        limparBusca();
        
    } catch (error) {
        // Se der erro de rede, tentar salvar offline
        if (error.message && error.message.includes('Sem conexão')) {
            await confirmarCheckinOffline(cpf);
        } else {
            mostrarMensagem(error.message || 'Erro ao registrar check-in', 'error');
        }
    }
}

// Confirmar check-in offline
async function confirmarCheckinOffline(cpf) {
    try {
        await offlineDB.init();
        
        // Buscar dados do participante (pode estar no cache offline)
        const cpfLimpo = cpf.replace(/\D/g, '');
        const usuarioOffline = await offlineDB.buscarUsuarioOfflinePorCpf(cpfLimpo);
        
        // Salvar check-in offline
        // Se não tiver dados do usuário localmente, salva apenas com CPF
        // O backend vai verificar se o usuário existe na sincronização
        await offlineDB.adicionarCheckinOffline(
            cpf,
            parseInt(eventoSelecionado),
            usuarioOffline ? usuarioOffline.temp_id : null,
            usuarioOffline ? {
                nome: usuarioOffline.nome,
                email: usuarioOffline.email,
                cpf: usuarioOffline.cpf
            } : {
                // Dados mínimos - apenas CPF para o backend verificar na sincronização
                cpf: cpfLimpo,
                verificar_no_servidor: true
            }
        );
        
        if (usuarioOffline) {
            mostrarMensagem('Check-in salvo localmente. Será sincronizado quando a conexão for restaurada.', 'success');
        } else {
            mostrarMensagem('Check-in salvo localmente. O sistema verificará se o usuário existe no servidor durante a sincronização.', 'success');
        }
        limparBusca();
        
    } catch (error) {
        console.error('Erro ao salvar check-in offline:', error);
        mostrarMensagem('Erro ao salvar check-in offline', 'error');
    }
}

async function realizarCadastroRapido() {
    const nome = document.getElementById('nomeRapido').value.trim();
    const cpf = document.getElementById('cpfRapido').value.trim();
    const email = document.getElementById('emailRapido').value.trim();

    if (!nome || !cpf || !email) {
        mostrarMensagem('Preencha todos os campos', 'error');
        return;
    }

    // Se estiver offline, salvar no IndexedDB
    if (!isOnline()) {
        await realizarCadastroRapidoOffline(nome, cpf, email);
        return;
    }

    // Online: registrar no servidor
    try {
        const data = await apiRequest(`${API_CONFIG.INSCRICOES}/checkin/cadastro-rapido`, {
            method: 'POST',
            body: JSON.stringify({
                nome: nome,
                cpf: cpf,
                email: email,
                evento_id: parseInt(eventoSelecionado)
            })
        });

        mostrarMensagem('Cadastro e check-in realizados com sucesso!', 'success');
        
        // Mostrar senha temporária
        alert(`Cadastro realizado!\n\nSenha temporária: ${data.senha_temporaria}\n\nAnote esta senha e informe ao participante.`);
        
        limparBusca();
        
    } catch (error) {
        // Se der erro de rede, tentar salvar offline
        if (error.message && error.message.includes('Sem conexão')) {
            await realizarCadastroRapidoOffline(nome, cpf, email);
        } else {
            mostrarMensagem(error.message || 'Erro ao realizar cadastro', 'error');
        }
    }
}

// Realizar cadastro rápido offline
async function realizarCadastroRapidoOffline(nome, cpf, email) {
    try {
        await offlineDB.init();
        
        // Gerar senha temporária local
        const senhaTemporaria = Math.random().toString(36).slice(-8);
        
        // Salvar usuário offline
        const usuarioTempId = await offlineDB.adicionarUsuarioOffline({
            nome: nome,
            email: email,
            cpf: cpf.replace(/\D/g, ''),
            senha_temporaria: senhaTemporaria,
            evento_id: parseInt(eventoSelecionado)
        });
        
        // Salvar check-in offline também
        await offlineDB.adicionarCheckinOffline(
            cpf,
            parseInt(eventoSelecionado),
            usuarioTempId,
            {
                nome: nome,
                email: email,
                cpf: cpf
            }
        );
        
        mostrarMensagem('Cadastro e check-in salvos localmente. Serão sincronizados quando a conexão for restaurada.', 'success');
        
        // Mostrar senha temporária
        alert(`Cadastro salvo offline!\n\nSenha temporária: ${senhaTemporaria}\n\nAnote esta senha e informe ao participante.\n\nOs dados serão sincronizados quando houver conexão.`);
        
        limparBusca();
        
    } catch (error) {
        console.error('Erro ao salvar cadastro offline:', error);
        mostrarMensagem('Erro ao salvar cadastro offline', 'error');
    }
}

function limparBusca() {
    document.getElementById('cpfInput').value = '';
    document.getElementById('resultadoBusca').innerHTML = '';
    document.getElementById('cpfInput').focus();
}

// Máscara de CPF
document.addEventListener('DOMContentLoaded', function() {
    const cpfInput = document.getElementById('cpfInput');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            }
        });
    }
});

