// Componente de balão de mensagem
'use client';

import { motion } from 'framer-motion';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MessageBubbleProps {
  message: Message;
  onReply?: (message: Message) => void;
}

export function MessageBubble({ message, onReply }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  // Formatar data e hora juntas (apenas uma linha)
  const dateStr = message.timestamp
    ? new Date(message.timestamp).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border border-border',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-card text-card-foreground rounded-bl-sm'
        )}
      >
        {/* Conteúdo de texto */}
        {message.contentType === 'text' && (
          <>
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs" style={{ color: '#444' }}>{dateStr}</span>
              {isAssistant && onReply && (
                <button
                  onClick={() => onReply(message)}
                  className="text-xs px-2 py-1 rounded-md bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-colors duration-200 flex items-center gap-1"
                  title="Responder a esta mensagem"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                  </svg>
                  Responder
                </button>
              )}
            </div>
          </>
        )}

        {/* Conteúdo de imagem */}
        {message.contentType === 'image' && message.imageUrl && (
          <div className="space-y-2">
            {message.content && (
              <p className="whitespace-pre-wrap break-words mb-2">
                {message.content}
              </p>
            )}
            <div className="relative w-full max-w-sm rounded-lg overflow-hidden">
              <Image
                src={message.imageUrl}
                alt="Imagem enviada"
                width={400}
                height={300}
                className="w-full h-auto"
                unoptimized
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs" style={{ color: '#444' }}>{dateStr}</span>
              {isAssistant && onReply && (
                <button
                  onClick={() => onReply(message)}
                  className="text-xs px-2 py-1 rounded-md bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-colors duration-200 flex items-center gap-1"
                  title="Responder a esta mensagem"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                  </svg>
                  Responder
                </button>
              )}
            </div>
          </div>
        )}

        {/* Arquivo enviado */}
        {message.contentType === 'file' && message.fileName && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5"
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
              <span className="text-sm font-medium">{message.fileName}</span>
            </div>
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs" style={{ color: '#444' }}>{dateStr}</span>
              {isAssistant && onReply && (
                <button
                  onClick={() => onReply(message)}
                  className="text-xs px-2 py-1 rounded-md bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-colors duration-200 flex items-center gap-1"
                  title="Responder a esta mensagem"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                  </svg>
                  Responder
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conteúdo de áudio */}
        {message.contentType === 'audio' && message.audioUrl && (
          <div className="space-y-2">
            {message.content && (
              <p className="whitespace-pre-wrap break-words mb-2">
                {message.content}
              </p>
            )}
            <div className="bg-muted/50 rounded-lg p-3">
              <audio
                controls
                className="w-full max-w-sm"
                preload="metadata"
              >
                <source src={message.audioUrl} type="audio/wav" />
                Seu navegador não suporta a reprodução de áudio.
              </audio>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs" style={{ color: '#444' }}>{dateStr}</span>
              {isAssistant && onReply && (
                <button
                  onClick={() => onReply(message)}
                  className="text-xs px-2 py-1 rounded-md bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-colors duration-200 flex items-center gap-1"
                  title="Responder a esta mensagem"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                  </svg>
                  Responder
                </button>
              )}
            </div>
          </div>
        )}

        {/* Removido bloco de horário extra */}
      </div>
    </motion.div>
  );
}
