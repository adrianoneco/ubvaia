// Store Zustand para gerenciar estado do chat
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { ChatState, Message, N8nConfig } from './types';

// Configuração padrão
const defaultConfig: N8nConfig = {
  webhookUrl: 'http://localhost:5678/webhook/ia-agent',
  authToken: '',
  chatName: 'Carlos IA',
  sessionId: uuidv4(),
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      config: defaultConfig,
      theme: 'dark',

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: uuidv4(),
              timestamp: new Date(),
              sessionId: message.sessionId || state.currentSessionId,
            },
          ],
        })),
      // Sessões de conversa
      sessions: [defaultConfig.sessionId],
      currentSessionId: defaultConfig.sessionId,
      sessionNames: { [defaultConfig.sessionId]: 'Sessão 1' },
      addSession: (sessionId: string) =>
        set((state) => ({
          sessions: [...state.sessions, sessionId],
          sessionNames: { ...state.sessionNames, [sessionId]: `Sessão ${state.sessions.length + 1}` },
        })),
      setCurrentSession: (sessionId: string) => set({ currentSessionId: sessionId }),
      getMessagesBySession: (sessionId: string) => {
        const state = useChatStore.getState();
        return state.messages.filter((msg) => msg.sessionId === sessionId);
      },
      clearSessionMessages: (sessionId: string) =>
        set((state) => ({
          messages: state.messages.filter((msg) => msg.sessionId !== sessionId),
        })),
      renameSession: (sessionId: string, name: string) =>
        set((state) => ({
          sessionNames: { ...state.sessionNames, [sessionId]: name },
        })),
      deleteSession: (sessionId: string) =>
        set((state) => {
          const filteredSessions = state.sessions.filter((id) => id !== sessionId);
          const filteredMessages = state.messages.filter((msg) => msg.sessionId !== sessionId);
          const { [sessionId]: _, ...restNames } = state.sessionNames;
          let newCurrentSessionId = state.currentSessionId;
          if (state.currentSessionId === sessionId && filteredSessions.length > 0) {
            newCurrentSessionId = filteredSessions[0];
          }
          return {
            sessions: filteredSessions,
            messages: filteredMessages,
            sessionNames: restNames,
            currentSessionId: newCurrentSessionId,
          };
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      updateConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),

      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        config: state.config,
        theme: state.theme,
        messages: state.messages, // Persiste histórico
        sessions: state.sessions,
        sessionNames: state.sessionNames,
        currentSessionId: state.currentSessionId,
      }),
    }
  )
);
