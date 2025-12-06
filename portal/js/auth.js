// Funções de autenticação
async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;

    try {
        const data = await apiRequest(`${API_CONFIG.AUTH}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        
        mostrarMensagem('Login realizado com sucesso!', 'success');
        mostrarConteudoAutenticado();
        
        // Inicializar banco offline
        await offlineDB.init();
    } catch (error) {
        mostrarMensagem(error.message || 'Erro ao fazer login', 'error');
    }
}

async function cadastro(event) {
    event.preventDefault();
    
    const dados = {
        nome: document.getElementById('cadastroNome').value,
        email: document.getElementById('cadastroEmail').value,
        senha: document.getElementById('cadastroSenha').value,
        cpf: document.getElementById('cadastroCpf').value || null,
        telefone: document.getElementById('cadastroTelefone').value || null
    };

    try {
        const data = await apiRequest(`${API_CONFIG.AUTH}/auth/cadastro`, {
            method: 'POST',
            body: JSON.stringify(dados)
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        
        mostrarMensagem('Cadastro realizado com sucesso!', 'success');
        mostrarConteudoAutenticado();
        
        // Inicializar banco offline
        await offlineDB.init();
    } catch (error) {
        mostrarMensagem(error.message || 'Erro ao fazer cadastro', 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    mostrarConteudoNaoAutenticado();
}

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.tab:first-child').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelector('.tab:last-child').classList.add('active');
        document.getElementById('cadastroForm').classList.add('active');
    }
}

function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    return !!token;
}

function mostrarConteudoAutenticado() {
    document.getElementById('authSection').classList.remove('active');
    document.getElementById('eventosSection').classList.add('active');
    
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    document.getElementById('userInfo').textContent = `Olá, ${usuario.nome || 'Usuário'}`;
    document.getElementById('logoutBtn').style.display = 'inline-block';
    
    carregarEventos();
}

function mostrarConteudoNaoAutenticado() {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('authSection').classList.add('active');
    document.getElementById('userInfo').textContent = '';
    document.getElementById('logoutBtn').style.display = 'none';
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





