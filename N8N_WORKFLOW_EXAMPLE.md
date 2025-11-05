# Exemplo de Workflow n8n

Este é um exemplo de workflow no n8n para integrar com o ChatGPT Clone.

## 📋 Configuração Básica

### 1. Webhook Node

Crie um nó Webhook com as seguintes configurações:

- **HTTP Method**: POST
- **Path**: `/webhook/chat` (ou o caminho que preferir)
- **Response Mode**: Respond on Last Node
- **Authentication**: Bearer Token (opcional)

### 2. Processamento

O webhook receberá dados no formato:

```json
{
  "message": "Olá, como você está?",
  "file": "data:image/png;base64,iVBORw0KG...",
  "fileName": "imagem.png",
  "fileType": "image/png",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 3. Exemplos de Workflows

## Exemplo 1: Chat Simples com OpenAI

```
Webhook → OpenAI Node → Respond to Webhook
```

**Configuração do OpenAI Node:**
- Model: gpt-4 ou gpt-3.5-turbo
- Prompt: `{{ $json.message }}`

**Configuração do Respond:**
```json
{
  "type": "text",
  "content": "{{ $json.choices[0].message.content }}"
}
```

## Exemplo 2: Análise de Imagens

```
Webhook → IF (tem arquivo?) → OpenAI Vision → Respond
```

**Configuração do IF Node:**
- Condition: `{{ $json.file }}` exists

**Configuração do OpenAI Vision:**
- Model: gpt-4-vision-preview
- Image: `{{ $json.file }}`
- Prompt: "Descreva esta imagem em detalhes"

**Configuração do Respond:**
```json
{
  "type": "text",
  "content": "{{ $json.choices[0].message.content }}"
}
```

## Exemplo 3: Processamento de Documentos

```
Webhook → Extract Text → Summarize → Respond
```

**Configuração do Extract Text:**
- Input: `{{ $json.file }}`
- Type: PDF/DOCX

**Configuração do Summarize (HTTP Request ou OpenAI):**
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "Resume o seguinte texto:"
    },
    {
      "role": "user",
      "content": "{{ $json.extractedText }}"
    }
  ]
}
```

**Configuração do Respond:**
```json
{
  "type": "text",
  "content": "Resumo: {{ $json.summary }}"
}
```

## Exemplo 4: Geração de Imagens

```
Webhook → DALL-E / Stable Diffusion → Respond
```

**Configuração do DALL-E:**
- Prompt: `{{ $json.message }}`
- Size: 1024x1024
- Quality: hd

**Configuração do Respond:**
```json
{
  "type": "image",
  "url": "{{ $json.data[0].url }}",
  "content": "Imagem gerada com sucesso!"
}
```

## Exemplo 5: Workflow Completo com Múltiplas Funcionalidades

```
Webhook 
  → Switch (tipo de mensagem)
      → Case 1: Texto → OpenAI Chat → Respond
      → Case 2: Imagem → OpenAI Vision → Respond
      → Case 3: Documento → Extract + Summarize → Respond
      → Case 4: "gerar imagem" → DALL-E → Respond
```

**Configuração do Switch Node:**
```javascript
// Código JavaScript para detectar tipo
if ($json.file) {
  if ($json.fileType.startsWith('image/')) {
    return 'image';
  } else {
    return 'document';
  }
} else if ($json.message.includes('gerar imagem')) {
  return 'generate';
} else {
  return 'text';
}
```

## 🔐 Segurança (Opcional)

### Adicionar Bearer Token

1. No nó Webhook, ative "Authentication"
2. Escolha "Header Auth"
3. Configure:
   - Header Name: `Authorization`
   - Header Value: `Bearer SEU_TOKEN_AQUI`

4. No site, configure o mesmo token nas configurações

### Limitar Taxa de Requisições

Adicione um nó "Rate Limit" antes do processamento:

```
Webhook → Rate Limit (10 req/min) → Process → Respond
```

## 📊 Logs e Monitoramento

### Salvar Conversas

Adicione um nó "Append to File" ou "Database Insert":

```
Webhook → Process → [Branch] → Save to Database
                              → Respond
```

**Dados a salvar:**
```json
{
  "session_id": "{{ $json.session_id }}",
  "message": "{{ $json.message }}",
  "response": "{{ $json.response }}",
  "timestamp": "{{ $now }}"
}
```

## 🧪 Testando o Webhook

### Usando cURL

```bash
curl -X POST https://seu-n8n.com/webhook/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "message": "Olá, como você está?",
    "session_id": "test-123"
  }'
```

### Usando Postman

1. Método: POST
2. URL: `https://seu-n8n.com/webhook/chat`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer SEU_TOKEN` (se configurado)
4. Body (raw JSON):
```json
{
  "message": "Teste de mensagem",
  "session_id": "test-session"
}
```

## 🎯 Resposta Esperada

O webhook deve sempre retornar JSON:

### Sucesso (texto):
```json
{
  "type": "text",
  "content": "Olá! Estou bem, obrigado por perguntar."
}
```

### Sucesso (imagem):
```json
{
  "type": "image",
  "url": "https://exemplo.com/imagem.png",
  "content": "Aqui está a imagem gerada"
}
```

### Erro:
```json
{
  "type": "text",
  "error": "Erro ao processar a requisição"
}
```

## 💡 Dicas

1. **Timeout**: Configure um timeout adequado no webhook (30-60s para processamento de IA)
2. **Validação**: Valide os dados de entrada antes de processar
3. **Erro Handling**: Adicione nós "On Error" para capturar e tratar erros
4. **Cache**: Para respostas frequentes, considere adicionar cache
5. **Logs**: Mantenha logs de todas as interações para debug

## 🔄 Exemplo JSON Completo do Workflow

```json
{
  "name": "ChatGPT Clone Webhook",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Webhook",
      "parameters": {
        "path": "chat",
        "responseMode": "lastNode",
        "method": "POST"
      }
    },
    {
      "type": "n8n-nodes-base.openAi",
      "name": "OpenAI",
      "parameters": {
        "model": "gpt-4",
        "messages": "={{ $json.message }}"
      }
    },
    {
      "type": "n8n-nodes-base.respondToWebhook",
      "name": "Respond",
      "parameters": {
        "responseBody": "={{ { type: 'text', content: $json.choices[0].message.content } }}"
      }
    }
  ]
}
```

---

Para mais informações sobre n8n, consulte: https://docs.n8n.io/
