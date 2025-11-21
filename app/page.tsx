'use client';

import { useChatStore } from '@/lib/store';
import { Chat } from '@/components/Chat';
import { SettingsModal } from '@/components/SettingsModal';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useEffect, useState } from 'react';
import { FaBroom } from 'react-icons/fa';

export default function Home() {
  const { config, theme, toggleTheme, messages } = useChatStore();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header (fixed at top) */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border px-4 py-3 bg-card text-card-foreground flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          {/* Logo esfumado e minimalista */}
            <div className="relative group">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-24 h-24 object-contain filter blur-[0.5px] group-hover:blur-0 transition-all duration-500 brightness-105 contrast-110 group-hover:brightness-110 group-hover:scale-105"
              />
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

      {/* Chat Area (add bottom padding to avoid being hidden by fixed footer) */}
      <main className="flex-1 overflow-hidden pt-16 pb-12">
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


      {/* Footer (fixed at bottom) */}
      <footer className="fixed inset-x-0 bottom-0 z-40 px-0 py-2 bg-card text-card-foreground">
        <div className="max-w-7xl mx-auto text-center">
            <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ubva. Todos os direitos reservados.
            </p>
        </div>
      </footer>
    </div>
  );
}

