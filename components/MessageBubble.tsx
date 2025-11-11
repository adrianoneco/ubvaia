"use client";
// Formatação convidativa do texto da assistente
function formatAssistantText(text: string) {
  if (!text) return '';
  // Detect markdown table and convert to HTML table
  if (/^\s*\|(.+)\|\s*$/m.test(text)) {
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim().startsWith('|'));
    if (lines.length > 1) {
      const header = lines[0].split('|').map(c => c.trim().replace(/\*+/g, '').replace(/-+/g, '')).filter(Boolean);
      const rows = lines.slice(1).map(l => l.split('|').map(c => c.trim().replace(/\*+/g, '').replace(/-+/g, '')).filter(Boolean));
      let html = '<table class="w-full text-sm border mt-2 mb-2"><thead><tr>';
      header.forEach(cell => {
        html += `<th class="border px-2 py-1 bg-muted font-bold">${cell}</th>`;
      });
      html += '</tr></thead><tbody>';
      rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
          html += `<td class="border px-2 py-1">${cell}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table>';
      return html;
    }
  }
  let clean = text
    .replace(/\*+/g, '')
    .replace(/-{3,}/g, '') // Remove horizontal lines
    .replace(/(<br\/>)+/g, '<br/>') // Limit consecutive <br/> to one
    .replace(/\n{2,}/g, '\n') // Limit consecutive newlines
    .replace(/\s{2,}/g, ' ') // Remove extra spaces
    .replace(/\s+$/g, '').replace(/^\s+/g, '') // Trim
    .replace(/(^|<br\/>)\d+\.\s*/g, '$1') // Remove isolated numbering
    .replace(/(^|<br\/>)De\s*/gi, '$1') // Remove 'De' at start
    .replace(/(<span[^>]*>Próximos passos:)(.*?)(<br\/>)*/gi, '<span style="font-weight:bold;color:#256d4a;font-size:1.08em;background:#eaf6ff;padding:2px 8px;border-radius:6px;">Próximos passos:</span>')
    .replace(/^(.*?:)/gm, '<span style="font-weight:bold;color:#256d4a">$1</span>') // Highlight titles
    .replace(/\n- /g, '<br/><span style="color:#2b7bb9;font-weight:bold">•</span> ') // Highlight lists
    .replace(/([^.?!])([.?!])\s+/g, '$1$2<br/>') // Break long sentences
    .replace(/\n/g, '<br/>')
    .replace(/\|[-]+\|[-]+\|/g, '') // Remove markdown table headers
    .replace(/\|/g, ' ') // Remove table pipes
    .replace(/#+/g, '') // Remove markdown hashes
    .replace(/(<br\/>){2,}/g, '<br/>'); // Remove excessive <br>
  // Remove any leftover HTML tags that are not allowed
  clean = clean.replace(/<(?!br\/?|span|\/span)[^>]+>/g, '');
  return clean;
}
// Componente de balão de mensagem

import { motion } from 'framer-motion';
import './ui/bubbleMessage.css';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { parseDbTimestamp, formatToSaoPaulo } from '@/server/datetime';
import Image from 'next/image';

interface MessageBubbleProps {
  message: Message;
  onReply?: (message: Message) => void;
}

export function MessageBubble({ message, onReply }: MessageBubbleProps) {
  // Detecta e renderiza tabela em HTML se aplicável
  function renderTableIfDetected(text: string) {
    // Detecta linhas e colunas por tabulação, ponto e vírgula ou pipe
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
    if (lines.length > 1 && lines.every(l => /[\t;|]/.test(l))) {
      // Detecta separador
      const sep = lines[0].includes('\t') ? '\t' : (lines[0].includes(';') ? ';' : '|');
      const rows = lines.map(l => l.split(new RegExp(sep)).map(c => c.trim()));
      return (
        <table className="w-full text-sm border mt-2 mb-2">
          <thead>
            <tr>
              {rows[0].map((cell, idx) => (
                <th key={idx} className="border px-2 py-1 bg-muted font-bold">{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row, i) => (
              <tr key={i}>
                {row.map((cell, idx) => (
                  <td key={idx} className="border px-2 py-1">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return null;
  }
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Efeito GIF sutil para balão da assistente
  const assistantBubbleClass = isAssistant
    ? 'bg-gradient-to-br from-[#f7faff] via-[#eaf6ff] to-[#e0f0ff] animate-bubble-gif'
    : 'bg-card text-card-foreground rounded-bl-sm';

  // Formatação convidativa do texto da assistente
  // (mantida apenas uma implementação abaixo)
  // Centralized date parsing/formatting for correct TZ
  const dateStr = formatToSaoPaulo(parseDbTimestamp(message.timestamp));



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
          'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border border-border transition-colors duration-700',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-[#ece5dd] dark:bg-[#3a3f45] text-[#444] dark:text-[#e5e7eb] rounded-2xl px-4 py-3 border border-border transition-colors duration-700 max-w-[80%]'
        )}
  // Removido overflow interno para usar barra externa do chat
      >
        {/* Conteúdo de texto */}
        {message.contentType === 'text' && (
          <>
            {(() => {
              if (isAssistant) {
                const table = renderTableIfDetected(message.content);
                if (table) return table;
                return (
                  <p
                    className="whitespace-pre-wrap break-words text-[0.97rem] leading-relaxed px-5 py-3 rounded-xl border border-[#e0f0ff] dark:border-[#23272f] bg-[#f3f4f6] dark:bg-[#6b7280] text-[#222] dark:text-[#f1f1f1]"
                    style={{ fontFamily: 'Inter, Arial, sans-serif', margin: '0.5em 0', letterSpacing: '0.01em' }}
                    dangerouslySetInnerHTML={{ __html: formatAssistantText(message.content) }}
                  />
                );
              }
              return (
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              );
            })()}

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs" style={{ color: '#888' }}>{dateStr}</span>
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
              <span className="text-xs" style={{ color: '#888' }}>{dateStr}</span>
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
              <span className="text-xs" style={{ color: '#888' }}>{dateStr}</span>
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
              <span className="text-xs" style={{ color: '#888' }}>{dateStr}</span>
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
