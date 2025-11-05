# 💡 Exemplos Práticos de Uso

Este documento contém exemplos práticos de como usar o ChatGPT Clone com diferentes cenários.

## 🎯 Casos de Uso

### 1. Assistente de Chat Simples

**Objetivo**: Criar um chatbot básico com respostas da OpenAI

**Configuração n8n**:
```
Webhook → OpenAI Chat → Respond
```

**Exemplo de uso**:
1. Usuário: "Qual é a capital da França?"
2. Sistema envia para n8n
3. n8n processa com OpenAI
4. Resposta: "A capital da França é Paris."

---

### 2. Análise de Imagens

**Objetivo**: Enviar uma imagem e receber uma descrição

**Configuração n8n**:
```
Webhook → IF (tem arquivo?) → OpenAI Vision → Respond
```

**Exemplo de uso**:
1. Usuário faz upload de uma foto
2. Adiciona texto: "O que você vê nesta imagem?"
3. Sistema envia imagem em base64
4. OpenAI Vision analisa
5. Resposta: "Vejo uma pessoa sorrindo em um parque..."

---

### 3. Resumo de Documentos

**Objetivo**: Enviar um PDF e receber um resumo

**Configuração n8n**:
```
Webhook → Extract PDF Text → OpenAI Summarize → Respond
```

**Exemplo de uso**:
1. Usuário faz upload de um PDF de 10 páginas
2. Adiciona texto: "Resuma este documento"
3. n8n extrai o texto do PDF
4. OpenAI cria um resumo
5. Resposta: "Este documento trata sobre..."

---

### 4. Geração de Imagens

**Objetivo**: Gerar imagens a partir de descrições

**Configuração n8n**:
```
Webhook → DALL-E → Respond com URL da imagem
```

**Exemplo de uso**:
1. Usuário: "Gere uma imagem de um gato astronauta"
2. n8n envia para DALL-E
3. DALL-E gera a imagem
4. Resposta retorna com URL da imagem
5. Site exibe a imagem gerada

---

### 5. Tradutor de Idiomas

**Objetivo**: Traduzir textos entre idiomas

**Configuração n8n**:
```
Webhook → OpenAI (prompt de tradução) → Respond
```

**Exemplo de uso**:
1. Usuário: "Traduza para inglês: Olá, como vai?"
2. OpenAI traduz
3. Resposta: "Hello, how are you?"

---

### 6. Consulta a Base de Conhecimento

**Objetivo**: Responder perguntas baseadas em documentos da empresa

**Configuração n8n**:
```
Webhook → Vector DB Search → OpenAI + Context → Respond
```

**Exemplo de uso**:
1. Usuário: "Qual é a política de férias da empresa?"
2. n8n busca na base vetorial
3. OpenAI responde com contexto dos documentos
4. Resposta: "De acordo com a política, funcionários têm..."

---

### 7. Análise de Sentimento

**Objetivo**: Analisar o sentimento de textos

**Configuração n8n**:
```
Webhook → OpenAI (análise de sentimento) → Respond
```

**Exemplo de uso**:
1. Usuário: "Analise o sentimento: Estou muito feliz hoje!"
2. OpenAI analisa
3. Resposta: "Sentimento: Positivo (95% confiança)"

---

### 8. Assistente de Código

**Objetivo**: Ajudar com programação

**Configuração n8n**:
```
Webhook → OpenAI (modo desenvolvedor) → Respond
```

**Exemplo de uso**:
1. Usuário: "Como fazer um loop em Python?"
2. OpenAI responde com exemplo
3. Resposta com código formatado

---

### 9. OCR de Imagens

**Objetivo**: Extrair texto de imagens

**Configuração n8n**:
```
Webhook → OCR Service → Format Text → Respond
```

**Exemplo de uso**:
1. Usuário envia foto de um documento
2. OCR extrai o texto
3. Resposta: "Texto extraído: [conteúdo]"

---

### 10. Chatbot Multilíngue

**Objetivo**: Detectar idioma e responder no mesmo

**Configuração n8n**:
```
Webhook → Detect Language → OpenAI → Respond
```

**Exemplo de uso**:
1. Usuário: "Hola, ¿cómo estás?"
2. Sistema detecta espanhol
3. OpenAI responde em espanhol
4. Resposta: "¡Hola! Estoy bien, gracias."

---

## 🔧 Configurações Específicas

### Para Chat com Contexto

Adicione ao workflow:
```javascript
// Salvar contexto no banco de dados
const context = {
  session_id: $json.session_id,
  messages: previousMessages + currentMessage
};
```

### Para Limitar Tokens

Configure no OpenAI node:
```json
{
  "max_tokens": 150,
  "temperature": 0.7
}
```

### Para Respostas Mais Rápidas

Use modelos mais leves:
- GPT-3.5-turbo ao invés de GPT-4
- Configure timeout apropriado

---

## 📋 Templates de Prompts

### Prompt para Assistente Profissional
```
Você é um assistente profissional e prestativo. Responda de forma clara, concisa e educada. Se não souber algo, admita honestamente.

Pergunta do usuário: {{ $json.message }}
```

### Prompt para Análise de Imagens
```
Analise esta imagem em detalhes. Descreva:
1. Objetos principais
2. Cores predominantes
3. Contexto da cena
4. Elementos notáveis

Imagem: {{ $json.file }}
```

### Prompt para Resumo
```
Resuma o seguinte texto em no máximo 3 parágrafos, mantendo os pontos principais:

{{ $json.extractedText }}
```

### Prompt para Código
```
Você é um assistente especializado em programação. Forneça código limpo, comentado e seguindo as melhores práticas.

Solicitação: {{ $json.message }}
```

---

## 🎨 Customizações do Frontend

### Adicionar Comandos Rápidos

Edite `/components/Chat.tsx` para adicionar sugestões:

```typescript
const quickCommands = [
  "Explique como funciona...",
  "Traduza para inglês:",
  "Resuma este texto:",
  "Gere uma imagem de..."
];
```

### Adicionar Histórico de Conversas

Use o Zustand store para salvar conversas:

```typescript
// Em lib/store.ts
saveConversation: (name: string) => {
  const conversation = {
    name,
    messages: get().messages,
    date: new Date()
  };
  // Salvar no localStorage
}
```

### Adicionar Markdown nas Respostas

Instale e use `react-markdown`:

```bash
npm install react-markdown
```

```typescript
// Em MessageBubble.tsx
import ReactMarkdown from 'react-markdown';

<ReactMarkdown>{message.content}</ReactMarkdown>
```

---

## 📊 Métricas e Analytics

### Rastrear Uso

Adicione analytics ao enviar mensagens:

```typescript
// Em Chat.tsx
const handleSendMessage = async () => {
  // Analytics
  if (window.gtag) {
    window.gtag('event', 'message_sent', {
      session_id: config.sessionId,
      has_file: !!selectedFile
    });
  }
  // ... resto do código
};
```

### Monitorar Performance

```typescript
const startTime = Date.now();
const response = await service.sendMessage(inputMessage);
const responseTime = Date.now() - startTime;

console.log(`Response time: ${responseTime}ms`);
```

---

## 🔒 Segurança

### Sanitizar Entradas

```typescript
// Prevenir XSS
const sanitizeInput = (input: string) => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
};
```

### Validar Arquivos

```typescript
// Em FileUploader.tsx
const validateFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido');
  }
};
```

---

## 🚀 Próximos Passos

1. **Implementar autenticação de usuários**
2. **Adicionar histórico de conversas com busca**
3. **Suporte a múltiplas "personas" (assistente, tradutor, etc)**
4. **Export de conversas em PDF/TXT**
5. **Integração com outras APIs (Anthropic, Google, etc)**
6. **Modo offline com fallback**
7. **Suporte a voz (Speech-to-Text e Text-to-Speech)**

---

Aproveite seu ChatGPT Clone! 🎉
