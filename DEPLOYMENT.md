# Guia de Deployment no GitHub Pages

## Funcionalidades Implementadas

✅ **Dados de Usuários Persistentes**
- Os dados dos usuários cadastrados são salvos no localStorage
- Quando o usuário volta ao site, seus dados são automaticamente carregados
- O usuário pode fazer login novamente e acessar seus produtos

✅ **Produtos Persistentes**
- Os produtos enviados pelos usuários são salvos permanentemente no localStorage
- Todos podem ver os produtos enviados (usuários cadastrados e não cadastrados)
- Os produtos continuam no site mesmo após recarregar a página

✅ **Compatibilidade com GitHub Pages**
- O projeto está configurado para hospedagem no GitHub Pages
- Build otimizado para GitHub Pages

## Passos para Deploy no GitHub Pages

### 1. Preparar o Repositório Git

```bash
# Inicializar git (se ainda não estiver)
git init
git add .
git commit -m "Initial commit"
```

### 2. Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em "New Repository"
3. Nome do repositório: `jj` (ou o nome que desejar)
4. Escolha "Public" para que o site fique público
5. Clique em "Create repository"

### 3. Fazer Push do Código

```bash
git remote add origin https://github.com/seu-usuario/jj.git
git branch -M main
git push -u origin main
```

### 4. Atualizar vite.config.js

Se o repositório tiver um nome diferente de "jj", atualize:

```javascript
base: '/seu-nome-repositorio/',
```

### 5. Habilitar GitHub Pages

1. Acesse as configurações do repositório
2. Vá para "Settings" → "Pages"
3. Em "Build and deployment":
   - **Source**: GitHub Actions
   - O workflow `.github/workflows/deploy.yml` será executado automaticamente

### 6. Esperar o Deploy

1. Acesse a aba "Actions" no repositório
2. Aguarde o workflow "Deploy to GitHub Pages" completar
3. Seu site estará disponível em: `https://seu-usuario.github.io/jj`

## Estrutura de Dados Local

### Usuários
Armazenado em `localStorage['currentUser']`:
```json
{
  "id": 1234567890,
  "name": "João Silva",
  "email": "joao@email.com",
  "company": "Minha Loja",
  "phone": "+244 912345678",
  "isSeller": true,
  "registeredAt": "2026-04-23T..."
}
```

### Produtos
Armazenado em `localStorage['allProducts']` como um array:
```json
{
  "id": 1234567890,
  "userId": 1234567890,
  "name": "Produto X",
  "price": 50000,
  "category": "Produtos",
  "description": "...",
  "seller": "Minha Loja",
  "phone": "+244 912345678",
  "email": "contato@email.com",
  "uploadedAt": "2026-04-23T..."
}
```

## Notas Importantes

⚠️ **Armazenamento Local**
- Os dados são salvos apenas no navegador do usuário
- Cada navegador/dispositivo tem seu próprio localStorage
- Se o usuário limpar o cache/cookies, os dados serão perdidos
- Recomenda-se futuramente migrar para um banco de dados real

## Futuros Melhoramentos

Para produção, considere:
1. Usar um banco de dados real (Firebase, MongoDB, PostgreSQL, etc.)
2. Implementar autenticação real com tokens JWT
3. Adicionar validação de dados no servidor
4. Implementar Sistema de pagamento
5. Adicionar spam/moderação de produtos

## Troubleshooting

### Site não aparece no GitHub Pages
- Verifique se o workflow foi executado com sucesso em Actions
- Confirme que a base URL em vite.config.js está correta
- Aguarde 1-2 minutos para o GitHub processar

### Dados desaparecem ao trocar de dispositivo
- Isso é esperado pois o localStorage é local ao navegador
- Considere implementar sincronização com um servidor

### Produtos não aparecem para usuários não cadastrados
- Verifique se o produto foi salvo corretamente
- Abra DevTools (F12) e procure em Application → Local Storage

## Suporte

Para mais informações sobre GitHub Pages, acesse:
https://docs.github.com/pt/pages/getting-started-with-github-pages
