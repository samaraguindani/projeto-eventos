// Funções de check-in para atendentes

let eventoSelecionado = null;

async function carregarEventosParaCheckin() {
    const select = document.getElementById('eventoCheckin');
    select.innerHTML = '<option value="">Carregando...</option>';

    try {
        const data = await apiRequest(`${API_CONFIG.EVENTOS}/eventos`);
        
        select.innerHTML = '<option value="">Selecione um evento</option>';
        
        if (data.eventos && data.eventos.length > 0) {
            data.eventos.forEach(evento => {
                const option = document.createElement('option');
                option.value = evento.id;
                option.textContent = `${evento.titulo} - ${new Date(evento.data_inicio).toLocaleDateString('pt-BR')}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
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
            mostrarDadosParticipante(data);
        } else {
            // Usuário não encontrado - mostrar formulário de cadastro rápido
            mostrarFormularioCadastroRapido(cpf);
        }
    } catch (error) {
        // Se der qualquer erro de rede ou "não encontrado", mostrar formulário de cadastro
        if (error.message && (error.message.includes('não encontrado') || error.message.includes('Participante não encontrado') || error.message.includes('404'))) {
            mostrarFormularioCadastroRapido(cpf);
        } else {
            // Outros erros - mostrar mensagem
            console.error('Erro ao buscar participante:', error);
            mostrarMensagem(error.message || 'Erro ao buscar participante', 'error');
        }
    }
}

function mostrarDadosParticipante(data) {
    const resultado = document.getElementById('resultadoBusca');
    
    let html = `
        <div class="participante-encontrado">
            <h3>✓ Participante Encontrado</h3>
            <p><strong>Nome:</strong> ${data.usuario.nome}</p>
            <p><strong>Email:</strong> ${data.usuario.email}</p>
            <p><strong>CPF:</strong> ${data.usuario.cpf}</p>
    `;

    if (data.tem_inscricao) {
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
            <div class="alert alert-warning">
                <strong>⚠ Participante não inscrito neste evento</strong>
            </div>
            <p>Deseja fazer o cadastro e check-in agora?</p>
            <button onclick="mostrarFormularioCadastroRapido('${data.usuario.cpf}')" class="btn btn-primary">
                Fazer Cadastro e Check-in
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
                
                <button type="submit" class="btn btn-primary btn-lg">
                    Cadastrar e Fazer Check-in
                </button>
                <button type="button" onclick="limparBusca()" class="btn btn-secondary">
                    Cancelar
                </button>
            </form>
        </div>
    `;
}

async function confirmarCheckin(cpf) {
    if (!confirm('Confirmar check-in do participante?')) {
        return;
    }

    try {
        const data = await apiRequest(`${API_CONFIG.INSCRICOES}/checkin/registrar`, {
            method: 'POST',
            body: JSON.stringify({
                cpf: cpf,
                evento_id: parseInt(eventoSelecionado)
            })
        });

        mostrarMensagem('Check-in realizado com sucesso!', 'success');
        limparBusca();
        
    } catch (error) {
        mostrarMensagem(error.message || 'Erro ao registrar check-in', 'error');
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
        mostrarMensagem(error.message || 'Erro ao realizar cadastro', 'error');
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

