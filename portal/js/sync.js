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

        // Sincronizar usuários cadastrados offline (check-in)
        const usuariosOffline = await offlineDB.obterUsuariosOffline();
        if (usuariosOffline.length > 0) {
            const usuariosParaSync = usuariosOffline.map(u => ({
                nome: u.nome,
                email: u.email,
                cpf: u.cpf,
                evento_id: u.evento_id,
                senha_temporaria: u.senha_temporaria,
                temp_id: u.temp_id
            }));

            try {
                const resultado = await apiRequest(`${API_CONFIG.INSCRICOES}/checkin/sincronizar-cadastros`, {
                    method: 'POST',
                    body: JSON.stringify({ usuarios: usuariosParaSync })
                });

                // Remover usuários sincronizados
                for (const usuario of usuariosOffline) {
                    await offlineDB.removerUsuarioOffline(usuario.temp_id);
                }

                mostrarMensagem(`${usuariosOffline.length} cadastro(s) sincronizado(s)`, 'success');
            } catch (error) {
                mostrarMensagem(`Erro ao sincronizar cadastros: ${error.message}`, 'error');
            }
        }

        // Sincronizar check-ins offline
        const checkinsOffline = await offlineDB.obterCheckinsOffline();
        if (checkinsOffline.length > 0) {
            const checkinsParaSync = checkinsOffline.map(c => ({
                cpf: c.cpf,
                evento_id: c.evento_id,
                dados_usuario: c.dados_usuario,
                temp_id: c.temp_id
            }));

            try {
                const resultado = await apiRequest(`${API_CONFIG.INSCRICOES}/checkin/sincronizar`, {
                    method: 'POST',
                    body: JSON.stringify({ checkins: checkinsParaSync })
                });

                // Remover check-ins sincronizados
                for (const checkin of checkinsOffline) {
                    await offlineDB.removerCheckinOffline(checkin.temp_id);
                }

                mostrarMensagem(`${checkinsOffline.length} check-in(s) sincronizado(s)`, 'success');
            } catch (error) {
                mostrarMensagem(`Erro ao sincronizar check-ins: ${error.message}`, 'error');
            }
        }

        // Sincronizar usuários do servidor para o cache local (para busca offline)
        // Buscar usuários que foram encontrados durante check-ins sincronizados
        try {
            // Após sincronizar check-ins, os usuários já foram criados/encontrados no servidor
            // Podemos buscar alguns usuários recentes para cache (opcional)
            // Por enquanto, os usuários são salvos no cache quando são buscados online
            console.log('Cache de usuários será atualizado quando usuários forem buscados online');
        } catch (error) {
            console.error('Erro ao sincronizar cache de usuários:', error);
        }

        // Recarregar dados
        carregarMinhasInscricoes();
        carregarEventos();
        
        // Recarregar eventos do check-in se estiver na seção
        if (document.getElementById('checkinSection') && document.getElementById('checkinSection').classList.contains('active')) {
            carregarEventosParaCheckin();
        }
        
    } catch (error) {
        mostrarMensagem(`Erro na sincronização: ${error.message}`, 'error');
    }
}

// Sincronizar usuários do servidor para o cache local (chamado quando online)
async function sincronizarUsuariosCache() {
    if (!isOnline()) {
        return;
    }

    try {
        // Buscar usuários recentes do servidor (opcional - pode ser implementado se houver endpoint)
        // Por enquanto, usuários são salvos no cache quando são buscados durante check-in
        console.log('Usuários são salvos no cache automaticamente quando buscados');
    } catch (error) {
        console.error('Erro ao sincronizar cache de usuários:', error);
    }
}

// Sincronização automática quando voltar online
window.addEventListener('online', () => {
    setTimeout(() => {
        sincronizarDados();
    }, 1000);
});







