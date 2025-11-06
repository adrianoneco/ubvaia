# 🔐 Área Administrativa

## Acesso

Para acessar a área administrativa, navegue até:

```
http://localhost:3000/admin
```

## Credenciais Padrão

- **Usuário**: `admin`
- **Senha**: `admin123`

## Alterando as Credenciais

Edite o arquivo `.env` para alterar as credenciais:

```env
NEXT_PUBLIC_ADMIN_USERNAME=seu_usuario
NEXT_PUBLIC_ADMIN_PASSWORD=sua_senha_segura
```

**⚠️ IMPORTANTE**: Em produção, use um sistema de autenticação mais robusto e NUNCA exponha senhas no código-fonte.

## Funcionalidades

### Dashboard Admin

Após o login, você terá acesso ao dashboard com:

#### 📊 Visão Geral
- Total de sessões ativas
- Total de mensagens trocadas
- Estatísticas gerais

#### 💬 Lista de Sessões
- Visualize todas as sessões de conversa
- Busca por nome ou ID da sessão
- Ordenação por última atividade
- Contador de mensagens por sessão

#### 🔍 Detalhes da Conversa
- Visualize o histórico completo de mensagens
- Diferenciação visual entre usuário e assistente
- Timestamps de cada mensagem
- Suporte a visualização de imagens anexadas
- Informações sobre arquivos enviados

### Segurança

A autenticação é feita via `sessionStorage`, que:
- ✅ Persiste durante a sessão do navegador
- ✅ É limpa ao fechar o navegador
- ✅ Não é compartilhada entre abas
- ❌ Não é adequada para produção (use NextAuth.js, Auth0, etc.)

## Melhorias Recomendadas para Produção

1. **Autenticação Real**
   - Implementar NextAuth.js
   - Usar JWT tokens
   - Adicionar refresh tokens

2. **Autorização**
   - Diferentes níveis de acesso
   - Permissões granulares
   - Audit logs

3. **Segurança**
   - HTTPS obrigatório
   - Rate limiting
   - CSRF protection
   - 2FA (autenticação de dois fatores)

4. **Funcionalidades Adicionais**
   - Exportar conversas em CSV/JSON
   - Análise de sentimento
   - Estatísticas avançadas
   - Filtros por data/usuário
   - Deletar sessões antigas
   - Backup de dados

## Estrutura de Arquivos

```
app/admin/
├── page.tsx              # Página de login
├── layout.tsx            # Layout da área admin
└── dashboard/
    └── page.tsx          # Dashboard principal
```

## Exemplo de Uso

1. Acesse `http://localhost:3000/admin`
2. Digite as credenciais (admin/admin123)
3. Clique em "Entrar"
4. No dashboard, clique em qualquer sessão na lista
5. Visualize o histórico completo de mensagens
6. Use a busca para filtrar sessões
7. Clique em "Sair" para fazer logout

## Troubleshooting

### Não consigo fazer login
- Verifique as credenciais no arquivo `.env`
- Limpe o cache do navegador
- Verifique o console do navegador para erros

### Não vejo nenhuma sessão
- Certifique-se de que há conversas salvas no chat principal
- Verifique se o localStorage está habilitado
- Recarregue a página

### Layout quebrado
- Certifique-se de que todos os componentes do shadcn/ui estão instalados
- Execute `npm install` para garantir todas as dependências

## Suporte

Para dúvidas ou problemas, consulte a documentação principal do projeto.
