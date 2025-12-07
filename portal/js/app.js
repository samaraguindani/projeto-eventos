// Mostrar/esconder menus por papel do usuário
function atualizarMenuPorPapel() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    const token = localStorage.getItem('token');
    const linkEventos = document.getElementById('linkEventos');
    const linkCheckin = document.getElementById('linkCheckin');
    const linkInscricoes = document.getElementById('linkInscricoes');
    const linkCertificados = document.getElementById('linkCertificados');
    const linkPerfil = document.getElementById('linkPerfil');
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Certificados e Eventos sempre visíveis (públicos)
    if (linkCertificados) linkCertificados.style.display = 'inline';
    if (linkEventos) linkEventos.style.display = 'inline';
    
    const linkLogin = document.getElementById('linkLogin');
    
    // Se não tem usuário logado, mostrar Login e esconder abas que requerem autenticação
    if (!usuario || !token) {
        if (linkLogin) linkLogin.style.display = 'inline';
        if (linkCheckin) linkCheckin.style.display = 'none';
        if (linkInscricoes) linkInscricoes.style.display = 'none';
        if (linkPerfil) linkPerfil.style.display = 'none';
        if (userInfo) userInfo.textContent = '';
        if (logoutBtn) logoutBtn.style.display = 'none';
        return;
    }
    
    // Se está logado, esconder Login
    if (linkLogin) linkLogin.style.display = 'none';
    
    // Atualizar informação do usuário na navbar
    if (userInfo) {
        const nomeUsuario = usuario.nome && usuario.nome.trim() ? usuario.nome : 'Usuário';
        userInfo.textContent = `Olá, ${nomeUsuario}`;
    }
    if (logoutBtn) logoutBtn.style.display = 'inline';
    
    // Se tem usuário logado, mostrar baseado no papel
    // Todos veem Eventos e Perfil
    if (linkEventos) linkEventos.style.display = 'inline';
    if (linkPerfil) linkPerfil.style.display = 'inline';
    
    if (usuario.papel === 'admin' || usuario.papel === 'atendente') {
        // Admin e Atendente: mostrar Check-in, esconder Inscrições
        if (linkCheckin) linkCheckin.style.display = 'inline';
        if (linkInscricoes) linkInscricoes.style.display = 'none';
    } else {
        // Usuário comum: esconder Check-in, mostrar Inscrições
        if (linkCheckin) linkCheckin.style.display = 'none';
        if (linkInscricoes) linkInscricoes.style.display = 'inline';
    }
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar banco offline
    try {
        await offlineDB.init();
    } catch (error) {
        console.error('Erro ao inicializar banco offline:', error);
    }

    // Atualizar menu primeiro (esconder tudo se não estiver logado)
    atualizarMenuPorPapel();

    // O router já foi inicializado e vai processar a rota atual
    // Não precisamos mais chamar mostrarConteudoAutenticado/NaoAutenticado aqui
    // O router vai decidir qual tela mostrar baseado na URL
});

// Mostrar página inicial com login e eventos
function mostrarPaginaInicial() {
    // Remover active de todas as seções
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // Criar container para página inicial se não existir
    let paginaInicial = document.getElementById('paginaInicialSection');
    if (!paginaInicial) {
        paginaInicial = document.createElement('section');
        paginaInicial.id = 'paginaInicialSection';
        paginaInicial.className = 'section active';
        paginaInicial.innerHTML = `
            <div class="container">
                <div class="pagina-inicial-layout">
                    <div class="area-login">
                        <div class="auth-container">
                            <div class="auth-tabs">
                                <button class="tab active" onclick="switchTab('login')">Login</button>
                                <button class="tab" onclick="switchTab('cadastro')">Cadastro</button>
                            </div>
                            <div id="loginFormInicial" class="auth-form active">
                                <h2>Login</h2>
                                <form onsubmit="login(event)">
                                    <div class="form-group">
                                        <label>Email:</label>
                                        <input type="email" id="loginEmailInicial" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Senha:</label>
                                        <div style="position: relative;">
                                            <input type="password" id="loginSenhaInicial" required style="padding-right: 40px;">
                                            <button type="button" onclick="toggleSenha('loginSenhaInicial', 'btnToggleLoginSenhaInicial')" 
                                                    id="btnToggleLoginSenhaInicial" 
                                                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 18px; color: #666;">
                                                👁️
                                            </button>
                                        </div>
                                    </div>
                                    <button type="submit" class="btn btn-primary">Entrar</button>
                                </form>
                            </div>
                            <div id="cadastroFormInicial" class="auth-form">
                                <h2>Cadastro</h2>
                                <form onsubmit="cadastro(event)">
                                    <div class="form-group">
                                        <label>Nome:</label>
                                        <input type="text" id="cadastroNomeInicial" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Email:</label>
                                        <input type="email" id="cadastroEmailInicial" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Senha:</label>
                                        <div style="position: relative;">
                                            <input type="password" id="cadastroSenhaInicial" required minlength="6" style="padding-right: 40px;">
                                            <button type="button" onclick="toggleSenha('cadastroSenhaInicial', 'btnToggleCadastroSenhaInicial')" 
                                                    id="btnToggleCadastroSenhaInicial" 
                                                    style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 18px; color: #666;">
                                                👁️
                                            </button>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>CPF:</label>
                                        <input type="text" id="cadastroCpfInicial" placeholder="000.000.000-00">
                                    </div>
                                    <div class="form-group">
                                        <label>Telefone:</label>
                                        <input type="tel" id="cadastroTelefoneInicial" placeholder="(00) 00000-0000">
                                    </div>
                                    <button type="submit" class="btn btn-primary">Cadastrar</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertBefore(paginaInicial, document.getElementById('authSection'));
    } else {
        paginaInicial.classList.add('active');
    }
    
    // Carregar eventos
    carregarEventosInicial();
}

// Funções removidas - eventos não são mais mostrados na página inicial

// As funções login() e cadastro() estão em auth.js e já funcionam com ambos os formulários

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}





