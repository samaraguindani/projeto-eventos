// Sistema de Rotas Simples
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.init();
    }

    // Registrar uma rota
    route(path, handler) {
        this.routes[path] = handler;
    }

    // Inicializar o router
    init() {
        // Listener para mudanças no hash
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });

        // Processar rota inicial
        this.handleRoute();
    }

    // Processar a rota atual
    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const path = hash.startsWith('/') ? hash : '/' + hash;
        
        // Encontrar rota correspondente
        const route = this.routes[path] || this.routes['/'];
        
        if (route) {
            this.currentRoute = path;
            route();
        } else {
            // Rota não encontrada - redirecionar para home
            this.navigate('/');
        }
    }

    // Navegar para uma rota
    navigate(path) {
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        window.location.hash = path;
    }

    // Obter rota atual
    getCurrentRoute() {
        return this.currentRoute || '/';
    }
}

// Instância global do router
const router = new Router();

// Definir rotas
router.route('/', () => {
    // Página inicial - mostrar login se não estiver logado
    if (!verificarAutenticacao()) {
        mostrarPaginaInicial();
    } else {
        router.navigate('/eventos');
    }
});

router.route('/login', () => {
    if (verificarAutenticacao()) {
        router.navigate('/eventos');
        return;
    }
    mostrarPaginaInicial();
});

router.route('/eventos', () => {
    // Eventos são públicos - não requer autenticação
    showSection('eventos');
});

router.route('/inscricoes', () => {
    if (!verificarAutenticacao()) {
        router.navigate('/login');
        return;
    }
    showSection('minhasInscricoes');
});

router.route('/certificados', () => {
    showSection('certificados');
});

router.route('/checkin', () => {
    if (!verificarAutenticacao()) {
        router.navigate('/login');
        return;
    }
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (usuario.papel !== 'admin' && usuario.papel !== 'atendente') {
        router.navigate('/eventos');
        return;
    }
    showSection('checkin');
});

router.route('/perfil', () => {
    if (!verificarAutenticacao()) {
        router.navigate('/login');
        return;
    }
    showSection('perfil');
});

// Função auxiliar para navegação
function navigateTo(path) {
    router.navigate(path);
}

