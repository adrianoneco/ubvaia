// Servidor customizado Next.js com WebSocket integrado
import 'dotenv/config';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Preparar app Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Tipos de mensagens WebSocket
interface WSMessage {
  type: 'message' | 'session' | 'ping' | 'pong';
  data?: any;
  timestamp?: string;
}

app.prepare().then(() => {
  // Criar servidor HTTP
  const server = createServer(async (req, res) => {
    try {
      // Se for requisição de upgrade do WebSocket, não processar pelo Next.js
      if (req.url === '/ws' && req.headers.upgrade === 'websocket') {
        // Deixar o WebSocketServer handle isso
        return;
      }
      
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Criar servidor WebSocket
  const wss = new WebSocketServer({ 
    noServer: true
  });

  // Upgrade para WebSocket
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

  // Armazenar clientes conectados
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    console.log('✅ Novo cliente WebSocket conectado');
    clients.add(ws);

    // Enviar confirmação de conexão
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Conectado ao servidor WebSocket',
      timestamp: new Date().toISOString(),
    }));

    // Receber mensagens do cliente
    ws.on('message', (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        
        // Responder a ping
        if (message.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          return;
        }

        // Broadcast para todos os outros clientes
        console.log('📨 Broadcasting mensagem:', message.type);
        broadcast(message, ws);
      } catch (error) {
        console.error('❌ Erro ao processar mensagem WebSocket:', error);
      }
    });

    // Cliente desconectado
    ws.on('close', () => {
      console.log('❌ Cliente WebSocket desconectado');
      clients.delete(ws);
    });

    // Erro na conexão
    ws.on('error', (error) => {
      console.error('❌ Erro no WebSocket:', error);
      clients.delete(ws);
    });
  });

  // Função para broadcast de mensagens
  function broadcast(message: WSMessage, sender?: WebSocket) {
    const data = JSON.stringify({
      ...message,
      timestamp: new Date().toISOString(),
    });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  // Heartbeat para manter conexões vivas
  const heartbeat = setInterval(() => {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ 
          type: 'heartbeat', 
          timestamp: new Date().toISOString() 
        }));
      }
    });
  }, 30000); // A cada 30 segundos

  // Iniciar servidor
  server.listen(port, () => {
    console.log(`🚀 Next.js rodando em http://${hostname}:${port}`);
    console.log(`📡 WebSocket disponível em ws://${hostname}:${port}/ws`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n⏹️  Encerrando servidor...');
    clearInterval(heartbeat);
    wss.close(() => {
      console.log('✅ WebSocket encerrado');
      server.close(() => {
        console.log('✅ Servidor HTTP encerrado');
        process.exit(0);
      });
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
});
