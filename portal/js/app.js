// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar banco offline
    try {
        await offlineDB.init();
    } catch (error) {
        console.error('Erro ao inicializar banco offline:', error);
    }

    // Verificar autenticação
    if (verificarAutenticacao()) {
        mostrarConteudoAutenticado();
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





