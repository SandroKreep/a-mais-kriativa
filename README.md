# A+ Kriativa - Marketplace Comparador de Preços

Um website de demonstração (portfólio) de um marketplace comparador de preços para tecnologia, inspirado no design do Octoshop com foco em design minimalista, experiência do usuário e animações leves.

## 🎨 Características

- **Design Minimalista**: Interface clean com uso eficiente de espaços em branco
- **Componentes Responsivos**: Cards elegantes que se adaptam a qualquer dispositivo
- **Animações Fluidas**: Transições suaves com Framer Motion
- **Busca em Tempo Real**: Filtro de produtos instantâneo
- **Modal Detalhado**: Visualização completa do produto com especificações
- **Comparador de Preços**: Lista de produtos tecnológicos com descontos
- **🆕 Autenticação de Usuários**: Cadastro e login de vendedores
- **🆕 Upload de Produtos**: Vendedores podem adicionar seus próprios produtos
- **🆕 Painel de Vendedor**: Gerenciar produtos e visualizar informações da loja
- **🆕 Dados Persistentes**: Todos os dados são salvos no localStorage
- **🆕 Compatível com GitHub Pages**: Pronto para deployment automático

## 🛠 Tecnologias Utilizadas

- **React 18** - Framework JavaScript para UI
- **Tailwind CSS** - Estilização utilitária
- **Framer Motion** - Animações avançadas
- **Vite** - Build tool rápido
- **JavaScript ES6+** - Funcionalidades modernas

## 📦 Instalação

1. **Clone ou acesse o projeto:**
```bash
cd seu-projeto
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

4. **Abra no navegador:**
O projeto abrirá automaticamente em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
projeto/
├── src/
│   ├── App.jsx                 # Componente principal
│   ├── SearchBar.jsx          # Barra de busca e filtros
│   ├── ProductCard.jsx        # Card do produto
│   ├── ProductModal.jsx       # Modal de detalhes
│   ├── mockData.json          # Dados dos produtos
│   ├── index.css              # Estilos globais
│   └── main.jsx               # Ponto de entrada React
├── index.html                 # HTML raiz
├── tailwind.config.js         # Configuração Tailwind
├── postcss.config.js          # Configuração PostCSS
├── vite.config.js             # Configuração Vite
└── package.json               # Dependências
```

## 🎯 Funcionalidades

### Barra de Busca
- Filtro em tempo real por nome e descrição
- Categorias de produtos
- Limpeza de filtros com um clique

### Cards de Produtos
- Imagem do produto
- Badge de desconto
- Avaliação em estrelas
- Preço original e com desconto
- Botão "Ver Detalhes"
- Hover animations

### Modal de Detalhes
- Imagem ampliada
- Informações completas do produto
- Histórico de preço economizado
- Botões de ação (Comparar, Adicionar à Lista)
- Benefícios do produto listados

### 🆕 Sistema de Autenticação
- **Cadastro de Vendedores**: Criar conta com nome, email, empresa, telefone e senha
- **Login**: Acesso à conta com email e senha
- **Dados Persistentes**: Informações do usuário salvas no localStorage
- **Restauração de Sessão**: Usuário volta logado ao recarregar a página

### 🆕 Upload de Produtos
- Vendedores cadastrados podem adicionar produtos
- Suporta upload de imagens (via data URL)
- Seleção de categoria (Produtos, Websites, Personalização, Serviços)
- Preço atual e preço original
- Contato do vendedor (telefone e email)
- Produtos aparecem para todos imediatamente

### 🆕 Painel de Vendedor
- Visualizar todos os seus produtos
- Informações estatísticas (número de produtos, avaliação média)
- Dados de contato
- Adicionar novos produtos
- Deletar produtos enviados
- Acesso exclusivo para usuários logados

### 🆕 Armazenamento de Dados
- **Persistência de Usuários**: Dados de cadastro salvos no localStorage
- **Persistência de Produtos**: Produtos de usuários salvos permanentemente
- **Visibilidade Pública**: Produtos de usuários visíveis para todos
- **Sem Limitação**: Todos podem ver produtos mesmo sem cadastro

### Design Responsivo
- Mobile-first approach
- Tailwind CSS para layout flexível
- Grid de 1-3 colunas conforme tamanho da tela

## 🎨 Customização

### Adicionar Novos Produtos
Edite `src/mockData.json`:
```json
{
  "id": 13,
  "name": "Seu Produto",
  "price": 999,
  "originalPrice": 1099,
  "image": "url-da-imagem",
  "category": "Categoria",
  "rating": 4.8,
  "description": "Descrição do produto",
  "link": "#"
}
```

### Mudar Cores
Edite `tailwind config.js`:
```js
colors: {
  primary: '#0066FF',  // Mude para sua cor
  dark: '#0F172A',
  light: '#F8FAFC',
}
```

## 📱 Breakpoints Responsivos

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚀 Deploy

### Para produção:
```bash
npm run build
```

Isso criará uma pasta `dist/` pronta para deploy em qualquer servidor estático.

### Deploy no GitHub Pages (Recomendado)

1. **Prepare o repositório:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Crie um repositório no GitHub** e faça push:
   ```bash
   git remote add origin https://github.com/seu-usuario/jj.git
   git push -u origin main
   ```

3. **Habilite GitHub Pages:**
   - Vá para Settings → Pages
   - Source: GitHub Actions
   - O site será publicado automaticamente

4. **Acesse seu site:**
   ```
   https://seu-usuario.github.io/jj
   ```

⚠️ **Importante**: Se mudar o nome do repositório, atualize a base URL em `vite.config.js`:
```javascript
base: '/novo-nome-repositorio/',
```

**Leia [DEPLOYMENT.md](./DEPLOYMENT.md) para instruções detalhadas.**

## 📝 Licença

Este é um projeto de demonstração educacional. Todos os dados são fictícios.

## 👨‍💻 Desenvolvedor

Criado como um portfólio de desenvolvimento front-end com React e Tailwind CSS.

---

**Divirta-se construindo!** 🚀
