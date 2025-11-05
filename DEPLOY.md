# 🚀 Guia de Deploy - ChatGPT Clone

Este documento contém instruções para fazer deploy do ChatGPT Clone em diferentes plataformas.

## 📦 Preparação

Antes de fazer deploy, certifique-se de:

1. ✅ Ter um workflow configurado no n8n
2. ✅ Ter a URL do webhook n8n disponível
3. ✅ Ter testado o projeto localmente

## 🌐 Opções de Deploy

### 1. Vercel (Recomendado)

A forma mais fácil de fazer deploy de aplicações Next.js.

#### Passo a Passo:

1. **Criar conta na Vercel**
   - Acesse: https://vercel.com
   - Faça login com GitHub

2. **Conectar Repositório**
   ```bash
   # Se ainda não tem um repositório Git
   cd /srv/frontend
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/chatgpt-clone.git
   git push -u origin main
   ```

3. **Importar no Vercel**
   - No dashboard da Vercel, clique em "Add New Project"
   - Selecione o repositório
   - Configure:
     - Framework Preset: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build completar
   - Seu site estará disponível em: `seu-projeto.vercel.app`

#### Configurações Importantes:

- **Environment Variables**: Não são necessárias (configurações são feitas pelo usuário no site)
- **Domain**: Você pode adicionar um domínio customizado nas configurações do projeto

---

### 2. Netlify

Alternativa popular com ótimo suporte para Next.js.

#### Passo a Passo:

1. **Criar conta na Netlify**
   - Acesse: https://netlify.com

2. **Instalar Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

3. **Deploy**
   ```bash
   cd /srv/frontend
   netlify deploy --prod
   ```

4. **Configurar Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

---

### 3. Docker

Para deploy em servidor próprio ou cloud providers.

#### Criar Dockerfile:

Crie um arquivo `Dockerfile` na raiz do projeto:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### Criar docker-compose.yml:

```yaml
version: '3.8'

services:
  chatgpt-clone:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

#### Build e Run:

```bash
# Build
docker build -t chatgpt-clone .

# Run
docker run -p 3000:3000 chatgpt-clone

# Ou usando docker-compose
docker-compose up -d
```

---

### 4. VPS (Ubuntu/Debian)

Deploy em servidor próprio com Nginx.

#### Preparação do Servidor:

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx
```

#### Deploy da Aplicação:

```bash
# Clone ou copie o projeto para o servidor
cd /var/www
sudo git clone https://github.com/seu-usuario/chatgpt-clone.git
cd chatgpt-clone

# Instalar dependências e build
sudo npm install
sudo npm run build

# Iniciar com PM2
pm2 start npm --name "chatgpt-clone" -- start
pm2 save
pm2 startup
```

#### Configurar Nginx:

Crie `/etc/nginx/sites-available/chatgpt-clone`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/chatgpt-clone /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL com Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

---

### 5. AWS (Amplify)

Deploy na AWS com CI/CD automático.

#### Passo a Passo:

1. **Acessar AWS Amplify Console**
   - https://console.aws.amazon.com/amplify/

2. **Conectar Repositório**
   - Escolha GitHub, GitLab ou Bitbucket
   - Selecione o repositório

3. **Configurar Build**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

4. **Deploy**
   - Clique em "Save and Deploy"

---

## 🔧 Configuração Pós-Deploy

Após fazer o deploy, você precisa:

1. **Acessar o site**
   - Abra o URL do seu deploy

2. **Configurar o webhook n8n**
   - Clique no ícone de configurações (⚙️)
   - Insira a URL do webhook n8n
   - Salve as configurações

3. **Testar**
   - Envie uma mensagem de teste
   - Verifique se a resposta chega corretamente

## 🔐 Segurança

### HTTPS

**Importante**: Sempre use HTTPS em produção!

- **Vercel/Netlify**: HTTPS automático
- **VPS**: Configure Let's Encrypt (veja instruções acima)
- **Docker**: Use um reverse proxy (Traefik, Nginx Proxy Manager)

### CORS

Se o webhook n8n estiver em domínio diferente, pode ser necessário configurar CORS no n8n.

### Rate Limiting

Configure rate limiting no n8n para evitar abuso:
- Limite de requisições por minuto
- Identificação por session_id

## 📊 Monitoramento

### Logs

- **Vercel**: Dashboard → Logs
- **Netlify**: Functions → Logs
- **PM2**: `pm2 logs chatgpt-clone`
- **Docker**: `docker logs container-id`

### Analytics

Adicione Google Analytics ou similar:

1. Edite `app/layout.tsx`
2. Adicione o script de analytics no `<head>`

## 🔄 Atualizações

### Vercel/Netlify/AWS Amplify
- Push para o repositório Git
- Deploy automático

### VPS
```bash
cd /var/www/chatgpt-clone
git pull
npm install
npm run build
pm2 restart chatgpt-clone
```

### Docker
```bash
docker-compose down
git pull
docker-compose up -d --build
```

## 🐛 Troubleshooting

### Build falhou
- Verifique os logs de build
- Certifique-se de que todas as dependências estão no `package.json`
- Verifique a versão do Node.js (requer Node 18+)

### Site carrega mas não funciona
- Verifique a URL do webhook n8n
- Abra o console do navegador para ver erros
- Teste o webhook diretamente

### Timeout errors
- Aumente o timeout no servidor
- Otimize o workflow n8n para ser mais rápido

## 📞 Suporte

Se você encontrar problemas:

1. Verifique os logs de erro
2. Teste o webhook n8n isoladamente
3. Verifique a documentação da plataforma de deploy
4. Abra uma issue no repositório do projeto

---

Boa sorte com o deploy! 🚀
