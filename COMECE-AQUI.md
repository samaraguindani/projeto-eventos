# 🎯 COMECE AQUI - 3 PASSOS SIMPLES (100% Local)

## ✅ Pré-requisitos (instale se não tiver)

1. **PostgreSQL** - https://www.postgresql.org/download/windows/
   - Durante instalação: porta 5432, usuário postgres, senha postgres
2. **.NET 8 SDK** - https://dotnet.microsoft.com/download/dotnet/8.0
3. **PHP 8.1+** - https://windows.php.net/download/
4. **Composer** - https://getcomposer.org/download/

---

## 🚀 3 PASSOS PARA RODAR O PROJETO

### PASSO 1: Abra o PowerShell na pasta do projeto
```powershell
cd C:\projeto-eventos
```

### PASSO 2: Criar o banco e tabelas (primeira vez)
```powershell
# Criar banco (se não existe)
createdb -U postgres eventos_db

# Criar tabelas
.\criar-tabelas.ps1
```

### PASSO 3: Iniciar serviços
```powershell
.\iniciar-tudo.ps1
```

O script vai:
- ✅ Verificar se PostgreSQL está rodando
- ✅ Instalar dependências
- ✅ Abrir 5 terminais com os serviços
- ✅ Abrir o navegador em http://localhost:8080

**PRONTO! O sistema está rodando! 🎉**

---

## 🎮 Testando o Sistema

1. **Criar uma conta**
   - Clique em "Registrar"
   - Preencha seus dados
   - Email: teste@teste.com
   - Senha: 123456

2. **Fazer login**
   - Use o email e senha que criou

3. **Explorar eventos**
   - Já existem 3 eventos de exemplo!

4. **Se inscrever em um evento**
   - Clique em um evento
   - Clique em "Inscrever"

---

## 🛑 Para Parar Tudo

```powershell
.\parar-tudo.ps1
```

---

## 📞 Problemas?

### "PostgreSQL não está rodando"
➡️ Abra Serviços do Windows (Win+R → services.msc) e inicie o serviço PostgreSQL

### "Porta já em uso"
➡️ Execute `.\parar-tudo.ps1` e tente de novo

### "Erro ao conectar no banco"
➡️ Aguarde mais alguns segundos, o banco demora para iniciar

### Outros problemas?
➡️ Veja o [GUIA_INSTALACAO_LOCAL.md](./GUIA_INSTALACAO_LOCAL.md) para detalhes

---

## 📖 Mais Informações

- **Setup Local (Sem Docker):** [SETUP-LOCAL-SEM-DOCKER.md](./SETUP-LOCAL-SEM-DOCKER.md) 🆕
- **Referência Rápida:** [README-LOCAL.md](./README-LOCAL.md)
- **Testar APIs:** [GUIA_SWAGGER.md](./GUIA_SWAGGER.md)

---

## 🌐 URLs Importantes

- **Portal:** http://localhost:8080 👈 ACESSE AQUI
- **Swagger:** http://localhost:5002/swagger 👈 TESTAR APIs
- **pgAdmin:** Use o instalado com PostgreSQL (localhost:5432)

---

**É só isso! Simples assim! 🚀**



