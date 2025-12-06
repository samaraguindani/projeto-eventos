// Funções de perfil do usuário

async function carregarPerfil() {
    const perfilDiv = document.getElementById('perfilUsuario');
    perfilDiv.innerHTML = '<div class="loading">Carregando perfil...</div>';

    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        
        if (!usuario) {
            perfilDiv.innerHTML = '<div class="message error">Usuário não encontrado</div>';
            return;
        }

        const cadastroIncompleto = usuario.cadastro_completo === false;

        let html = `
            <div class="perfil-container">
                ${cadastroIncompleto ? `
                    <div class="alert alert-warning">
                        <strong>⚠ Cadastro Incompleto!</strong><br>
                        Complete seus dados para ter acesso total ao sistema.
                    </div>
                ` : ''}
                
                <h2>Meu Perfil</h2>
                
                <form onsubmit="event.preventDefault(); salvarPerfil();">
                    <div class="form-group">
                        <label>Nome Completo *</label>
                        <input type="text" id="perfilNome" class="form-control" 
                               value="${usuario.nome || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" id="perfilEmail" class="form-control" 
                               value="${usuario.email || ''}" required readonly>
                        <small>O email não pode ser alterado</small>
                    </div>
                    
                    <div class="form-group">
                        <label>CPF ${cadastroIncompleto ? '*' : ''}</label>
                        <input type="text" id="perfilCpf" class="form-control" 
                               value="${usuario.cpf || ''}" ${cadastroIncompleto ? 'required' : 'readonly'}>
                        ${!cadastroIncompleto ? '<small>O CPF não pode ser alterado</small>' : ''}
                    </div>
                    
                    <div class="form-group">
                        <label>Telefone</label>
                        <input type="text" id="perfilTelefone" class="form-control" 
                               value="${usuario.telefone || ''}" placeholder="(00) 00000-0000">
                    </div>
                    
                    <div class="form-group">
                        <label>Data de Nascimento</label>
                        <input type="date" id="perfilDataNascimento" class="form-control" 
                               value="${usuario.data_nascimento ? usuario.data_nascimento.split('T')[0] : ''}">
                    </div>
                    
                    <hr>
                    
                    <h3>Alterar Senha</h3>
                    <p><small>Deixe em branco se não deseja alterar</small></p>
                    
                    <div class="form-group">
                        <label>Senha Atual</label>
                        <div style="position: relative;">
                            <input type="password" id="perfilSenhaAtual" class="form-control">
                            <button type="button" onclick="toggleSenha('perfilSenhaAtual', 'btnToggleSenhaAtual')" 
                                    id="btnToggleSenhaAtual" 
                                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 18px; color: #666;">
                                👁️
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Nova Senha</label>
                        <div style="position: relative;">
                            <input type="password" id="perfilNovaSenha" class="form-control" 
                                   minlength="6">
                            <button type="button" onclick="toggleSenha('perfilNovaSenha', 'btnToggleNovaSenha')" 
                                    id="btnToggleNovaSenha" 
                                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 18px; color: #666;">
                                👁️
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Confirmar Nova Senha</label>
                        <div style="position: relative;">
                            <input type="password" id="perfilConfirmarSenha" class="form-control" 
                                   minlength="6">
                            <button type="button" onclick="toggleSenha('perfilConfirmarSenha', 'btnToggleConfirmarSenha')" 
                                    id="btnToggleConfirmarSenha" 
                                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 18px; color: #666;">
                                👁️
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary btn-lg">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        `;

        perfilDiv.innerHTML = html;

        // Adicionar máscaras
        adicionarMascaras();

    } catch (error) {
        perfilDiv.innerHTML = `<div class="message error">${error.message}</div>`;
    }
}

async function salvarPerfil() {
    const nome = document.getElementById('perfilNome').value.trim();
    const cpf = document.getElementById('perfilCpf').value.trim();
    const telefone = document.getElementById('perfilTelefone').value.trim();
    const dataNascimento = document.getElementById('perfilDataNascimento').value;
    const senhaAtual = document.getElementById('perfilSenhaAtual').value;
    const novaSenha = document.getElementById('perfilNovaSenha').value;
    const confirmarSenha = document.getElementById('perfilConfirmarSenha').value;

    // Validações
    if (!nome) {
        mostrarMensagem('Nome é obrigatório', 'error');
        return;
    }

    if (novaSenha && novaSenha !== confirmarSenha) {
        mostrarMensagem('As senhas não coincidem', 'error');
        return;
    }

    if (novaSenha && !senhaAtual) {
        mostrarMensagem('Informe a senha atual para alterá-la', 'error');
        return;
    }

    try {
        const dados = {
            nome: nome,
            cpf: cpf || null,
            telefone: telefone || null,
            dataNascimento: dataNascimento || null
        };

        if (novaSenha) {
            dados.senhaAtual = senhaAtual;
            dados.novaSenha = novaSenha;
        }

        const usuario = JSON.parse(localStorage.getItem('usuario'));
        
        const data = await apiRequest(`${API_CONFIG.AUTH}/usuarios/${usuario.id}`, {
            method: 'PUT',
            body: JSON.stringify(dados)
        });

        // Atualizar localStorage
        const usuarioAtualizado = { ...usuario, ...data };
        localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));

        mostrarMensagem('Perfil atualizado com sucesso!', 'success');
        
        // Recarregar perfil
        setTimeout(() => {
            carregarPerfil();
        }, 1000);

    } catch (error) {
        mostrarMensagem(error.message || 'Erro ao salvar perfil', 'error');
    }
}

function toggleSenha(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

function adicionarMascaras() {
    // Máscara de CPF
    const cpfInput = document.getElementById('perfilCpf');
    if (cpfInput && !cpfInput.readOnly) {
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

    // Máscara de telefone
    const telefoneInput = document.getElementById('perfilTelefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                if (value.length <= 10) {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{4})(\d)/, '$1-$2');
                } else {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                }
                e.target.value = value;
            }
        });
    }
}

