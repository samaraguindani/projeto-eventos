// IndexedDB para armazenamento offline
class OfflineDatabase {
    constructor() {
        this.dbName = 'eventos_offline';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store para inscrições pendentes
                if (!db.objectStoreNames.contains('inscricoes_pendentes')) {
                    const store = db.createObjectStore('inscricoes_pendentes', { keyPath: 'temp_id', autoIncrement: true });
                    store.createIndex('usuario_id', 'usuario_id', { unique: false });
                    store.createIndex('evento_id', 'evento_id', { unique: false });
                }

                // Store para presenças pendentes
                if (!db.objectStoreNames.contains('presencas_pendentes')) {
                    const store = db.createObjectStore('presencas_pendentes', { keyPath: 'temp_id', autoIncrement: true });
                    store.createIndex('codigo_inscricao', 'codigo_inscricao', { unique: false });
                }

                // Store para cancelamentos pendentes
                if (!db.objectStoreNames.contains('cancelamentos_pendentes')) {
                    const store = db.createObjectStore('cancelamentos_pendentes', { keyPath: 'temp_id', autoIncrement: true });
                    store.createIndex('inscricao_id', 'inscricao_id', { unique: false });
                }
            };
        });
    }

    async adicionarInscricaoPendente(usuarioId, eventoId) {
        const transaction = this.db.transaction(['inscricoes_pendentes'], 'readwrite');
        const store = transaction.objectStore('inscricoes_pendentes');
        return store.add({
            usuario_id: usuarioId,
            evento_id: eventoId,
            timestamp: new Date().toISOString()
        });
    }

    async adicionarPresencaPendente(codigoInscricao) {
        const transaction = this.db.transaction(['presencas_pendentes'], 'readwrite');
        const store = transaction.objectStore('presencas_pendentes');
        return store.add({
            codigo_inscricao: codigoInscricao,
            timestamp: new Date().toISOString()
        });
    }

    async adicionarCancelamentoPendente(inscricaoId) {
        const transaction = this.db.transaction(['cancelamentos_pendentes'], 'readwrite');
        const store = transaction.objectStore('cancelamentos_pendentes');
        return store.add({
            inscricao_id: inscricaoId,
            timestamp: new Date().toISOString()
        });
    }

    async obterInscricoesPendentes() {
        const transaction = this.db.transaction(['inscricoes_pendentes'], 'readonly');
        const store = transaction.objectStore('inscricoes_pendentes');
        return store.getAll();
    }

    async obterPresencasPendentes() {
        const transaction = this.db.transaction(['presencas_pendentes'], 'readonly');
        const store = transaction.objectStore('presencas_pendentes');
        return store.getAll();
    }

    async obterCancelamentosPendentes() {
        const transaction = this.db.transaction(['cancelamentos_pendentes'], 'readonly');
        const store = transaction.objectStore('cancelamentos_pendentes');
        return store.getAll();
    }

    async removerInscricaoPendente(tempId) {
        const transaction = this.db.transaction(['inscricoes_pendentes'], 'readwrite');
        const store = transaction.objectStore('inscricoes_pendentes');
        return store.delete(tempId);
    }

    async removerPresencaPendente(tempId) {
        const transaction = this.db.transaction(['presencas_pendentes'], 'readwrite');
        const store = transaction.objectStore('presencas_pendentes');
        return store.delete(tempId);
    }

    async removerCancelamentoPendente(tempId) {
        const transaction = this.db.transaction(['cancelamentos_pendentes'], 'readwrite');
        const store = transaction.objectStore('cancelamentos_pendentes');
        return store.delete(tempId);
    }
}

const offlineDB = new OfflineDatabase();

