# Configuracao de Envio de Emails Reais

O sistema agora esta configurado para enviar emails reais usando **SMTP** (Gmail, Outlook, Mailgun, etc.).

## O que foi implementado:

1. **PHPMailer com SMTP** - Suporta qualquer servidor SMTP
2. **Templates HTML** - Emails formatados e profissionais
3. **Fila de emails** - Sistema assincrono para envio
4. **Worker** - Processa emails automaticamente

## Emails enviados automaticamente:

- **Inscricao** - Quando usuario se inscreve em um evento
- **Cancelamento** - Quando usuario cancela uma inscricao
- **Check-in** - Quando presenca e registrada (admin/atendente)

## Passos para Configurar:

### 1. Instalar Dependencias

```powershell
cd services\email-service
.\instalar-dependencias.ps1
```

### 2. Configurar Gmail (Mais Facil)

#### Ativar Senha de App:
1. Acesse: https://myaccount.google.com/security
2. Ative **Verificacao em duas etapas**
3. Vá em **Senhas de app**
4. Gere uma senha para "Email"
5. Copie a senha (16 caracteres)

#### Configurar Variaveis:
```powershell
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_SECURE="tls"
$env:SMTP_USER="seu-email@gmail.com"
$env:SMTP_PASS="sua-senha-de-app-gerada"
$env:EMAIL_FROM="seu-email@gmail.com"
$env:EMAIL_FROM_NAME="Sistema de Eventos"
```

### 3. Ou usar Arquivo .env (Permanente)

1. Copie `services\email-service\.env.example` para `services\email-service\.env`
2. Edite e preencha suas credenciais

### 4. Iniciar Worker de Emails

```powershell
.\iniciar-worker-email.ps1
```

## Verificacao

1. Faca uma inscricao em um evento
2. Verifique o worker - deve mostrar:
   ```
   → Processados: 1 | Erros: 0 | Total: 1
   ```
3. Verifique sua caixa de entrada!

## Outras Opcoes

- **Outlook**: `smtp-mail.outlook.com` porta 587
- **Mailgun**: Gratis 5000 emails/mes
- **Qualquer SMTP**: Configure host, porta e credenciais

## Documentacao Completa

Veja `services\email-service\GUIA_CONFIGURACAO_EMAIL.md` para mais detalhes.

