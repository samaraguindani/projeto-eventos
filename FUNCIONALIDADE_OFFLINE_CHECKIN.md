# Funcionalidade Offline para Check-in (Admin e Atendente)

## 📋 Resumo

Implementada funcionalidade completa de modo offline para a área de check-in, permitindo que administradores e atendentes realizem check-ins mesmo sem conexão com a internet. Os dados são sincronizados automaticamente quando a conexão é restaurada.

## ✅ Funcionalidades Implementadas

### 1. Armazenamento Offline (IndexedDB)

**Arquivo:** `portal/js/database.js`

- **Usuários Offline**: Armazena usuários cadastrados rapidamente durante check-in offline
- **Check-ins Offline**: Armazena check-ins realizados sem conexão
- **Cache de Eventos**: Mantém lista de eventos para uso offline
- **Versão do Banco**: Atualizada para versão 2 para suportar novos stores

### 2. Check-in Offline

**Arquivo:** `portal/js/checkin.js`

#### Funcionalidades:
- ✅ **Buscar Participante Offline**: Busca participantes no IndexedDB quando offline
- ✅ **Cadastro Rápido Offline**: Permite cadastrar participantes sem conexão
- ✅ **Check-in Offline**: Registra check-ins localmente para sincronização posterior
- ✅ **Inscrição Automática**: Cria inscrição automaticamente durante check-in offline
- ✅ **Cache de Eventos**: Usa eventos em cache quando offline

#### Fluxo Offline:
1. Participante chega na porta do evento sem internet
2. Atendente/Admin seleciona evento (do cache)
3. Busca participante por CPF (no IndexedDB se cadastrado offline)
4. Se não encontrado, permite cadastro rápido offline
5. Realiza check-in (salvo no IndexedDB)
6. Quando houver conexão, sincroniza automaticamente

### 3. Sincronização

**Arquivo:** `portal/js/sync.js`

- ✅ Sincroniza cadastros rápidos realizados offline
- ✅ Sincroniza check-ins realizados offline
- ✅ Sincronização automática quando conexão é restaurada
- ✅ Botão manual de sincronização disponível

### 4. Backend - Endpoints de Sincronização

**Arquivos:** 
- `services/inscricoes-service/controllers/CheckinController.php`
- `services/inscricoes-service/index.php`

#### Novos Endpoints:

1. **POST `/api/inscricoes/checkin/sincronizar-cadastros`**
   - Sincroniza usuários cadastrados offline
   - Cria usuário no banco se não existir
   - Cria inscrição e registra check-in automaticamente

2. **POST `/api/inscricoes/checkin/sincronizar`**
   - Sincroniza check-ins realizados offline
   - Cria usuário se necessário (quando tem dados do usuário)
   - Cria inscrição se não existir
   - Registra presença

### 5. Cache de Eventos

**Arquivo:** `portal/js/eventos.js`

- ✅ Eventos são salvos no cache quando carregados online
- ✅ Cache é usado automaticamente quando offline
- ✅ Atualização automática do cache quando online

## 🔄 Fluxo Completo

### Cenário: Participante sem cadastro, sem inscrição, sem internet

1. **Atendente/Admin acessa check-in** (offline)
2. **Seleciona evento** (do cache)
3. **Busca participante por CPF** → Não encontrado
4. **Sistema mostra formulário de cadastro rápido**
5. **Atendente preenche**: Nome, CPF, Email
6. **Sistema salva localmente**:
   - Usuário no IndexedDB (`usuarios_offline`)
   - Check-in no IndexedDB (`checkins_offline`)
7. **Quando conexão é restaurada**:
   - Sincroniza cadastro → Cria usuário no servidor
   - Sincroniza check-in → Cria inscrição e registra presença
   - Envia emails de confirmação

### Cenário: Participante já cadastrado offline, sem inscrição

1. **Atendente busca por CPF** → Encontrado no IndexedDB
2. **Sistema mostra dados do participante**
3. **Atendente confirma check-in**
4. **Sistema salva check-in offline**
5. **Quando sincronizar**: Cria inscrição e registra presença

## 🎯 Casos de Uso Atendidos

✅ Participante chegou na porta do evento sem internet  
✅ Participante não está cadastrado → Pode cadastrar offline  
✅ Participante não está inscrito → Inscrição criada automaticamente durante check-in  
✅ Check-in realizado offline → Sincronizado quando houver conexão  
✅ Sincronização manual disponível (botão "Sincronizar Agora")  
✅ Sincronização automática quando conexão é restaurada  

## 🔧 Arquivos Modificados

1. `portal/js/database.js` - Expandido IndexedDB
2. `portal/js/checkin.js` - Funcionalidade offline completa
3. `portal/js/sync.js` - Sincronização de cadastros e check-ins
4. `portal/js/eventos.js` - Cache de eventos
5. `services/inscricoes-service/controllers/CheckinController.php` - Endpoints de sincronização
6. `services/inscricoes-service/index.php` - Rotas de sincronização

## 📝 Notas Técnicas

- **IndexedDB Version**: Atualizada para versão 2
- **Compatibilidade**: Funciona apenas para usuários com papel `admin` ou `atendente`
- **Validação**: CPF é normalizado (remove pontos e hífen) para busca
- **Senhas Temporárias**: Geradas localmente quando offline
- **IDs Temporários**: Usados no IndexedDB, substituídos por IDs reais após sincronização

## 🚀 Como Testar

1. **Desconecte a internet** (ou use DevTools → Network → Offline)
2. **Faça login como admin ou atendente**
3. **Acesse a seção Check-in**
4. **Selecione um evento** (do cache)
5. **Busque um participante por CPF** (ou cadastre um novo)
6. **Realize o check-in**
7. **Reconecte a internet**
8. **Verifique a sincronização automática** (ou clique em "Sincronizar Agora")

## ⚠️ Observações

- A funcionalidade offline está disponível **apenas para admin e atendente**
- Usuários comuns continuam usando o sistema normalmente (online)
- Os dados offline são sincronizados na ordem: cadastros → check-ins
- Emails são enviados apenas após sincronização bem-sucedida

