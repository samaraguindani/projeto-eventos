// Funções de sincronização offline
async function sincronizarDados() {
    if (!isOnline()) {
        mostrarMensagem('Você precisa estar online para sincronizar', 'error');
        return;
    }

    if (!verificarAutenticacao()) {
        return;
    }

    try {
        await offlineDB.init();
        
        // Sincronizar inscrições
        const inscricoesPendentes = await offlineDB.obterInscricoesPendentes();
        if (inscricoesPendentes.length > 0) {
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            const inscricoesParaSync = inscricoesPendentes.map(i => ({
                usuario_id: usuario.id,
                evento_id: i.evento_id,
                temp_id: i.temp_id
            }));

            try {
                const resultado = await apiRequest(`${API_CONFIG.INSCRICOES}/sincronizar`, {
                    method: 'POST',
                    body: JSON.stringify({ inscricoes: inscricoesParaSync })
                });

                // Remover inscrições sincronizadas
                for (const inscricao of inscricoesPendentes) {
                    await offlineDB.removerInscricaoPendente(inscricao.temp_id);
                }

                mostrarMensagem(`${inscricoesPendentes.length} inscrição(ões) sincronizada(s)`, 'success');
            } catch (error) {
                mostrarMensagem(`Erro ao sincronizar inscrições: ${error.message}`, 'error');
            }
        }

        // Sincronizar presenças
        const presencasPendentes = await offlineDB.obterPresencasPendentes();
        if (presencasPendentes.length > 0) {
            const presencasParaSync = presencasPendentes.map(p => ({
                codigo_inscricao: p.codigo_inscricao,
                temp_id: p.temp_id
            }));

            try {
                const resultado = await apiRequest(`${API_CONFIG.INSCRICOES}/presenca/sincronizar`, {
                    method: 'POST',
                    body: JSON.stringify({ presencas: presencasParaSync })
                });

                // Remover presenças sincronizadas
                for (const presenca of presencasPendentes) {
                    await offlineDB.removerPresencaPendente(presenca.temp_id);
                }

                mostrarMensagem(`${presencasPendentes.length} presença(s) sincronizada(s)`, 'success');
            } catch (error) {
                mostrarMensagem(`Erro ao sincronizar presenças: ${error.message}`, 'error');
            }
        }

        // Sincronizar cancelamentos
        const cancelamentosPendentes = await offlineDB.obterCancelamentosPendentes();
        if (cancelamentosPendentes.length > 0) {
            const cancelamentosParaSync = cancelamentosPendentes.map(c => ({
                inscricao_id: c.inscricao_id,
                temp_id: c.temp_id
            }));

            try {
                const resultado = await apiRequest(`${API_CONFIG.INSCRICOES}/cancelar/sincronizar`, {
                    method: 'POST',
                    body: JSON.stringify({ cancelamentos: cancelamentosParaSync })
                });

                // Remover cancelamentos sincronizados
                for (const cancelamento of cancelamentosPendentes) {
                    await offlineDB.removerCancelamentoPendente(cancelamento.temp_id);
                }

                mostrarMensagem(`${cancelamentosPendentes.length} cancelamento(s) sincronizado(s)`, 'success');
            } catch (error) {
                mostrarMensagem(`Erro ao sincronizar cancelamentos: ${error.message}`, 'error');
            }
        }

        // Recarregar dados
        carregarMinhasInscricoes();
        carregarEventos();
        
    } catch (error) {
        mostrarMensagem(`Erro na sincronização: ${error.message}`, 'error');
    }
}

// Sincronização automática quando voltar online
window.addEventListener('online', () => {
    setTimeout(() => {
        sincronizarDados();
    }, 1000);
});





