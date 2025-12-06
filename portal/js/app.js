// Mostrar/esconder menus por papel do usuário
function atualizarMenuPorPapel() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const token = localStorage.getItem('token');
    const linkEventos = document.getElementById('linkEventos');
    const linkCheckin = document.getElementById('linkCheckin');
    const linkInscricoes = document.getElementById('linkInscricoes');
    const linkCertificados = document.getElementById('linkCertificados');
    const linkPerfil = document.getElementById('linkPerfil');
    
    // Se não tem usuário logado, esconder TODAS as abas
    if (!usuario || !token) {
        if (linkEventos) linkEventos.style.display = 'none';
        if (linkCheckin) linkCheckin.style.display = 'none';
        if (linkInscricoes) linkInscricoes.style.display = 'none';
        if (linkCertificados) linkCertificados.style.display = 'none';
        if (linkPerfil) linkPerfil.style.display = 'none';
        return;
    }
    
    // Se tem usuário logado, mostrar baseado no papel
    // Todos veem Eventos e Perfil
    if (linkEventos) linkEventos.style.display = 'inline';
    if (linkPerfil) linkPerfil.style.display = 'inline';
    
    if (usuario.papel === 'admin' || usuario.papel === 'atendente') {
        // Admin e Atendente: mostrar Check-in, esconder Inscrições e Certificados
        if (linkCheckin) linkCheckin.style.display = 'inline';
        if (linkInscricoes) linkInscricoes.style.display = 'none';
        if (linkCertificados) linkCertificados.style.display = 'none';
    } else {
        // Usuário comum: esconder Check-in, mostrar Inscrições e Certificados
        if (linkCheckin) linkCheckin.style.display = 'none';
        if (linkInscricoes) linkInscricoes.style.display = 'inline';
        if (linkCertificados) linkCertificados.style.display = 'inline';
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

    // Verificar autenticação
    if (verificarAutenticacao()) {
        mostrarConteudoAutenticado();
        atualizarMenuPorPapel(); // Atualizar novamente após login
    } else {
        mostrarConteudoNaoAutenticado();
    }
});

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}





