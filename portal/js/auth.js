// Funções de autenticação
async function fazerLogin(email, senha) {
    try {
        const data = await apiRequest(`${API_CONFIG.AUTH}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        
        mostrarMensagem('Login realizado com sucesso!', 'success');
        atualizarMenuPorPapel();
        
        // Navegar para eventos após login
        if (typeof router !== 'undefined') {
            router.navigate('/eventos');
        } else {
            mostrarConteudoAutenticado();
        }
        
        // Inicializar banco offline
        await offlineDB.init();
    } catch (error) {
        mostrarMensagem(error.message || 'Erro ao fazer login', 'error');
    }
}

async function fazerCadastro(nome, email, senha, cpf, telefone) {
    const dados = {
        nome: nome,
        email: email,
        senha: senha,
        cpf: cpf || null,
        telefone: telefone || null
    };

    try {
        const data = await apiRequest(`${API_CONFIG.AUTH}/auth/cadastro`, {
            method: 'POST',
            body: JSON.stringify(dados)
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        
        mostrarMensagem('Cadastro realizado com sucesso!', 'success');
        atualizarMenuPorPapel();
        
        // Navegar para eventos após cadastro
        if (typeof router !== 'undefined') {
            router.navigate('/eventos');
        } else {
            mostrarConteudoAutenticado();
        }
        
        // Inicializar banco offline
        await offlineDB.init();
    } catch (error) {
        mostrarMensagem(error.message || 'Erro ao fazer cadastro', 'error');
    }
}

async function login(event) {
    event.preventDefault();
    
    // Tentar pegar da página inicial primeiro, depois da seção normal
    const emailInput = document.getElementById('loginEmailInicial') || document.getElementById('loginEmail');
    const senhaInput = document.getElementById('loginSenhaInicial') || document.getElementById('loginSenha');
    
    if (!emailInput || !senhaInput) {
        mostrarMensagem('Campos de login não encontrados', 'error');
        return;
    }
    
    const email = emailInput.value;
    const senha = senhaInput.value;
    
    await fazerLogin(email, senha);
}

async function cadastro(event) {
    event.preventDefault();
    
    // Tentar pegar da página inicial primeiro, depois da seção normal
    const nomeInput = document.getElementById('cadastroNomeInicial') || document.getElementById('cadastroNome');
    const emailInput = document.getElementById('cadastroEmailInicial') || document.getElementById('cadastroEmail');
    const senhaInput = document.getElementById('cadastroSenhaInicial') || document.getElementById('cadastroSenha');
    const cpfInput = document.getElementById('cadastroCpfInicial') || document.getElementById('cadastroCpf');
    const telefoneInput = document.getElementById('cadastroTelefoneInicial') || document.getElementById('cadastroTelefone');
    
    if (!nomeInput || !emailInput || !senhaInput) {
        mostrarMensagem('Campos de cadastro não encontrados', 'error');
        return;
    }
    
    const nome = nomeInput.value;
    const email = emailInput.value;
    const senha = senhaInput.value;
    const cpf = cpfInput?.value || null;
    const telefone = telefoneInput?.value || null;
    
    await fazerCadastro(nome, email, senha, cpf, telefone);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    // Atualizar menu para esconder todas as abas
    if (typeof atualizarMenuPorPapel === 'function') {
        atualizarMenuPorPapel();
    }
    
    // Navegar para login após logout
    if (typeof router !== 'undefined') {
        router.navigate('/login');
    } else {
        mostrarConteudoNaoAutenticado();
        if (typeof mostrarPaginaInicial === 'function') {
            mostrarPaginaInicial();
        }
    }
}

function switchTab(tab) {
    // Verificar se está na página inicial
    const paginaInicial = document.getElementById('paginaInicialSection');
    const isPaginaInicial = paginaInicial && paginaInicial.classList.contains('active');
    
    if (isPaginaInicial) {
        // Tabs da página inicial
        const container = document.querySelector('#paginaInicialSection .auth-container');
        if (container) {
            container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            container.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            
            if (tab === 'login') {
                const loginTab = container.querySelector('.tab:first-child');
                if (loginTab) loginTab.classList.add('active');
                const loginForm = document.getElementById('loginFormInicial');
                if (loginForm) loginForm.classList.add('active');
            } else {
                const cadastroTab = container.querySelector('.tab:last-child');
                if (cadastroTab) cadastroTab.classList.add('active');
                const cadastroForm = document.getElementById('cadastroFormInicial');
                if (cadastroForm) cadastroForm.classList.add('active');
            }
        }
    } else {
        // Tabs da seção normal
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        if (tab === 'login') {
            const loginTab = document.querySelector('.tab:first-child');
            if (loginTab) loginTab.classList.add('active');
            const loginForm = document.getElementById('loginForm');
            if (loginForm) loginForm.classList.add('active');
        } else {
            const cadastroTab = document.querySelector('.tab:last-child');
            if (cadastroTab) cadastroTab.classList.add('active');
            const cadastroForm = document.getElementById('cadastroForm');
            if (cadastroForm) cadastroForm.classList.add('active');
        }
    }
}

function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    return !!token;
}

function mostrarConteudoAutenticado() {
    // Esconder página inicial se existir
    const paginaInicial = document.getElementById('paginaInicialSection');
    if (paginaInicial) {
        paginaInicial.classList.remove('active');
    }
    
    // Esconder seção de auth normal
    const authSection = document.getElementById('authSection');
    if (authSection) {
        authSection.classList.remove('active');
    }
    
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (userInfo) {
        const nomeUsuario = usuario.nome && usuario.nome.trim() ? usuario.nome : 'Usuário';
        userInfo.textContent = `Olá, ${nomeUsuario}`;
    }
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    
    // Atualizar menu baseado no papel do usuário
    if (typeof atualizarMenuPorPapel === 'function') {
        atualizarMenuPorPapel();
    }
    
    // Navegar para eventos usando router se disponível
    if (typeof router !== 'undefined') {
        router.navigate('/eventos');
    } else {
        // Mostrar seção de eventos
        document.getElementById('eventosSection').classList.add('active');
        carregarEventos();
    }
}

function mostrarConteudoNaoAutenticado() {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    // Não ativar authSection por padrão - eventos será ativado no app.js
    document.getElementById('userInfo').textContent = '';
    document.getElementById('logoutBtn').style.display = 'none';
    
    // Esconder apenas abas que requerem autenticação
    // Eventos e Certificados permanecem visíveis (públicos)
    const linkInscricoes = document.getElementById('linkInscricoes');
    const linkCheckin = document.getElementById('linkCheckin');
    const linkPerfil = document.getElementById('linkPerfil');
    
    if (linkInscricoes) linkInscricoes.style.display = 'none';
    if (linkCheckin) linkCheckin.style.display = 'none';
    if (linkPerfil) linkPerfil.style.display = 'none';
}

function mostrarMensagem(mensagem, tipo = 'info') {
    // Criar elemento de mensagem
    const msgEl = document.createElement('div');
    msgEl.className = `message ${tipo}`;
    msgEl.textContent = mensagem;
    
    // Adicionar ao body
    document.body.insertBefore(msgEl, document.body.firstChild);
    
    // Remover após 5 segundos
    setTimeout(() => {
        msgEl.remove();
    }, 5000);
}

// Função para mostrar/esconder senha (usada em login, cadastro e perfil)
function toggleSenha(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    
    if (input && button) {
        if (input.type === 'password') {
            input.type = 'text';
            button.textContent = '🙈';
        } else {
            input.type = 'password';
            button.textContent = '👁️';
        }
    }
}





