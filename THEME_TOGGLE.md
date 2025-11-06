# Sistema de Alternância de Tema Claro/Escuro

## 📋 Visão Geral

O sistema permite alternar entre tema claro e escuro em toda a aplicação, incluindo:
- Chat principal
- Área administrativa (login e dashboard)
- Persistência da preferência do usuário

## 🎨 Implementação

### 1. Componente ThemeToggle
**Localização**: `/components/ThemeToggle.tsx`

Componente React que:
- Renderiza um botão com ícone sol/lua
- Gerencia o estado do tema (light/dark)
- Persiste a escolha no `localStorage`
- Aplica/remove a classe `dark` no `<html>`
- Detecta preferência do sistema operacional

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

// Usar em qualquer componente
<ThemeToggle />
```

### 2. Layout Principal
**Localização**: `/app/layout.tsx`

- **Script inline no `<head>`**: Previne flash de tema claro (FOUC)
- **suppressHydrationWarning**: Evita avisos do React sobre classes aplicadas via script
- **Classes dark**: Usa variantes Tailwind `dark:*` para estilos condicionais

```tsx
<html lang="pt-BR" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{...}} />
  </head>
  <body className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
```

### 3. Paleta de Cores

#### Tema Claro
- **Backgrounds**: `white`, `slate-50`, `slate-100`, `slate-200`
- **Bordas**: `slate-200`, `slate-300`
- **Textos**: `slate-900`, `slate-800`, `slate-600`, `slate-500`
- **Acentos**: `blue-600`, `green-600`, `red-700`

#### Tema Escuro
- **Backgrounds**: `zinc-950`, `zinc-900`, `zinc-800`
- **Bordas**: `zinc-800`, `zinc-700`
- **Textos**: `zinc-100`, `zinc-200`, `zinc-400`, `zinc-500`
- **Acentos**: `blue-400`, `green-400`, `red-400`

### 4. Padrões de Estilo

```tsx
// Background adaptável
className="bg-white dark:bg-zinc-900"

// Texto adaptável
className="text-slate-900 dark:text-zinc-100"

// Borda adaptável
className="border-slate-300 dark:border-zinc-700"

// Card adaptável
className="bg-white dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800"

// Input adaptável
className="bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
```

## 🔧 Integração

### Chat Principal
- Toggle no header (top-right)
- Localização: `/components/Chat.tsx`

### Admin Dashboard
- Toggle ao lado do botão "Sair"
- Localização: `/app/admin/dashboard/page.tsx`

### Admin Login
- Classes adaptáveis aplicadas
- Localização: `/app/admin/page.tsx`

## 💾 Persistência

O tema é salvo automaticamente no `localStorage`:
```javascript
localStorage.setItem('theme', 'dark'); // ou 'light'
```

## 🌐 Detecção do Sistema

Se o usuário não tiver preferência salva, o sistema detecta:
```javascript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

## ⚡ Prevenção de FOUC (Flash of Unstyled Content)

Script inline no `<head>` executa ANTES do React carregar:
1. Verifica `localStorage`
2. Se não houver preferência, usa detecção do sistema
3. Aplica classe `dark` imediatamente
4. Previne flash de tema incorreto

## 🎯 Componentes Atualizados

- ✅ `/app/layout.tsx` - Layout raiz com script anti-FOUC
- ✅ `/components/ThemeToggle.tsx` - Componente de alternância
- ✅ `/components/Chat.tsx` - Toggle no header
- ✅ `/app/admin/page.tsx` - Login com temas
- ✅ `/app/admin/dashboard/page.tsx` - Dashboard com temas

## 📝 Exemplo de Uso

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

function MyComponent() {
  return (
    <div className="bg-white dark:bg-zinc-950">
      <header className="bg-slate-100 dark:bg-zinc-900">
        <ThemeToggle />
      </header>
      <main className="text-slate-900 dark:text-zinc-100">
        <h1 className="text-blue-600 dark:text-blue-400">
          Título Adaptável
        </h1>
      </main>
    </div>
  );
}
```

## 🧪 Testando

1. Acesse http://localhost:3000
2. Clique no ícone sol/lua no header
3. Verifique a alternância visual
4. Recarregue a página (preferência mantida)
5. Teste no admin: http://localhost:3000/admin

## 🔍 Debugging

Verifique no console do navegador:
```javascript
// Ver tema atual
localStorage.getItem('theme')

// Ver classe dark aplicada
document.documentElement.classList.contains('dark')

// Verificar preferência do sistema
window.matchMedia('(prefers-color-scheme: dark)').matches
```

## 🎨 Customização

Para alterar cores, edite as classes Tailwind:
- Tema claro: `slate-*` e `blue-600`
- Tema escuro: `zinc-*` e `blue-400`

Para nova escala de cores, atualize `tailwind.config.js`.
