'use client';

import { useChatStore } from '@/lib/store';
import { Chat } from '@/components/Chat';
import { SettingsModal } from '@/components/SettingsModal';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function Home() {
  const { config, theme, toggleTheme, messages } = useChatStore();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div
      className={`${theme === 'dark' ? 'dark' : ''} h-screen flex flex-col bg-background`}
    >
      {/* Header */}
      <header className="border-b border-border px-4 py-3 bg-card text-card-foreground flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Use the project's existing logo asset but style it white via CSS filters */}
          {/* Original logo with a subtle 3D background (layered card + shadow) */}
          {/* Simple logo (3D background removed) */}
          <span className="inline-flex items-center justify-center w-24 h-20">
            {/* Elaborate round badge for the logo: gradient ring + inner circle for good contrast in dark/light */}
            <div className="relative">
              {/* Larger gradient ring with stronger shadow */}
              <div className="rounded-full p-1 bg-transparent border border-zinc-100 dark:border-transparent dark:bg-transparent shadow-sm">
                {/* Bigger inner circle; force a light background in dark mode so the logo stays legible */}
                <div className="rounded-full bg-white dark:bg-white/95 w-16 h-16 flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="h-12 w-auto max-w-full" />
                </div>
              </div>
            </div>
          </span>
          <h1 className="text-xl font-semibold text-foreground">
            {config.chatName}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <SettingsModal />
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
                    {new Date(msg.timestamp).toLocaleString()}
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

