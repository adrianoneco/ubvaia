'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useChatStore } from '@/lib/store';
import { Message } from '@/lib/types';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import { ThemeToggle } from '@/components/ThemeToggle';

interface SessionData {
  sessionId: string;
  sessionName: string;
  messages: Message[];
  messageCount: number;
  lastActivity: Date;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const store = useChatStore();

  // WebSocket para receber atualizações em tempo real
  const { isConnected } = useWebSocket((message) => {
    if (message.type === 'message') {
      console.log('📨 Nova mensagem recebida no admin:', message.data);
      // Recarregar sessões quando nova mensagem chegar
      loadSessions();
    }
  });

  useEffect(() => {
    // Verificar autenticação
    const adminAuth = sessionStorage.getItem('adminAuth');
    if (adminAuth !== 'true') {
      router.push('/admin');
      return;
    }
    setIsAuthenticated(true);

    // Carregar todas as sessões
    loadSessions();
  }, [router]);

  const loadSessions = () => {
    const allSessions = store.sessions || [];
    const sessionNames = store.sessionNames || {};
    const allMessages = store.messages || [];

    const sessionsData: SessionData[] = allSessions.map(sessionId => {
      const sessionMessages = allMessages.filter(msg => msg.sessionId === sessionId);
      const lastMessage = sessionMessages[sessionMessages.length - 1];
      
      return {
        sessionId,
        sessionName: sessionNames[sessionId] || `Sessão ${sessionId.slice(0, 8)}`,
        messages: sessionMessages,
        messageCount: sessionMessages.length,
        lastActivity: lastMessage?.timestamp ? new Date(lastMessage.timestamp) : new Date(),
      };
    });

    // Ordenar por última atividade
    sessionsData.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
    setSessions(sessionsData);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminToken');
    router.push('/admin');
  };

  const filteredSessions = sessions.filter(session => 
    session.sessionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.sessionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSessionData = selectedSession 
    ? sessions.find(s => s.sessionId === selectedSession)
    : null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-blue-100 dark:bg-blue-500/10 p-2 border border-blue-200 dark:border-blue-500/20">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Dashboard Admin</h1>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                {sessions.length} sessões | {sessions.reduce((acc, s) => acc + s.messageCount, 0)} mensagens
              </p>
            </div>
            {/* Indicador de conexão WebSocket */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${
              isConnected 
                ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/20' 
                : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/20'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></span>
              {isConnected ? 'Tempo Real Ativo' : 'Desconectado'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout} className="border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Sessões */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 shadow-md">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-zinc-100">Sessões de Conversa</CardTitle>
                <CardDescription className="text-slate-600 dark:text-zinc-400">
                  Clique em uma sessão para ver os detalhes
                </CardDescription>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Buscar sessão..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredSessions.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-zinc-500 text-center py-4">
                      Nenhuma sessão encontrada
                    </p>
                  ) : (
                    filteredSessions.map((session) => (
                      <button
                        key={session.sessionId}
                        onClick={() => setSelectedSession(session.sessionId)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedSession === session.sessionId
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-md'
                            : 'border-slate-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-sm truncate text-slate-900 dark:text-zinc-100">
                            {session.sessionName}
                          </h3>
                          <span className="text-xs text-slate-500 dark:text-zinc-400">
                            {session.messageCount} msgs
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-500">
                          {session.lastActivity.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 font-mono">
                          ID: {session.sessionId.slice(0, 8)}...
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhe da Sessão */}
          <div className="lg:col-span-2">
            {selectedSessionData ? (
              <Card className="bg-white dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 shadow-md">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-zinc-100">{selectedSessionData.sessionName}</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-zinc-400">
                    {selectedSessionData.messageCount} mensagens | Última atividade: {selectedSessionData.lastActivity.toLocaleString('pt-BR')}
                  </CardDescription>
                  <div className="mt-2">
                    <p className="text-xs text-slate-500 dark:text-zinc-500 font-mono">
                      Session ID: {selectedSessionData.sessionId}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {selectedSessionData.messages.length === 0 ? (
                      <p className="text-center text-slate-500 dark:text-zinc-500 py-8">
                        Nenhuma mensagem nesta sessão
                      </p>
                    ) : (
                      selectedSessionData.messages.map((message, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 ml-8'
                              : 'bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 mr-8'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {message.role === 'user' ? (
                                <svg
                                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5 text-green-600 dark:text-green-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                              )}
                              <span className="font-medium text-sm text-slate-900 dark:text-zinc-100">
                                {message.role === 'user' ? 'Usuário' : 'Assistente'}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-zinc-500">
                              {new Date(message.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="text-sm whitespace-pre-wrap break-words text-slate-800 dark:text-zinc-200">
                            {message.content}
                          </div>
                          {message.contentType === 'image' && message.imageUrl && (
                            <div className="mt-2">
                              <img
                                src={message.imageUrl}
                                alt="Imagem anexada"
                                className="max-w-full h-auto rounded-lg border border-slate-300 dark:border-zinc-700"
                              />
                            </div>
                          )}
                          {message.contentType === 'file' && message.fileName && (
                            <div className="mt-2 flex items-center space-x-2 text-xs text-slate-600 dark:text-zinc-400">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                              <span>Arquivo: {message.fileName}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 shadow-md">
                <CardContent className="flex items-center justify-center py-24">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 mx-auto text-slate-400 dark:text-zinc-600 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p className="text-slate-600 dark:text-zinc-500">
                      Selecione uma sessão para ver as conversas
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
