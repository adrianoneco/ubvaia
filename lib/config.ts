// Função para obter a URL do webhook configurada pelo usuário
import { useChatStore } from './store';

export function getWebhookConfig(): string | null {
  const { config } = useChatStore.getState();
  return config.webhookUrl || null;
}