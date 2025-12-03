# 📥 Guia Rápido: Clonar Projeto do GitHub na VM

Guia rápido e direto para clonar seu projeto do GitHub na VM.

---

## 🚀 Método Rápido (HTTPS)

### 1. Conectar à VM

```bash
ssh univates@177.44.248.102
```

### 2. Instalar Git (se necessário)

```bash
sudo apt update
sudo apt install git -y
```

### 3. Clonar Repositório

```bash
cd ~
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git projeto-eventos
cd projeto-eventos
```

**Substitua:**
- `SEU_USUARIO` pelo seu usuário do GitHub
- `SEU_REPOSITORIO` pelo nome do seu repositório

**Exemplo:**
```bash
git clone https://github.com/univates/projeto-eventos.git projeto-eventos
```

### 4. Verificar

```bash
ls -la
# Deve mostrar: services/, portal/, database/, etc.
```

✅ **Pronto! Projeto clonado!**

---

## 🔐 Método com SSH (Recomendado para Repositórios Privados)

### 1. Gerar SSH Key na VM

```bash
# Conectar à VM
ssh univates@177.44.248.102

# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu.email@exemplo.com"

# Pressionar Enter 3 vezes (aceitar padrões)
```

### 2. Ver e Copiar Chave Pública

```bash
cat ~/.ssh/id_ed25519.pub
```

**Copie toda a saída** (começa com `ssh-ed25519`)

### 3. Adicionar Chave no GitHub

1. Acesse: https://github.com/settings/keys
2. Clique em **"New SSH key"**
3. **Title:** Digite um nome (ex: "VM Univates")
4. **Key:** Cole a chave que você copiou
5. Clique em **"Add SSH key"**

### 4. Testar Conexão SSH

```bash
ssh -T git@github.com
```

✅ **Deve mostrar:** `Hi SEU_USUARIO! You've successfully authenticated...`

### 5. Clonar via SSH

```bash
cd ~
git clone git@github.com:SEU_USUARIO/SEU_REPOSITORIO.git projeto-eventos
cd projeto-eventos
```

**Exemplo:**
```bash
git clone git@github.com:univates/projeto-eventos.git projeto-eventos
```

✅ **Pronto! Projeto clonado via SSH!**

---

## 🔄 Atualizar Projeto (Pull)

Se o projeto já está clonado e você quer atualizar:

```bash
cd ~/projeto-eventos
git pull origin main
# ou
git pull origin master
```

---

## 🔑 Personal Access Token (Para HTTPS Privado)

Se seu repositório é privado e você usa HTTPS:

### 1. Criar Token no GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. **Note:** Digite um nome (ex: "VM Access")
4. **Expiration:** Escolha um prazo
5. **Scopes:** Marque `repo` (acesso completo a repositórios)
6. Clique em **"Generate token"**
7. **⚠️ COPIE O TOKEN AGORA!** (não será mostrado novamente)

### 2. Usar Token ao Clonar

```bash
# Quando pedir usuário: digite seu usuário do GitHub
# Quando pedir senha: cole o token (não sua senha do GitHub)
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git projeto-eventos
```

### 3. Configurar Git Credential Helper (Opcional)

Para não digitar token toda vez:

```bash
git config --global credential.helper store

# Na primeira vez, digite o token quando pedir
# Nas próximas vezes, será usado automaticamente
```

---

## 🛠️ Troubleshooting

### Erro: "Permission denied (publickey)"

**Solução:** Configure SSH key (veja método SSH acima)

### Erro: "Repository not found"

**Soluções:**
- Verifique se o nome do repositório está correto
- Verifique se você tem acesso ao repositório
- Se for privado, use SSH ou Personal Access Token

### Erro: "fatal: could not read Username"

**Solução:** Use Personal Access Token como senha (veja seção acima)

### Erro: "Host key verification failed"

```bash
# Remover GitHub do known_hosts
ssh-keygen -R github.com

# Tentar novamente
ssh -T git@github.com
```

---

## 📋 Checklist Rápido

- [ ] Git instalado na VM
- [ ] Repositório clonado
- [ ] Estrutura do projeto verificada (services/, portal/, database/)
- [ ] Branch correto (main/master)
- [ ] Projeto atualizado (git pull)

---

## 🎯 Comandos Resumidos

```bash
# 1. Conectar à VM
ssh univates@177.44.248.102

# 2. Instalar Git (se necessário)
sudo apt install git -y

# 3. Clonar (HTTPS)
cd ~
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git projeto-eventos

# 4. Entrar no projeto
cd projeto-eventos

# 5. Verificar
ls -la
```

---

**✅ Pronto! Agora continue com o `GUIA_COMPLETO_VM.md` a partir do PASSO 5!**

