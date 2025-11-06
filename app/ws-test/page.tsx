'use client';

import { useState, useEffect } from 'react';

export default function WebSocketTest() {
  const [status, setStatus] = useState('Desconectado');
  const [messages, setMessages] = useState<string[]>([]);
  const [wsUrl, setWsUrl] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Construir URL dinamicamente
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const url = `${protocol}//${host}:3000/ws`;
    setWsUrl(url);
  }, []);

  const connect = () => {
    if (!wsUrl) return;
    
    try {
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        setStatus('✅ Conectado');
        addMessage('Conexão estabelecida');
      };
      
      websocket.onmessage = (event) => {
        addMessage(`Recebido: ${event.data}`);
      };
      
      websocket.onerror = (error) => {
        setStatus('❌ Erro');
        addMessage(`Erro: ${error}`);
      };
      
      websocket.onclose = () => {
        setStatus('❌ Desconectado');
        addMessage('Conexão fechada');
      };
      
      setWs(websocket);
    } catch (error) {
      setStatus('❌ Erro ao conectar');
      addMessage(`Erro: ${error}`);
    }
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
  };

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const msg = { type: 'test', message: 'Hello from test page', timestamp: new Date().toISOString() };
      ws.send(JSON.stringify(msg));
      addMessage(`Enviado: ${JSON.stringify(msg)}`);
    }
  };

  const addMessage = (msg: string) => {
    setMessages(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-zinc-100">
          Teste de WebSocket
        </h1>
        
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-zinc-300">
                URL do WebSocket
              </label>
              <input
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
                Status: {status}
              </span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={connect}
                disabled={ws !== null}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium"
              >
                Conectar
              </button>
              
              <button
                onClick={disconnect}
                disabled={ws === null}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md font-medium"
              >
                Desconectar
              </button>
              
              <button
                onClick={sendMessage}
                disabled={ws === null || ws.readyState !== WebSocket.OPEN}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-medium"
              >
                Enviar Mensagem Teste
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-zinc-100">
            Log de Mensagens
          </h2>
          <div className="bg-slate-100 dark:bg-zinc-800 rounded-md p-4 h-96 overflow-y-auto font-mono text-sm">
            {messages.length === 0 ? (
              <p className="text-slate-500 dark:text-zinc-500">Nenhuma mensagem ainda...</p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="mb-1 text-slate-800 dark:text-zinc-200">
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="mt-6 text-sm text-slate-600 dark:text-zinc-400">
          <h3 className="font-bold mb-2">Informações de Debug:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Hostname: {typeof window !== 'undefined' && window.location.hostname}</li>
            <li>Port: {typeof window !== 'undefined' && window.location.port}</li>
            <li>Protocol: {typeof window !== 'undefined' && window.location.protocol}</li>
            <li>WebSocket URL: {wsUrl}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
