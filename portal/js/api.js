// Configuração da API
const API_CONFIG = {
    AUTH: 'http://localhost:5001/api',
    EVENTOS: 'http://localhost:5002/api',
    INSCRICOES: 'http://localhost:8001/api/inscricoes',
    CERTIFICADOS: 'http://localhost:8002/api/certificados'
};

// Função para fazer requisições HTTP
async function apiRequest(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, finalOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro na requisição');
        }
        
        return data;
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            throw new Error('Sem conexão com o servidor');
        }
        throw error;
    }
}

// Verificar se está online
function isOnline() {
    return navigator.onLine;
}

// Event listeners para status de conexão
window.addEventListener('online', () => {
    atualizarStatusConexao(true);
    sincronizarDados();
});

window.addEventListener('offline', () => {
    atualizarStatusConexao(false);
});

function atualizarStatusConexao(online) {
    const statusEl = document.getElementById('connectionStatus');
    const textEl = document.getElementById('connectionText');
    const syncBtn = document.getElementById('syncBtn');
    
    if (online) {
        statusEl.className = 'connection-status online';
        textEl.textContent = 'Conectado';
        syncBtn.style.display = 'none';
    } else {
        statusEl.className = 'connection-status offline';
        textEl.textContent = 'Modo Offline - Suas ações serão sincronizadas quando a conexão for restaurada';
        syncBtn.style.display = 'inline-block';
    }
}

// Inicializar status de conexão
atualizarStatusConexao(isOnline());

