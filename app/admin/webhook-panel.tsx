// Função para enviar evento via API interna
async function sendWebhookProxy(event: string, payload: any) {
  const res = await fetch('/api/webhook-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, ...payload })
  });
  return res.ok ? await res.json() : Promise.reject(res);
}
import { useState, useEffect } from 'react';

const EVENTS = [
  'APPLICATION_STARTUP',
  'CHATS_DELETE',
  'CHATS_SET',
  'CHATS_UPDATE',
  'CHATS_UPSERT',
  'CONNECTION_UPDATE',
  'CONTACTS_SET',
  'CONTACTS_UPDATE',
  'CONTACTS_UPSERT',
  'LABELS_ASSOCIATION',
  'LABELS_EDIT',
  'LOGOUT_INSTANCE',
  'MESSAGES_DELETE',
  'MESSAGES_SET',
  'MESSAGES_UPDATE',
  'MESSAGES_UPSERT',
  'PRESENCE_UPDATE',
  'QRCODE_UPDATED',
  'REMOVE_INSTANCE',
  'SEND_MESSAGE',
  'TYPEBOT_CHANGE_STATUS',
  'TYPEBOT_START',
];

export default function WebhookPanel() {
  const [enabled, setEnabled] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');
  const [webhookBase64, setWebhookBase64] = useState(false);
  const [eventStates, setEventStates] = useState(() => Object.fromEntries(EVENTS.map(e => [e, false])));

  useEffect(() => {
    fetch('/api/webhook-config')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(config => {
        const data = config?.webhook || config;
        if (!data) return;
        setEnabled(!!data.enabled);
        setBaseUrl(data.baseUrl || '');
        setWebhookBase64(!!data.webhookBase64);
        if (Array.isArray(data.events)) {
          setEventStates(Object.fromEntries(EVENTS.map(e => [e, data.events.includes(e)])));
        } else {
          setEventStates(Object.fromEntries(EVENTS.map(e => [e, false])));
        }
        // Se quiser usar webhookByEvents como opção, pode adicionar um estado para isso
        // Exemplo: setWebhookByEvents(!!data.webhookByEvents);
      });
  }, []);

  const markAll = () => setEventStates(Object.fromEntries(EVENTS.map(e => [e, true])));
  const unmarkAll = () => setEventStates(Object.fromEntries(EVENTS.map(e => [e, false])));

  const handleEventChange = (event: string) => {
    setEventStates(prev => ({ ...prev, [event]: !prev[event] }));
  };

  const handleSave = () => {
    const payload = {
      enabled,
      baseUrl,
      webhookBase64,
      events: Object.keys(eventStates).filter(e => eventStates[e]),
      webhookByEvents: true,
    };
    fetch('/api/webhook-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(() => {
        // Atualiza o estado local para refletir imediatamente o que foi salvo
        setEnabled(payload.enabled);
        setBaseUrl(payload.baseUrl);
        setWebhookBase64(payload.webhookBase64);
        setEventStates(Object.fromEntries(EVENTS.map(e => [e, payload.events.includes(e)])));
        alert('Configuração salva!');
      })
      .catch(() => {
        alert('Erro ao salvar configuração!');
      });
  };

  // ...existing code...
  // Exemplo de uso da função:
  // sendWebhookProxy('APPLICATION_STARTUP', { foo: 'bar' })
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-6">Webhook Panel</h2>
      <div className="mb-4 flex items-center gap-4">
        <label className="font-semibold">Enabled</label>
        <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
        <span className="ml-2 text-sm text-muted-foreground">Enable or disable the webhook</span>
      </div>
      <div className="mb-4">
        <label className="font-semibold block mb-1">Webhook Base URL</label>
        <input
          type="text"
          className="border rounded px-3 py-2 w-full"
          value={baseUrl}
          onChange={e => setBaseUrl(e.target.value)}
          placeholder="https://yourdomain.com/webhook"
        />
        <span className="text-xs text-muted-foreground">Create a route for each event by adding the event name to the end of the URL</span>
      </div>
      <div className="mb-4 flex items-center gap-4">
        <label className="font-semibold">Webhook Base64</label>
        <input type="checkbox" checked={webhookBase64} onChange={e => setWebhookBase64(e.target.checked)} />
        <span className="ml-2 text-sm text-muted-foreground">Send media base64 data in webhook</span>
      </div>
      <div className="mb-4 flex gap-2">
        <button className="bg-primary text-white px-3 py-1 rounded" onClick={markAll}>Mark All</button>
        <button className="bg-secondary text-secondary-foreground px-3 py-1 rounded" onClick={unmarkAll}>Unmark All</button>
      </div>
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {EVENTS.map(event => (
          <label key={event} className="flex items-center gap-2 border rounded px-2 py-1">
            <input
              type="checkbox"
              checked={eventStates[event]}
              onChange={() => handleEventChange(event)}
            />
            <span className="text-sm font-mono">{event}</span>
          </label>
        ))}
      </div>
      <button
        className="bg-primary text-white px-6 py-2 rounded font-bold w-full mt-4"
        onClick={handleSave}
      >
        Save
      </button>
    </div>
  );
}
