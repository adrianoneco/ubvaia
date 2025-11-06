// Servidor WebSocket para sincronização em tempo real
import 'dotenv/config';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

const PORT = process.env.WS_PORT || 8080;

// Criar servidor HTTP
const server = createServer();

// Criar servidor WebSocket
const wss = new WebSocketServer({ server });

// Armazenar clientes conectados
const clients = new Set<WebSocket>();

// Tipos de mensagens
interface WSMessage {
  type: 'message' | 'session' | 'ping' | 'pong';
  data?: any;
  timestamp?: string;
}

wss.on('connection', (ws: WebSocket) => {
  console.log('✅ Novo cliente conectado');
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
      console.error('❌ Erro ao processar mensagem:', error);
    }
  });

  // Cliente desconectado
  ws.on('close', () => {
    console.log('❌ Cliente desconectado');
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
    // Não enviar de volta para o remetente (opcional)
    // if (client !== sender && client.readyState === WebSocket.OPEN) {
    
    // Enviar para todos os clientes, incluindo o remetente
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor WebSocket rodando na porta ${PORT}`);
  console.log(`📡 Endpoint: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Encerrando servidor WebSocket...');
  wss.close(() => {
    console.log('✅ Servidor WebSocket encerrado');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Encerrando servidor WebSocket...');
  wss.close(() => {
    console.log('✅ Servidor WebSocket encerrado');
    process.exit(0);
  });
});

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

// Limpar heartbeat ao encerrar
process.on('exit', () => {
  clearInterval(heartbeat);
});
