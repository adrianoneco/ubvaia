'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useChatStore } from '@/lib/store';
import { Message } from '@/lib/types';
import { MessageBubble } from '@/components/MessageBubble';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import { cn } from '@/lib/utils';
import { parseDbTimestamp, formatToSaoPaulo, formatToYMD } from '@/server/datetime';

import { ThemeToggle } from '@/components/ThemeToggle';
import { RefreshCw } from 'lucide-react';
import { SortAsc, SortDesc, Bell } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import WebhookPanel from '@/app/admin/webhook-panel/page';
import { FaBroom } from 'react-icons/fa';

interface SessionData {
  sessionId: string;
  sessionName: string;
  nome_completo?: string | null;
  remote_jid?: string | null;
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState(false);

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

    // Predefinir o período para HOJE por padrão (usuário pode alterar)
    try {
      if (!startDate && !endDate) {
        const now = parseDbTimestamp(Date.now());
        const iso = formatToYMD(now) || '';
        setStartDate(iso);
        setEndDate(iso);
      }
    } catch {
      // ignore date errors
    }

    // Carregar todas as sessões
    loadSessions();

    // Polling periódido para manter dashboard sincronizado (além do websocket)
    const interval = setInterval(() => {
      loadSessions().catch((e) => console.error('Erro no polling de sessões:', e));
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/session');
      const backendSessions = await res.json();
      const sessionNames = store.sessionNames || {};
      // Normaliza sessões e mensagens já recebidas
      const sessionsData: SessionData[] = backendSessions.map((session: any) => {
        const sessionId = session.id;
        const sessionMessages: Message[] = (Array.isArray(session.messages) ? session.messages : []).map((m: any) => {
          // Aceita image_url (backend) ou imageUrl (frontend)
          let imageUrl = m.imageUrl || m.image_url || undefined;
          let contentType = m.contentType || m.content_type || 'text';
          // Se vier base64, converte para formato aceito pelo <Image>
          if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:image/')) {
            // Já está em formato base64, só garantir que é string
            contentType = 'image';
          } else if (imageUrl && typeof imageUrl === 'string' && imageUrl.match(/^([A-Za-z0-9+/=]+)$/)) {
            // Se vier só o base64 puro, prefixa
            imageUrl = `data:image/png;base64,${imageUrl}`;
            contentType = 'image';
          }
          return {
            id: m.id || m._id || String(Math.random()),
            role: m.role || m.sender || 'assistant',
            content: m.content || m.text || '',
            contentType,
            timestamp: parseDbTimestamp(m.timestamp || m.created_at || m.createdAt),
            imageUrl,
            fileName: m.fileName || m.file_name,
            sessionId: m.sessionId || m.session_id || sessionId,
          };
        });
        const lastMessage = sessionMessages[sessionMessages.length - 1];
        // Preferir mostrar nome_completo quando disponível.
        // Caso não exista no objeto session, tentar extrair de mensagens (campo nome_completo em mensagens)
        const findNameInMessages = () => {
          // procurar mensagem do usuário que tenha campo nome_completo
          for (let i = sessionMessages.length - 1; i >= 0; i--) {
            const mm: any = (sessionMessages as any)[i];
            // mensagem pode conter nome_completo diretamente
            if (mm && (mm as any).nome_completo) return (mm as any).nome_completo;
          }
          // heurística: procurar a primeira mensagem do usuário que pareça um nome
          const nameLikeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ'\-\s]{2,60}$/;
          for (let i = sessionMessages.length - 1; i >= 0; i--) {
            const mm: any = (sessionMessages as any)[i];
            if (!mm) continue;
            if (mm.role === 'user' && typeof mm.content === 'string') {
              const t = mm.content.trim();
              const words = t.split(/\s+/).filter(Boolean);
              if (t.length >= 2 && t.length <= 60 && words.length > 0 && words.length <= 3 && words.every((w: string) => nameLikeRegex.test(w))) {
                return t;
              }
            }
          }
          return null;
        };

        const inferredName = findNameInMessages();
        const displayName = session.nome_completo || inferredName || session.name || sessionNames[sessionId] || `Sessão ${sessionId.slice(0, 8)}`;
        return {
          sessionId,
          sessionName: displayName,
          nome_completo: session.nome_completo || inferredName || null,
          remote_jid: session.remote_jid || null,
          messages: sessionMessages,
          messageCount: sessionMessages.length,
          lastActivity: lastMessage?.timestamp ? parseDbTimestamp(lastMessage.timestamp) : null,
        };
      });
      // Ordenar por última atividade conforme sortOrder
      sessionsData.sort((a, b) => {
        const aTime = a.lastActivity ? a.lastActivity.getTime() : new Date(0).getTime();
        const bTime = b.lastActivity ? b.lastActivity.getTime() : new Date(0).getTime();
        return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
      });
      setSessions(sessionsData);
      // compute unread based on last seen admin timestamp
      try {
        const lastSeen = Number(sessionStorage.getItem('adminLastSeen') || '0');
        const count = sessionsData.filter(s => s.lastActivity.getTime() > lastSeen).length;
        setUnreadCount(count);
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('Erro ao carregar sessões do backend:', err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminToken');
    router.push('/admin');
  };

  // Garantir ordenação: última atividade primeiro
  sessions.sort((a, b) => {
    const aTime = a.lastActivity ? a.lastActivity.getTime() : new Date(0).getTime();
    const bTime = b.lastActivity ? b.lastActivity.getTime() : new Date(0).getTime();
    return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
  });

  const filteredSessions = sessions.filter(session => {
    const matchesText = session.sessionName.toLowerCase().includes(searchTerm.toLowerCase()) || session.sessionId.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesText) return false;
    // If a date range is chosen, include sessions that have at least one message inside the period
    if (startDate || endDate) {
      const s = startDate ? parseDbTimestamp(startDate) : null;
      const e = endDate ? parseDbTimestamp(endDate) : null;
      const hasInRange = session.messages.some((m) => {
        const t = parseDbTimestamp(m.timestamp);
        if (!t) return false;
        // Compare only the date part (YYYY-MM-DD) to ensure inclusivity
        const tYMD = formatToYMD(t);
        const sYMD = s ? formatToYMD(s) : null;
        const eYMD = e ? formatToYMD(e) : null;
        if (sYMD && tYMD && tYMD < sYMD) return false;
        if (eYMD && tYMD && tYMD > eYMD) return false;
        return true;
      });
      if (!hasInRange) return false;
    }
    return true;
  });

  // Build list of available dates (YYYY-MM-DD) that have at least one message
  const availableDatesSet = new Set(
    sessions
      .flatMap((s) => s.messages)
      .map((m) => {
        const d = parseDbTimestamp(m.timestamp);
        return d ? (formatToYMD(d) as string) : null;
      })
      .filter(Boolean) as string[]
  );
  const availableDatesAsc = Array.from(availableDatesSet).sort((a, b) => (a < b ? -1 : 1)); // oldest -> newest
  const availableDatesDesc = Array.from(availableDatesSet).sort((a, b) => (a < b ? 1 : -1)); // newest -> oldest

  const selectedSessionData = selectedSession
    ? sessions.find(s => s.sessionId === selectedSession)
    : null;

  // Optional small notifications panel (shows recent sessions with activity)
  const recentSessions = sessions.slice(0, 6);

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
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${isConnected
                ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/20'
                : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/20'
              }`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}></span>
              {isConnected ? 'Tempo Real Ativo' : 'Desconectado'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notificação: sino com badge vermelho */}
            <div className="relative">
              <button
              className="relative p-2 rounded hover:bg-slate-100 dark:hover:bg-zinc-800"
              onClick={() => {
                try { sessionStorage.setItem('adminLastSeen', String(Date.now())); } catch (e) { }
                setUnreadCount(0);
                setShowNotifications((s) => !s);
              }}
              aria-label="Notificações"
              title="Notificações"
              >
              <Bell className="w-5 h-5 text-slate-700 dark:text-zinc-200" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {unreadCount}
                </span>
              )}
              </button>
                {/* Painel de notificações */}
                <div className="relative">
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-xs text-white font-bold animate-bounce shadow-lg z-10">
                  {unreadCount}
                  </span>
                )}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                  <div className="bg-blue-50 dark:bg-blue-950 px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-300 text-sm">Novas conversas</h3>
                    <button
                    className="text-xs text-blue-600 dark:text-blue-300 hover:underline"
                    onClick={() => setShowNotifications(false)}
                    aria-label="Fechar painel de notificações"
                    >
                    Fechar
                    </button>
                  </div>
                  <div className="p-4 max-h-80 overflow-y-auto">
                    {recentSessions.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Nenhuma conversa recente.</p>
                    ) : (
                    <ul className="space-y-3">
                      {recentSessions.map((s) => {
                      const lastMessages = s.messages
                        .slice(-2)
                        .filter(m => m.contentType === 'text' && m.content && typeof m.content === 'string');
                      return (
                        <li key={s.sessionId}>
                        <button
                          className="w-full text-left px-3 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition flex flex-col gap-1 border border-transparent hover:border-blue-300 dark:hover:border-blue-700"
                          onClick={() => {
                          setSelectedSession(s.sessionId);
                          setShowNotifications(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-700 dark:text-blue-300 truncate">{s.sessionName}</span>
                          <span className="text-xs text-slate-500 dark:text-zinc-400">{formatToSaoPaulo(s.lastActivity)}</span>
                          </div>
                          {lastMessages.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {lastMessages.map((m, idx) => (
                            <div
                              key={m.id || idx}
                              className="text-xs text-slate-700 dark:text-zinc-200 truncate"
                              title={m.content}
                            >
                              <span className="font-semibold">{m.role === 'user' ? 'Cliente:' : 'Bot:'}</span>{' '}
                              {m.content.length > 60 ? m.content.slice(0, 60) + '...' : m.content}
                            </div>
                            ))}
                          </div>
                          )}
                        </button>
                        </li>
                      );
                      })}
                    </ul>
                    )}
                  </div>
                  </div>
                )}
                </div>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                if (isSyncing) return;
                setIsSyncing(true);
                try {
                  await loadSessions();
                } catch (e) {
                  console.error('Erro ao sincronizar sessões:', e);
                } finally {
                  setIsSyncing(false);
                }
              }}
              className="border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              aria-label="Sincronizar sessões"
            >
              {isSyncing ? (
                <svg className="w-4 h-4 animate-spin mr-2 inline-block" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-2.64-6.36" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 3v6h-6" />
                </svg>
              )}
              Sincronizar
            </Button>
            {/* Sort toggle: newest/oldest */}
            <Button
              variant="outline"
              onClick={() => {
                const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
                setSortOrder(newOrder);
                // re-sort current sessions according to new order
                setSessions((prev) => [...prev].sort((a, b) => {
                  const aTime = a.lastActivity ? a.lastActivity.getTime() : 0;
                  const bTime = b.lastActivity ? b.lastActivity.getTime() : 0;
                  return newOrder === 'desc' ? bTime - aTime : aTime - bTime;
                }));
              }}
              className="border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              title={sortOrder === 'desc' ? 'Ordenar: do mais novo ao mais antigo' : 'Ordenar: do mais antigo ao mais novo'}
              aria-label="Alternar ordenação por hora"
            >
              {sortOrder === 'desc' ? <SortDesc className="w-4 h-4 mr-2" /> : <SortAsc className="w-4 h-4 mr-2" />}
              {sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigos'}
            </Button>
            {/* Link rápido para o Painel de Webhook no menu (abre em popup) */}
            <Button
              variant="ghost"
              onClick={() => setShowWebhookModal(true)}
              className="text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              aria-label="Abrir Painel de Webhook"
            >
              Painel de Webhook
            </Button>
            <Dialog open={showWebhookModal} onOpenChange={(open) => setShowWebhookModal(open)}>
              <DialogContent className="max-w-5xl w-full">
                <DialogHeader>
                  <DialogTitle>Painel de Webhook</DialogTitle>
                  <DialogDescription>Configure e teste webhooks para eventos do sistema.</DialogDescription>
                </DialogHeader>
                <div className="mt-4 h-[75vh] max-h-[75vh] overflow-auto px-2">
                  {/* make inner panel scrollable and fit the modal */}
                  <div className="max-w-none mx-auto w-full">
                    <WebhookPanel />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose>
                    <Button variant="outline">Fechar</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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

      <div
        className="fixed inset-x-0 top-32 bottom-8 mx-auto container px-1 py-0 flex flex-col overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Lista de Sessões */}
            <div className="lg:col-span-1 flex flex-col overflow-hidden">
            <Card className="bg-white dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 shadow-md flex flex-col h-full">
              <CardHeader className="shrink-0">
              <CardTitle className="text-slate-900 dark:text-zinc-100">
                Sessões de Conversa
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">
                Clique em uma sessão para ver os detalhes
              </CardDescription>
              <div className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
                {filteredSessions.length} sessões encontradas
              </div>

              {/* Filtro de busca e período */}
              <div className="mt-4">
                <input
                type="text"
                placeholder="Buscar sessão..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                />

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <div className="sm:col-span-2 relative">
                  <button
                  onClick={() => setShowPeriodPicker((s) => !s)}
                  className="w-full text-left px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  aria-haspopup="true"
                  aria-expanded={showPeriodPicker}
                  >
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                    {startDate && endDate
                      ? `${startDate} — ${endDate}`
                      : availableDatesAsc.length > 0
                      ? `${availableDatesAsc[0]} — ${availableDatesAsc[availableDatesAsc.length - 1]}`
                      : 'Sem datas disponíveis'}
                    </div>
                    <svg
                    className="w-4 h-4 text-slate-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                    </svg>
                  </div>
                  </button>

                  {showPeriodPicker && (
                  <div className="absolute left-0 mt-2 w-[380px] z-30 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded shadow-lg p-3">
                    <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-slate-600 dark:text-zinc-400">
                      Início
                      </label>
                      <select
                      value={startDate || ''}
                      onChange={(e) => {
                        const val = e.target.value || null;
                        setStartDate(val);
                        if (val && endDate && endDate < val) {
                        setEndDate(null);
                        }
                      }}
                      className="w-full mt-1 px-2 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                      >
                      <option value="">Todas</option>
                      {availableDatesAsc.map((d) => (
                        <option key={d} value={d}>
                        {d}
                        </option>
                      ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-600 dark:text-zinc-400">
                      Fim
                      </label>
                      <select
                      value={endDate || ''}
                      onChange={(e) => setEndDate(e.target.value || null)}
                      className="w-full mt-1 px-2 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                      >
                      <option value="">Todas</option>
                      {(startDate
                        ? availableDatesAsc.filter((d) => d >= startDate)
                        : availableDatesAsc
                      ).map((d) => (
                        <option key={d} value={d}>
                        {d}
                        </option>
                      ))}
                      </select>
                    </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => {
                      setStartDate(null);
                      setEndDate(null);
                      setShowPeriodPicker(false);
                      }}
                      className="text-sm text-slate-600 dark:text-zinc-400 px-3 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-800"
                    >
                      Limpar
                    </button>
                    <div>
                      <button
                      onClick={() => setShowPeriodPicker(false)}
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                      Aplicar
                      </button>
                    </div>
                    </div>
                  </div>
                  )}
                </div>
                <div className="flex sm:justify-start justify-end">
                  <Button
                  variant="outline"
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className="p-2 rounded flex items-center justify-center"
                  title="Limpar filtros"
                  aria-label="Limpar filtros"
                  >
                  <FaBroom className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                  </Button>
                </div>
                </div>
              </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {/* Mostra todas as sessões do dia selecionado, mesmo que tenham poucas mensagens */}
                {filteredSessions.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-zinc-500 text-center py-4">
                  Nenhuma sessão encontrada
                </p>
                ) : (
                filteredSessions.map((session) => (
                  <button
                  key={session.sessionId}
                  onClick={() => setSelectedSession(session.sessionId)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${selectedSession === session.sessionId
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
                    {formatToSaoPaulo(session.lastActivity)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 font-mono">
                    ID: {session.sessionId.slice(0, 8)}...
                  </p>
                  {session.nome_completo && (
                    <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                    Nome: {session.nome_completo}
                    </p>
                  )}
                  {session.remote_jid && (
                    <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                    WhatsApp: {session.remote_jid}
                    </p>
                  )}
                  {/* Mostrar todas as datas das mensagens da sessão */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Array.from(
                    new Set(
                      session.messages.map((m) => {
                      const d = parseDbTimestamp(m.timestamp);
                      return d ? formatToYMD(d) : null;
                      }).filter(Boolean)
                    )
                    ).map((date) => (
                    <span
                      key={date}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-xs rounded text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700"
                    >
                      {date}
                    </span>
                    ))}
                  </div>
                  </button>
                ))
                )}
              </div>
              </CardContent>
            </Card>
            </div>

          {/* Detalhe da Sessão */}
          <div className="lg:col-span-2 flex flex-col overflow-hidden">
            {selectedSessionData ? (
              <Card className="bg-white dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 shadow-md flex flex-col h-full">
                <CardHeader className="shrink-0">
                  <CardTitle className="text-slate-900 dark:text-zinc-100">
                    {selectedSessionData.sessionName}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-zinc-400">
                    {selectedSessionData.messageCount} mensagens | Última atividade:{' '}
                    {formatToSaoPaulo(selectedSessionData.lastActivity)}
                  </CardDescription>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-slate-500 dark:text-zinc-500 font-mono">
                      Session ID: {selectedSessionData.sessionId}
                    </p>
                    {selectedSessionData.nome_completo && (
                      <p className="text-xs text-slate-500 dark:text-zinc-500">
                        Nome do cliente: {selectedSessionData.nome_completo}
                      </p>
                    )}
                    {selectedSessionData.remote_jid && (
                      <p className="text-xs text-slate-500 dark:text-zinc-500">
                        WhatsApp: {selectedSessionData.remote_jid}
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto">
                  <div className="space-y-4">
                    {selectedSessionData.messages.length === 0 ? (
                      <p className="text-center text-slate-500 dark:text-zinc-500 py-8">
                        Nenhuma mensagem nesta sessão
                      </p>
                    ) : (
                      selectedSessionData.messages.map((message, idx) => (
                        <MessageBubble
                          key={message.id || idx}
                          message={message}
                          userName={selectedSessionData.nome_completo || undefined}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 shadow-md flex items-center justify-center flex-1">
                <CardContent className="text-center py-24">
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
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
