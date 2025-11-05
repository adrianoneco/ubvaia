// Componente de balão de mensagem
'use client';

import { motion } from 'framer-motion';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
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
            <span className="block text-xs mt-2 text-right" style={{ color: '#444' }}>{dateStr}</span>
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
            {/* Removido timestamp extra */}
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
          </div>
        )}

        {/* Removido bloco de horário extra */}
      </div>
    </motion.div>
  );
}
