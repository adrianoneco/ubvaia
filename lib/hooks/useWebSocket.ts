'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface WSMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  send: (message: WSMessage) => void;
  lastMessage: WSMessage | null;
}

// Construir URL do WebSocket dinamicamente
function getWebSocketUrl(): string {
  if (typeof window === 'undefined') {
    return 'ws://localhost:3000/ws';
  }
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
  
  // Se estiver rodando em produção com domínio, usar o mesmo host
  if (host !== 'localhost' && host !== '127.0.0.1') {
    return `${protocol}//${host}:3000/ws`;
  }
  
  // Para localhost, usar a porta correta
  return `ws://${host}:3000/ws`;
}

const WS_URL = getWebSocketUrl();

export function useWebSocket(onMessage?: (message: WSMessage) => void): UseWebSocketReturn {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const onMessageRef = useRef(onMessage);
  const isConnecting = useRef(false);

  // Atualizar ref quando onMessage mudar
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    // Prevenir múltiplas tentativas de conexão simultâneas
    if (isConnecting.current || (ws.current && ws.current.readyState === WebSocket.CONNECTING)) {
      console.log('⚠️  Já existe uma tentativa de conexão em andamento');
      return;
    }

    // Fechar conexão anterior se existir
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('⚠️  Conexão já estabelecida');
      return;
    }

    try {
      isConnecting.current = true;
      console.log('🔌 Conectando ao WebSocket:', WS_URL);
      
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('✅ WebSocket conectado');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        isConnecting.current = false;
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          
          // Ignorar heartbeats e pongs (não logar para reduzir ruído)
          if (message.type === 'heartbeat' || message.type === 'pong' || message.type === 'connected') {
            return;
          }

          console.log('📨 Mensagem recebida:', message.type);
          setLastMessage(message);
          
          if (onMessageRef.current) {
            onMessageRef.current(message);
          }
        } catch (error) {
          console.error('❌ Erro ao processar mensagem:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ Erro no WebSocket:', error);
        isConnecting.current = false;
      };

      ws.current.onclose = (event) => {
        console.log('❌ WebSocket desconectado', event.code, event.reason);
        setIsConnected(false);
        isConnecting.current = false;
        
        // Tentar reconectar apenas se não foi fechamento intencional
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          console.log(`🔄 Tentando reconectar em ${delay}ms (tentativa ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (event.code === 1000) {
          console.log('✅ Conexão fechada normalmente');
        } else {
          console.log('❌ Máximo de tentativas de reconexão atingido');
        }
      };
    } catch (error) {
      console.error('❌ Erro ao criar WebSocket:', error);
      isConnecting.current = false;
    }
  }, []); // Sem dependências para evitar loop

  const send = useCallback((message: WSMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(message));
        console.log('📤 Mensagem enviada:', message.type);
      } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
      }
    } else {
      console.warn('⚠️  WebSocket não está conectado');
    }
  }, []);

  useEffect(() => {
    // Conectar apenas uma vez na montagem
    connect();

    // Cleanup ao desmontar
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        console.log('🔌 Fechando conexão WebSocket');
        ws.current.close(1000, 'Component unmounting');
      }
    };
  }, []); // Array vazio: executar apenas na montagem/desmontagem

  // Ping periódico para manter conexão viva
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      send({ type: 'ping' });
    }, 30000); // A cada 30 segundos

    return () => clearInterval(pingInterval);
  }, [isConnected, send]);

  return { isConnected, send, lastMessage };
}
