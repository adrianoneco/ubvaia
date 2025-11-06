# Solução do Problema de Conexão WebSocket

## Problema
Firefox não conseguia estabelecer conexão com `ws://localhost:3000/ws`

## Causa Raiz
1. **Servidor WebSocket mal configurado**: O WebSocketServer estava configurado com `server` e `path`, mas o Next.js interceptava as requisições antes do upgrade do WebSocket
2. **URL estática**: A URL do WebSocket estava fixa em `localhost`, não funcionando para acesso remoto

## Soluções Implementadas

### 1. Correção do Servidor (`server-custom.ts`)

**Antes:**
```typescript
const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});
```

**Depois:**
```typescript
const wss = new WebSocketServer({ 
  noServer: true
});

server.on('upgrade', (request, socket, head) => {
  const { pathname } = parse(request.url || '');
  
  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});
```

**Motivo**: Com `noServer: true`, o WebSocketServer não tenta se anexar automaticamente ao servidor HTTP. Em vez disso, usamos o evento `upgrade` para interceptar manualmente requisições de upgrade do WebSocket, permitindo controle total sobre quais paths aceitam conexões WebSocket.

### 2. URL Dinâmica do WebSocket (`lib/hooks/useWebSocket.ts`)

**Antes:**
```typescript
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws';
```

**Depois:**
```typescript
function getWebSocketUrl(): string {
  if (typeof window === 'undefined') {
    return 'ws://localhost:3000/ws';
  }
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  
  if (host !== 'localhost' && host !== '127.0.0.1') {
    return `${protocol}//${host}:3000/ws`;
  }
  
  return `ws://${host}:3000/ws`;
}

const WS_URL = getWebSocketUrl();
```

**Benefícios**:
- Funciona tanto em localhost quanto em acesso remoto
- Detecta automaticamente se precisa usar `ws://` ou `wss://`
- Se adapta ao hostname atual (ex: 192.168.3.39, domínio, etc)

### 3. Página de Teste (`/ws-test`)

Criada página dedicada para testar a conexão WebSocket:
- Acesse: `http://localhost:3000/ws-test`
- Mostra URL construída dinamicamente
- Permite conectar/desconectar
- Exibe log de mensagens em tempo real
- Informações de debug (hostname, port, protocol)

## Como Testar

### 1. Teste Local
```bash
# Terminal 1: Iniciar servidor
npm run dev

# Terminal 2: Testar com curl
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: test" \
  http://localhost:3000/ws

# Deve retornar: HTTP/1.1 101 Switching Protocols
```

### 2. Teste no Navegador
1. Abra o Chrome/Firefox DevTools (F12)
2. Vá para a aba Console
3. Execute:
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');
ws.onopen = () => console.log('✅ Conectado');
ws.onmessage = (e) => console.log('📨 Mensagem:', e.data);
ws.onerror = (e) => console.error('❌ Erro:', e);
```

### 3. Teste na Página Dedicada
- Acesse: `http://localhost:3000/ws-test`
- Clique em "Conectar"
- Verifique se o status muda para "✅ Conectado"
- Clique em "Enviar Mensagem Teste"

## Acesso Remoto

Se estiver acessando de outra máquina na rede:

1. **Verifique o IP do servidor**:
   ```bash
   hostname -I | awk '{print $1}'
   # Exemplo: 192.168.3.39
   ```

2. **Acesse pelo IP**:
   - HTTP: `http://192.168.3.39:3000`
   - WebSocket: Será construído automaticamente como `ws://192.168.3.39:3000/ws`

3. **Configure firewall (se necessário)**:
   ```bash
   sudo ufw allow 3000/tcp
   ```

## Verificação de Status

```bash
# Ver se o servidor está rodando
pgrep -f server-custom

# Ver log do servidor
# (Verifique o terminal onde executou npm run dev)

# Testar porta 3000
ss -tlnp | grep 3000

# Testar conexão WebSocket
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: test" \
  http://localhost:3000/ws
```

## Troubleshooting

### Erro: "Connection refused"
- Servidor não está rodando
- Porta 3000 bloqueada por firewall
- Solução: Reinicie o servidor com `npm run dev`

### Erro: "Unexpected response code: 404"
- Path do WebSocket incorreto
- Verifique se está usando `/ws` e não `/websocket` ou outro path

### Erro: "WebSocket is closed before the connection is established"
- Servidor aceitou a conexão mas fechou imediatamente
- Verifique logs do servidor para erros
- Pode ser problema de CORS ou origem

### Conexão funciona em localhost mas não remotamente
- Use a página de teste: `http://IP:3000/ws-test`
- Verifique se o firewall está bloqueando a porta 3000
- Certifique-se de que `HOSTNAME=0.0.0.0` no `.env`

## Arquivos Modificados

1. `/srv/sites/ubvaia/server-custom.ts` - Correção do upgrade do WebSocket
2. `/srv/sites/ubvaia/lib/hooks/useWebSocket.ts` - URL dinâmica
3. `/srv/sites/ubvaia/app/ws-test/page.tsx` - Página de teste (nova)
4. `/srv/sites/ubvaia/.env` - Documentação sobre acesso remoto

## Referências

- [WebSocket RFC 6455](https://tools.ietf.org/html/rfc6455)
- [ws Library Documentation](https://github.com/websockets/ws)
- [Next.js Custom Server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server)
