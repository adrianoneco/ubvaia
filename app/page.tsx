'use client';

import { useChatStore } from '@/lib/store';
import { Chat } from '@/components/Chat';
import { SettingsModal } from '@/components/SettingsModal';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useEffect, useState } from 'react';

export default function Home() {
  const { config, theme, toggleTheme, messages } = useChatStore();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 bg-card text-card-foreground flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Logo esfumado e minimalista */}
          <div className="relative group">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-16 h-16 object-contain filter blur-[0.5px] group-hover:blur-0 transition-all duration-500 brightness-105 contrast-110 group-hover:brightness-110 group-hover:scale-105" 
              />
              
              {/* Efeito de glow sutil */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
            </div>
          </div>
          
          <h1 className="text-xl font-semibold text-foreground">
            {config.chatName}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <SettingsModal />
          <ThemeToggle />
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-hidden">
        {showHistory ? (
          <div className="p-4 bg-muted text-muted-foreground">
            <h2 className="text-lg font-bold">Histórico de Mensagens</h2>
            <ul className="space-y-2 mt-4">
              {messages.map((msg, idx) => (
                <li key={idx} className="border-b border-border pb-2">
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-xs text-muted-foreground">
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : 'Sem data'
                    }
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <Chat />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-2 bg-card text-card-foreground">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            Ubva todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}

