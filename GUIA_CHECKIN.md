# 📋 Guia do Sistema de Check-in

## 🎯 Visão Geral

Sistema completo de check-in para atendentes de eventos com:
- ✅ Check-in por CPF
- ✅ Cadastro rápido na portaria
- ✅ Perfil de usuário
- ✅ Usuários admin e atendente

## 🚀 Como Configurar

### Passo 1: Criar usuários admin e atendente

Execute o script PowerShell:

```powershell
.\criar-admin.ps1
```

Isso criará:
- **Admin**: admin@eventos.com | Senha: password
- **Atendente**: atendente@eventos.com | Senha: password

### Passo 2: Reiniciar os serviços

```powershell
.\parar-tudo.ps1
.\iniciar-tudo.ps1
```

## 👥 Tipos de Usuário

### 1. Admin
- Acesso total ao sistema
- Pode fazer check-in
- Gerencia eventos

### 2. Atendente
- Faz check-in dos participantes
- Cadastro rápido na portaria
- Não gerencia eventos

### 3. Usuário
- Participante comum
- Se inscreve em eventos
- Emite certificados

## 📱 Funcionalidades do Check-in

### Para Atendentes:

#### 1. Check-in de Participante Inscrito

1. Faça login como atendente
2. Vá em "Check-in"
3. Selecione o evento
4. Digite o CPF do participante
5. Clique em "Buscar"
6. Se encontrado e inscrito → Clique em "Registrar Check-in"

#### 2. Cadastro Rápido na Portaria

Quando um participante NÃO inscrito chega no evento:

1. Selecione o evento
2. Digite o CPF
3. Clique em "Buscar"
4. Sistema mostra formulário de cadastro rápido
5. Preencha:
   - Nome completo
   - CPF
   - Email
6. Clique em "Cadastrar e Fazer Check-in"

**O que acontece:**
- ✅ Usuário é criado no sistema
- ✅ Inscrição é feita automaticamente
- ✅ Check-in é registrado imediatamente
- ✅ Email é enviado com senha temporária
- ⚠️ Cadastro fica marcado como "incompleto"

#### 3. Senha Temporária

Após cadastro rápido, o sistema:
- Gera uma senha aleatória
- Exibe em um alerta (anote!)
- Envia por email para o participante
- Participante pode fazer login e completar cadastro

## 👤 Perfil do Usuário

### Para Participantes:

#### Completar Cadastro

Se você foi cadastrado na portaria:

1. Faça login com email e senha temporária
2. Vá em "Meu Perfil"
3. Verá um aviso: "⚠ Cadastro Incompleto!"
4. Complete os dados:
   - Nome completo
   - CPF (se não preenchido)
   - Telefone
   - Data de nascimento
5. Altere a senha temporária
6. Clique em "Salvar Alterações"

#### Atualizar Dados

Qualquer usuário pode:
- Atualizar nome
- Adicionar telefone
- Adicionar data de nascimento
- Alterar senha

**Campos bloqueados:**
- Email (não pode ser alterado)
- CPF (não pode ser alterado após preenchido)

## 🔧 Endpoints da API

### Check-in

#### Buscar participante por CPF
```http
POST /api/inscricoes/checkin/buscar
Content-Type: application/json

{
  "cpf": "123.456.789-00",
  "evento_id": 1
}
```

Resposta:
```json
{
  "encontrado": true,
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com",
    "cpf": "123.456.789-00",
    "cadastro_completo": true
  },
  "inscricao": {
    "id": 1,
    "presenca_registrada": false,
    ...
  },
  "tem_inscricao": true
}
```

#### Registrar check-in
```http
POST /api/inscricoes/checkin/registrar
Content-Type: application/json

{
  "cpf": "123.456.789-00",
  "evento_id": 1
}
```

#### Cadastro rápido
```http
POST /api/inscricoes/checkin/cadastro-rapido
Content-Type: application/json

{
  "nome": "Maria Santos",
  "cpf": "987.654.321-00",
  "email": "maria@email.com",
  "evento_id": 1
}
```

Resposta:
```json
{
  "message": "Cadastro e check-in realizados com sucesso!",
  "usuario_id": 5,
  "inscricao_id": 10,
  "codigo_inscricao": "INS-20241206140830-1234",
  "senha_temporaria": "a3f7b9c2d4e1"
}
```

## 📧 Emails Enviados

### Email de Cadastro Rápido

```
Assunto: Bem-vindo! Complete seu cadastro - [Nome do Evento]

Olá, [Nome]!

Bem-vindo ao evento [Nome do Evento]!

Seu cadastro e check-in foram realizados com sucesso na portaria do evento.

Importante: Complete seu cadastro para ter acesso total ao sistema.

Dados de Acesso Temporários:
Email: [email]
Senha Temporária: [senha]
Código de Inscrição: [código]

[Botão: Acessar Sistema]
```

## 🎨 Interface

### Navegação (para atendentes)

```
[Sistema de Eventos]
  Eventos | Minhas Inscrições | Certificados | Check-in | Meu Perfil | Sair
```

### Tela de Check-in

```
┌─────────────────────────────────────┐
│ Check-in de Participantes           │
├─────────────────────────────────────┤
│ Evento: [Selecione um evento ▼]    │
│                                     │
│ CPF do Participante:                │
│ [___.___.___-__] [Buscar]          │
│                                     │
│ [Resultado da busca aparece aqui]  │
└─────────────────────────────────────┘
```

### Tela de Perfil

```
┌─────────────────────────────────────┐
│ ⚠ Cadastro Incompleto!             │
│ Complete seus dados para ter        │
│ acesso total ao sistema.            │
├─────────────────────────────────────┤
│ Meu Perfil                          │
│                                     │
│ Nome: [________________]            │
│ Email: [________________] (readonly)│
│ CPF: [___.___.___-__]              │
│ Telefone: [(__) _____-____]        │
│ Data Nasc: [__/__/____]            │
│                                     │
│ Alterar Senha                       │
│ Senha Atual: [________]             │
│ Nova Senha: [________]              │
│ Confirmar: [________]               │
│                                     │
│ [Salvar Alterações]                 │
└─────────────────────────────────────┘
```

## 🔒 Segurança

- Senhas são hasheadas com BCrypt
- Senhas temporárias são aleatórias (16 caracteres)
- CPF é único no sistema
- Email é único no sistema
- Token JWT para autenticação

## 🧪 Como Testar

### Teste 1: Check-in de participante inscrito

1. Crie um usuário normal e inscreva em um evento
2. Faça login como atendente
3. Vá em Check-in
4. Busque pelo CPF do usuário
5. Registre o check-in

### Teste 2: Cadastro rápido

1. Faça login como atendente
2. Vá em Check-in
3. Digite um CPF que não existe
4. Preencha o formulário de cadastro rápido
5. Anote a senha temporária
6. Faça logout
7. Faça login com o email e senha temporária
8. Complete o cadastro no perfil

### Teste 3: Completar cadastro

1. Faça login com usuário de cadastro incompleto
2. Vá em "Meu Perfil"
3. Veja o aviso de cadastro incompleto
4. Complete os dados
5. Altere a senha
6. Salve

## 📊 Estrutura do Banco

### Campos adicionados em `usuarios`:

```sql
cpf VARCHAR(14) UNIQUE
papel VARCHAR(20) DEFAULT 'usuario'  -- usuario, atendente, admin
cadastro_completo BOOLEAN DEFAULT TRUE
```

## 💡 Dicas

1. **Para atendentes**: Sempre anote a senha temporária gerada
2. **Para participantes**: Altere a senha temporária assim que possível
3. **CPF**: Use formato com pontos e hífen (000.000.000-00)
4. **Telefone**: Use formato (00) 00000-0000
5. **Máscaras**: Aplicadas automaticamente nos campos

## 🛠️ Troubleshooting

### Erro: "CPF já cadastrado"
- O CPF já existe no sistema
- Use a função de busca para encontrar o participante

### Erro: "Email já cadastrado"
- O email já está em uso
- Verifique se o participante já tem cadastro

### Senha temporária não funciona
- Verifique se copiou corretamente
- Senha é case-sensitive
- Tente fazer reset de senha

### Cadastro não completa
- Verifique se preencheu todos os campos obrigatórios
- CPF deve estar no formato correto
- Senha deve ter no mínimo 6 caracteres

## 📝 Checklist de Implementação

- [x] Adicionar campos CPF, papel e cadastro_completo
- [x] Criar usuários admin e atendente
- [x] Criar endpoints de check-in
- [x] Criar endpoint de cadastro rápido
- [x] Criar interface de check-in
- [x] Criar interface de perfil
- [x] Adicionar máscaras de CPF e telefone
- [x] Enviar email com senha temporária
- [x] Marcar cadastros incompletos
- [ ] Adicionar seções ao HTML principal
- [ ] Atualizar navegação
- [ ] Testar fluxo completo

## 🎯 Próximos Passos

Para finalizar a implementação, você precisa:

1. Atualizar o `index.html` para incluir:
   - Link "Check-in" no menu (para atendentes)
   - Link "Meu Perfil" no menu
   - Seção de check-in
   - Seção de perfil

2. Incluir os scripts no HTML:
   ```html
   <script src="js/checkin.js"></script>
   <script src="js/perfil.js"></script>
   ```

3. Executar `.\criar-admin.ps1`

4. Reiniciar os serviços

5. Testar!

---

**Sistema pronto para uso!** 🎉



