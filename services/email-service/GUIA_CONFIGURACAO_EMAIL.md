# Guia de Configuracao de Emails com SMTP

Este guia explica como configurar o envio de emails reais usando SMTP (Gmail, Outlook, Mailgun, etc.).

## Pre-requisitos

1. Conta de email (Gmail, Outlook, ou outro)
2. PHP 7.4 ou superior
3. Composer instalado

## Opcoes Gratuitas

### Opcao 1: Gmail (Recomendado - Facil e Gratuito)

#### Passo 1: Ativar Senha de App no Gmail

1. Acesse sua conta Google: https://myaccount.google.com/
2. Vá em **Segurança**
3. Ative a **Verificação em duas etapas** (obrigatório)
4. Vá em **Senhas de app**
5. Selecione **Email** e **Outro (personalizado)**
6. Digite "Sistema de Eventos"
7. Clique em **Gerar**
8. **Copie a senha gerada** (16 caracteres, sem espaços)

#### Passo 2: Configurar Variaveis de Ambiente

```powershell
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_SECURE="tls"
$env:SMTP_USER="seu-email@gmail.com"
$env:SMTP_PASS="sua-senha-de-app-gerada"
$env:EMAIL_FROM="seu-email@gmail.com"
$env:EMAIL_FROM_NAME="Sistema de Eventos"
```

### Opcao 2: Outlook/Hotmail

#### Passo 1: Ativar Senha de App

1. Acesse: https://account.microsoft.com/security
2. Ative a **Verificação em duas etapas**
3. Vá em **Segurança** → **Senhas de app**
4. Gere uma senha de app para "Email"
5. Copie a senha gerada

#### Passo 2: Configurar

```powershell
$env:SMTP_HOST="smtp-mail.outlook.com"
$env:SMTP_PORT="587"
$env:SMTP_SECURE="tls"
$env:SMTP_USER="seu-email@outlook.com"
$env:SMTP_PASS="sua-senha-de-app"
$env:EMAIL_FROM="seu-email@outlook.com"
$env:EMAIL_FROM_NAME="Sistema de Eventos"
```

### Opcao 3: Mailgun (Servico Profissional Gratuito)

1. Acesse: https://www.mailgun.com/
2. Crie uma conta gratuita (5000 emails/mes gratis)
3. Vá em **Sending** → **Domain Settings**
4. Use as credenciais SMTP fornecidas

```powershell
$env:SMTP_HOST="smtp.mailgun.org"
$env:SMTP_PORT="587"
$env:SMTP_SECURE="tls"
$env:SMTP_USER="postmaster@seu-dominio.mailgun.org"
$env:SMTP_PASS="sua-senha-mailgun"
$env:EMAIL_FROM="noreply@seu-dominio.com"
$env:EMAIL_FROM_NAME="Sistema de Eventos"
```

## Configuracao Permanente (Arquivo .env)

1. Copie o arquivo `.env.example` para `.env`:
   ```powershell
   copy .env.example .env
   ```

2. Edite o arquivo `.env` e preencha suas credenciais:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=tls
   SMTP_USER=seu-email@gmail.com
   SMTP_PASS=sua-senha-de-app
   EMAIL_FROM=seu-email@gmail.com
   EMAIL_FROM_NAME=Sistema de Eventos
   ```

3. Para carregar o .env automaticamente, adicione no inicio do `processar-fila.php`:
   ```php
   // Carregar .env se existir
   if (file_exists(__DIR__ . '/.env')) {
       $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
       foreach ($lines as $line) {
           if (strpos(trim($line), '#') === 0) continue;
           list($name, $value) = explode('=', $line, 2);
           putenv(trim($name) . '=' . trim($value));
       }
   }
   ```

## Instalar Dependencias

```powershell
cd services\email-service
.\instalar-dependencias.ps1
```

## Iniciar Worker

```powershell
.\iniciar-worker-email.ps1
```

## Teste

1. Faca uma inscricao em um evento
2. Verifique o worker - deve mostrar:
   ```
   → Processados: 1 | Erros: 0 | Total: 1
   ```
3. Verifique sua caixa de entrada!

## Troubleshooting

### Gmail: "Username and Password not accepted"
- Certifique-se de usar a **Senha de App**, nao sua senha normal
- Verifique se a verificacao em duas etapas esta ativada
- Tente gerar uma nova senha de app

### Outlook: "Authentication failed"
- Use a senha de app, nao a senha da conta
- Verifique se a verificacao em duas etapas esta ativada

### "Connection timeout"
- Verifique se a porta esta correta (587 para TLS, 465 para SSL)
- Verifique se o firewall nao esta bloqueando
- Tente mudar SMTP_SECURE para "ssl" e porta para 465

### Emails nao chegam
- Verifique a pasta de spam
- Verifique os logs do worker
- Teste enviando para outro email

## Seguranca

- **NUNCA** commite o arquivo `.env` no Git
- Mantenha as credenciais seguras
- Use senhas de app em vez de senhas principais
- Revogue senhas de app antigas se comprometidas
