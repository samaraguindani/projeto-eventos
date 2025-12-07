# 📧 Guia do Sistema de Emails

## Visão Geral

O sistema de eventos envia emails automaticamente em 4 situações:

1. ✅ **Inscrição em evento** - Quando um usuário se inscreve
2. ❌ **Cancelamento** - Quando um usuário cancela a inscrição
3. ✓ **Check-in** - Quando a presença é registrada
4. 🎓 **Certificado emitido** - Quando o certificado é gerado

## Como Funciona

### Arquitetura

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────┐
│ Serviço de      │─────▶│  Fila de     │◀─────│   Worker    │
│ Inscrições/     │      │  Emails      │      │   de Email  │
│ Certificados    │      │ (Banco PG)   │      │             │
└─────────────────┘      └──────────────┘      └─────────────┘
       │                                              │
       │  1. Adiciona email                           │  2. Processa
       │     à fila                                    │     e envia
       └──────────────────────────────────────────────┘
```

### Processo

1. **Evento Acontece**: Usuário se inscreve, faz check-in ou emite certificado
2. **Enfileiramento**: Email é adicionado à tabela `email_queue` com status `pending`
3. **Processamento**: Worker processa a fila a cada 10 segundos
4. **Envio**: Email é enviado e status muda para `sent`
5. **Retry**: Se falhar, tenta novamente até 3 vezes

## 🚀 Como Iniciar

### Passo 1: Iniciar o sistema completo

```powershell
.\iniciar-tudo.ps1
```

### Passo 2: Iniciar o worker de emails

```powershell
.\iniciar-worker-email.ps1
```

O worker abrirá em um novo terminal e ficará rodando continuamente.

## 📝 Conteúdo dos Emails

### Email de Inscrição

```
Assunto: Confirmação de Inscrição - [Nome do Evento]

Olá, [Nome do Usuário]!

Sua inscrição no evento [Nome do Evento] foi confirmada!

Data: [Data do Evento]
Local: [Local do Evento]
Código de Inscrição: [Código]

Atenciosamente,
Equipe de Eventos
```

### Email de Certificado

```
Assunto: Seu Certificado - [Nome do Evento]

Olá, [Nome do Usuário]!

Seu certificado do evento [Nome do Evento] está disponível!

Código de Validação: [Código]

Atenciosamente,
Equipe de Eventos
```

## 🔧 Configuração

### Modo Desenvolvimento (Padrão)

Por padrão, os emails NÃO são enviados de verdade. Eles são apenas registrados no log.

Você pode ver os emails processados no terminal do worker.

### Modo Produção (SMTP Real)

Para enviar emails de verdade, configure as variáveis de ambiente:

```powershell
$env:SMTP_HOST = "smtp.gmail.com"
$env:SMTP_PORT = "587"
$env:SMTP_USER = "seu-email@gmail.com"
$env:SMTP_PASS = "sua-senha-app"
$env:SMTP_FROM = "noreply@eventos.com"
```

E descomente a linha de envio real em `services/email-service/services/EmailQueueService.php`:

```php
// Linha 146 - Descomente para envio real:
return mail($destinatario, $assunto, $corpo, $headers);

// E comente a linha 150:
// return true;
```

### Gmail - Senha de App

Se usar Gmail, você precisa criar uma "Senha de App":

1. Acesse: https://myaccount.google.com/security
2. Ative a verificação em duas etapas
3. Gere uma senha de app
4. Use essa senha na variável `SMTP_PASS`

## 🧪 Como Testar

### 1. Verificar se o worker está rodando

Abra o terminal do worker - deve aparecer algo como:

```
=========================================
  WORKER DE EMAILS INICIADO
=========================================
Processando fila de emails...

[2024-12-06 15:30:00] Ciclo #1 - Processando fila...
  → Nenhum email na fila
```

### 2. Fazer uma inscrição

1. Acesse: http://localhost:8080
2. Faça login
3. Inscreva-se em um evento

### 3. Verificar o worker

O terminal do worker deve mostrar:

```
[2024-12-06 15:30:10] Ciclo #2 - Processando fila...
  → Processados: 1 | Erros: 0 | Total: 1
```

### 4. Verificar o log (modo desenvolvimento)

No terminal do worker, você verá:

```
Email enviado para: usuario@email.com | Assunto: Confirmação de Inscrição - Workshop
```

### 5. Verificar no banco de dados

```sql
SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 10;
```

Status possíveis:
- `pending` - Aguardando processamento
- `processing` - Sendo processado
- `sent` - Enviado com sucesso ✓
- `failed` - Falhou após 3 tentativas ✗

## 📊 Monitoramento

### Ver status da fila via API

```bash
curl http://localhost:8003/api/email/status
```

Resposta:
```json
{
  "total": 15,
  "por_status": {
    "sent": 12,
    "pending": 2,
    "failed": 1
  }
}
```

### Listar emails na fila

```bash
curl http://localhost:8003/api/email/fila
```

## 🛠️ Troubleshooting

### Worker não processa emails

1. Verifique se o PostgreSQL está rodando
2. Verifique se o banco `eventos_db` existe
3. Verifique as credenciais no código

### Emails não chegam (modo produção)

1. Verifique as configurações SMTP
2. Teste com uma ferramenta como Mailtrap.io primeiro
3. Verifique o firewall/antivírus
4. Confira os logs de erro

### Ver erros no banco

```sql
SELECT destinatario, assunto, erro, tentativas 
FROM email_queue 
WHERE status = 'failed';
```

## 📁 Arquivos Importantes

```
projeto-eventos/
├── services/
│   ├── inscricoes-service/
│   │   └── services/
│   │       └── EmailService.php      # Enfileira emails de inscrição
│   ├── certificados-service/
│   │   └── services/
│   │       └── EmailService.php      # Enfileira emails de certificado
│   └── email-service/
│       ├── services/
│       │   └── EmailQueueService.php # Processa e envia emails
│       └── processar-fila.php        # Worker (script principal)
├── iniciar-worker-email.ps1          # Script para iniciar worker
└── GUIA_EMAILS.md                    # Este arquivo
```

## 💡 Dicas

1. **Desenvolvimento**: Deixe o modo padrão (simulação) - mais rápido
2. **Testes**: Use serviços como Mailtrap.io ou MailHog
3. **Produção**: Configure SMTP real apenas em produção
4. **Monitoramento**: Verifique a fila regularmente
5. **Performance**: Ajuste o intervalo do worker conforme necessário

## ⚙️ Personalização

### Alterar intervalo do worker

No arquivo `processar-fila.php`, linha 42:

```php
sleep(10);  // Altere para o número de segundos desejado
```

### Alterar quantidade processada por ciclo

No arquivo `processar-fila.php`, linha 17:

```php
$emailService->processarFila(10);  // Altere o número
```

### Personalizar templates de email

Edite os métodos em:
- `services/inscricoes-service/services/EmailService.php`
- `services/certificados-service/services/EmailService.php`

Método `gerarCorpo()` - linha 80+

## 🎯 Resumo Rápido

```powershell
# 1. Iniciar sistema
.\iniciar-tudo.ps1

# 2. Iniciar worker de emails
.\iniciar-worker-email.ps1

# 3. Testar
# - Faça uma inscrição no portal
# - Verifique o terminal do worker
# - Veja o log de emails enviados

# 4. Monitorar
# Abra: http://localhost:8003/api/email/status
```

Pronto! O sistema de emails está funcionando! 📧✨



