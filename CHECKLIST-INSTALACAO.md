# ✅ CHECKLIST DE INSTALAÇÃO LOCAL

Use este checklist para garantir que tudo está configurado corretamente.

## 📦 FASE 1: Instalação de Pré-requisitos

### Docker Desktop
- [ ] Baixado de https://www.docker.com/products/docker-desktop/
- [ ] Instalado
- [ ] Aberto e rodando (ícone na bandeja)
- [ ] Testado com `docker --version` no PowerShell

### .NET 8 SDK
- [ ] Baixado de https://dotnet.microsoft.com/download/dotnet/8.0
- [ ] Instalado
- [ ] Testado com `dotnet --version` no PowerShell

### PHP 8.1+
- [ ] Baixado de https://windows.php.net/download/
- [ ] Extraído em uma pasta (ex: C:\php)
- [ ] Adicionado ao PATH do Windows
- [ ] Testado com `php --version` no PowerShell

### Composer
- [ ] Baixado de https://getcomposer.org/download/
- [ ] Instalado
- [ ] Testado com `composer --version` no PowerShell

---

## 🚀 FASE 2: Primeiro Uso

### Preparação
- [ ] Abri o PowerShell
- [ ] Naveguei até `C:\projeto-eventos`
- [ ] Docker Desktop está aberto e rodando

### Execução
- [ ] Executei `.\iniciar-tudo.ps1`
- [ ] Aguardei o script terminar (pode demorar 1-2 minutos)
- [ ] Vi 5 novos terminais abrirem
- [ ] Navegador abriu automaticamente em http://localhost:8080

---

## 🔍 FASE 3: Verificação

### Containers Docker
Executar no PowerShell:
```powershell
docker ps
```

Deve mostrar:
- [ ] `eventos-postgres` rodando
- [ ] `eventos-pgadmin` rodando

### Serviços
Verificar nos terminais que abriram:

- [ ] **Terminal 1:** Auth Service - mostra "Now listening on: http://localhost:5001"
- [ ] **Terminal 2:** Eventos Service - mostra "Now listening on: http://localhost:5002"
- [ ] **Terminal 3:** Inscrições Service - mostra "Listening on http://localhost:8001"
- [ ] **Terminal 4:** Certificados Service - mostra "Listening on http://localhost:8002"
- [ ] **Terminal 5:** Portal - mostra "Listening on http://localhost:8080"

### Acesso Web
- [ ] http://localhost:8080 - Portal abre normalmente
- [ ] http://localhost:5050 - pgAdmin abre (opcional)

---

## 🎮 FASE 4: Teste do Sistema

### Criar Usuário
- [ ] Cliquei em "Registrar"
- [ ] Preenchi os dados:
  - Nome: Teste Usuario
  - Email: teste@teste.com
  - Senha: 123456
  - CPF: 12345678901
- [ ] Cliquei em "Cadastrar"
- [ ] Recebi mensagem de sucesso

### Login
- [ ] Voltei para a tela de login
- [ ] Digitei email: teste@teste.com
- [ ] Digitei senha: 123456
- [ ] Cliquei em "Entrar"
- [ ] Fui redirecionado para o painel

### Explorar Eventos
- [ ] Vejo lista de eventos
- [ ] Existem 3 eventos de exemplo
- [ ] Consigo ver detalhes dos eventos

### Fazer Inscrição
- [ ] Cliquei em um evento
- [ ] Cliquei em "Inscrever"
- [ ] Recebi confirmação de inscrição
- [ ] Vejo a inscrição na lista "Minhas Inscrições"

---

## 🎉 RESULTADO ESPERADO

Se tudo acima funcionou:
- ✅ **SUCESSO!** O sistema está 100% funcional localmente!
- ✅ Você pode começar a desenvolver
- ✅ Todos os serviços estão rodando
- ✅ Banco de dados está funcionando

---

## ❌ PROBLEMAS COMUNS

### ❌ Docker não inicia
**Solução:** 
1. Reinicie o computador
2. Abra o Docker Desktop manualmente
3. Aguarde 1-2 minutos
4. Tente de novo

### ❌ "php não é reconhecido"
**Solução:**
1. Verifique se o PHP foi adicionado ao PATH
2. Abra uma nova janela do PowerShell
3. Tente novamente

### ❌ "dotnet não é reconhecido"
**Solução:**
1. Reinstale o .NET SDK
2. Abra uma nova janela do PowerShell
3. Tente novamente

### ❌ "Porta 5432 já em uso"
**Solução:**
1. Execute: `.\parar-tudo.ps1`
2. Se persistir:
   ```powershell
   docker stop eventos-postgres eventos-pgadmin
   docker rm eventos-postgres eventos-pgadmin
   docker-compose up -d
   ```

### ❌ Serviços não iniciam
**Solução:**
1. Verifique se o banco está pronto:
   ```powershell
   docker logs eventos-postgres
   ```
2. Aguarde mais alguns segundos
3. Feche os terminais e execute `.\iniciar-tudo.ps1` novamente

### ❌ Erro "Failed to connect to database"
**Solução:**
1. Verifique se o container PostgreSQL está rodando:
   ```powershell
   docker ps
   ```
2. Se não estiver, reinicie:
   ```powershell
   docker-compose restart postgres
   ```
3. Aguarde 10 segundos
4. Reinicie os serviços

---

## 📞 Ainda com Problemas?

1. Consulte o [GUIA_INSTALACAO_LOCAL.md](./GUIA_INSTALACAO_LOCAL.md)
2. Veja a seção de troubleshooting detalhada
3. Verifique os logs dos serviços nos terminais

---

## 🎯 Próximos Passos

Depois que tudo funcionar:
- [ ] Explore o código
- [ ] Faça alterações
- [ ] Teste localmente
- [ ] Commit no Git
- [ ] Desenvolva novas features!

---

**Boa sorte! 🚀**




