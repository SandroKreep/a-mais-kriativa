import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './Navigation';
import SearchBar from './SearchBar';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import AuthModal from './AuthModal';
import SellerDashboard from './SellerDashboard';
import AdminPage from './AdminPage';
import { supabase } from './supabase';
import productsData from './mockData.json';
import { formatPriceKZA } from './utils/formatPrice';
import './index.css';

/** Categoria de navegação interna (tabs do menu) */
const NAV = {
  PRODUTOS: 'produtos',
  WEBSITES: 'websites',
  PERSONALIZACAO: 'personalizacao',
  SERVICOS: 'servicos',
};

function mapDbCategoryToNav(categoria) {
  const k = String(categoria || '').toLowerCase();
  if (k === 'produtos') return NAV.PRODUTOS;
  if (k === 'websites') return NAV.WEBSITES;
  if (k === 'personalizacao') return NAV.PERSONALIZACAO;
  if (k === 'servicos') return NAV.SERVICOS;
  /** Legado (antes das categorias normalizadas) */
  if (k === 'camisetas') return NAV.PERSONALIZACAO;
  return NAV.SERVICOS;
}

function mapServiceToNavCategory(service) {
  if (service.id === 1) return NAV.WEBSITES;
  return NAV.SERVICOS;
}

function buildStaticProductsFromMock(data) {
  const out = [];

  (data.products ?? []).forEach((p) => {
    out.push({
      id: `static-product-${p.id}`,
      sourceId: p.id,
      sourceType: 'product',
      name: p.name,
      description: p.description ?? '',
      price: Number(p.price) || 0,
      originalPrice: Number(p.originalPrice ?? p.price) || 0,
      category: p.category ?? 'Produtos',
      image: p.image || 'https://via.placeholder.com/600x400?text=A%2B+Kriativa',
      rating: Number(p.rating) || 4.5,
      available: true,
      navCategory: NAV.PRODUTOS,
      rawCategory: null,
      whatsapp: p.whatsapp || '',
      email: p.email || '',
      telefone: p.telefone || '',
      localizacao: p.localizacao || '',
      vendedorId: null,
      isStatic: true,
    });
  });

  (data.customProducts ?? []).forEach((p) => {
    const price = Number(p.basePrice) || 0;
    out.push({
      id: `static-custom-${p.id}`,
      sourceId: p.id,
      sourceType: 'custom',
      name: p.name,
      description: p.description ?? '',
      price,
      originalPrice: price,
      category: 'Personalização',
      image: p.image || 'https://via.placeholder.com/600x400?text=A%2B+Kriativa',
      rating: Number(p.rating) || 4.5,
      available: true,
      navCategory: NAV.PERSONALIZACAO,
      rawCategory: null,
      whatsapp: p.whatsapp || '',
      email: p.email || '',
      telefone: p.telefone || '',
      localizacao: p.localizacao || '',
      vendedorId: null,
      isStatic: true,
    });
  });

  (data.services ?? []).forEach((p) => {
    const nav = mapServiceToNavCategory(p);
    const price = Number(p.price) || 0;
    out.push({
      id: `static-service-${p.id}`,
      sourceId: p.id,
      sourceType: 'service',
      name: p.name,
      description: p.description ?? '',
      price,
      originalPrice: price,
      category: nav === NAV.WEBSITES ? 'Websites' : 'Serviços',
      image: p.image || 'https://via.placeholder.com/600x400?text=A%2B+Kriativa',
      rating: Number(p.rating) || 4.5,
      available: true,
      navCategory: nav,
      rawCategory: null,
      whatsapp: p.whatsapp || '',
      email: p.email || '',
      telefone: p.telefone || '',
      localizacao: p.localizacao || '',
      vendedorId: null,
      isStatic: true,
    });
  });

  return out;
}

function matchesNavCategory(product, selectedCategory) {
  if (selectedCategory === 'Todos') return true;
  const map = {
    Produtos: NAV.PRODUTOS,
    Websites: NAV.WEBSITES,
    Personalização: NAV.PERSONALIZACAO,
    Serviços: NAV.SERVICOS,
  };
  const key = map[selectedCategory];
  return key != null && product.navCategory === key;
}

function App() {
  const pathname = window.location.pathname || '/';
  const isAdminRoute = pathname === '/admin' || pathname === '/admin/';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isLoginRequiredOpen, setIsLoginRequiredOpen] = useState(false);
  const [isSellerDashboardOpen, setIsSellerDashboardOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [supabaseProducts, setSupabaseProducts] = useState([]);
  const staticProducts = useMemo(() => buildStaticProductsFromMock(productsData), []);
  const [cartItems, setCartItems] = useState([]);
  /** Carregamento dos produtos Supabase em segundo plano (não bloqueia os estáticos). */
  const [isLoadingSupabaseProducts, setIsLoadingSupabaseProducts] = useState(true);
  const [supabaseProductsTimedOut, setSupabaseProductsTimedOut] = useState(false);
  const canAccessSellerDashboard = Boolean(
    user &&
      (
        userProfile?.tipo_perfil === 'vendedor' ||
        userProfile?.tipo_perfil == null
      )
  );

  const mapCategoryToLabel = useCallback((category) => {
    const key = String(category || '').toLowerCase();
    if (key === 'produtos') return 'Produtos';
    if (key === 'websites') return 'Websites';
    if (key === 'personalizacao') return 'Personalização';
    if (key === 'servicos') return 'Serviços';
    /** Legado */
    if (key === 'camisetas') return 'Personalização';
    return 'Serviços';
  }, []);

  const mapSupabaseRowToProduct = useCallback(
    (product) => {
      const vendedor = product.vendedor || product.usuarios || null;
      return {
      id: `supabase-${product.id}`,
      sourceId: product.id,
      name: product.nome,
      description: product.descricao ?? '',
      price: Number(product.preco) || 0,
      originalPrice: Number(product.preco) || 0,
      category: mapCategoryToLabel(product.categoria),
      image: (Array.isArray(product.imagens) && product.imagens[0]) || product.imagem_url || 'https://via.placeholder.com/600x400?text=A%2B+Kriativa',
      images: Array.isArray(product.imagens) && product.imagens.length ? product.imagens : [product.imagem_url].filter(Boolean),
      rating: 4.5,
      available: product.disponivel,
      rawCategory: product.categoria,
      navCategory: mapDbCategoryToNav(product.categoria),
      whatsapp: vendedor?.whatsapp || '',
      email: vendedor?.email || '',
      telefone: vendedor?.telefone || '',
      localizacao: vendedor?.localizacao || '',
      vendedorId: product.vendedor_id || null,
      isStatic: false,
      };
    },
    [mapCategoryToLabel]
  );

  const mapRowsWithSellerInfo = useCallback(
    async (rows) => {
      const rawRows = rows ?? [];
      if (!rawRows.length) return [];

      const userIds = [...new Set(rawRows.map((row) => row.vendedor_id).filter(Boolean))];
      if (!userIds.length) {
        return rawRows.map(mapSupabaseRowToProduct);
      }

      const { data: sellers, error: sellersError } = await supabase
        .from('usuarios')
        .select('id, email, telefone, whatsapp, localizacao')
        .in('id', userIds);

      if (sellersError) {
        console.error('Erro ao carregar dados dos vendedores:', sellersError);
        return rawRows.map(mapSupabaseRowToProduct);
      }

      const sellerById = Object.fromEntries((sellers ?? []).map((seller) => [seller.id, seller]));
      const hydratedRows = rawRows.map((row) => ({
        ...row,
        vendedor: sellerById[row.vendedor_id] ?? null,
      }));

      return hydratedRows.map(mapSupabaseRowToProduct);
    },
    [mapSupabaseRowToProduct]
  );

  const fetchUserProfile = async (userId) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error) {
      setUserProfile(data);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        await fetchUserProfile(data.session.user.id);
      }
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timedOut = false;

    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      if (cancelled) return;
      setSupabaseProductsTimedOut(true);
      setIsLoadingSupabaseProducts(false);
    }, 3000);

    const loadProducts = async () => {
      setIsLoadingSupabaseProducts(true);
      setSupabaseProductsTimedOut(false);

      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('criado_em', { ascending: false });

      window.clearTimeout(timeoutId);

      if (cancelled) return;

      if (timedOut) {
        return;
      }

      if (error) {
        console.error('Erro ao carregar produtos:', error);
        setSupabaseProducts([]);
      } else {
        const mapped = await mapRowsWithSellerInfo(data ?? []);
        setSupabaseProducts(mapped);
      }
      setIsLoadingSupabaseProducts(false);
    };

    loadProducts();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [mapRowsWithSellerInfo]);

  const allProducts = useMemo(
    () => [...supabaseProducts, ...staticProducts],
    [supabaseProducts, staticProducts]
  );

  const ensureUsuarioProfile = async (authUser) => {
    if (!authUser) return;

    const metadata = authUser.user_metadata || {};
    const { error } = await supabase.from('usuarios').upsert(
      {
        id: authUser.id,
        nome: metadata.nome || authUser.email?.split('@')[0] || 'Utilizador',
        email: authUser.email,
        telefone: metadata.telefone || null,
        whatsapp: metadata.whatsapp || null,
        localizacao: metadata.localizacao || null,
        descricao_loja: metadata.descricao_loja || null,
        website: metadata.website || null,
        tipo_perfil: metadata.tipo_perfil || 'comprador',
        role: 'cliente',
      },
      { onConflict: 'id' }
    );

    if (error) {
      throw error;
    }
  };

  const allCategories = ['Todos', 'Produtos', 'Websites', 'Personalização', 'Serviços'];

  const { filteredSupabase, filteredStatic } = useMemo(() => {
    const q = (searchTerm || '').toLowerCase();
    const matchSearch = (product) =>
      product.name.toLowerCase().includes(q) ||
      (product.description || '').toLowerCase().includes(q);

    const filteredSupa = allProducts.filter((product) => {
      if (product.isStatic) return false;
      if (!matchSearch(product)) return false;
      return matchesNavCategory(product, selectedCategory);
    });

    const filteredStat = allProducts.filter((product) => {
      if (!product.isStatic) return false;
      if (!matchSearch(product)) return false;
      return matchesNavCategory(product, selectedCategory);
    });

    return { filteredSupabase: filteredSupa, filteredStatic: filteredStat };
  }, [searchTerm, selectedCategory, allProducts]);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    if (!product?.isStatic && product?.sourceId) {
      supabase.from('visualizacoes_produto').insert({ produto_id: product.sourceId }).then(({ error }) => {
        if (error) {
          console.warn('Falha ao registar visualização de produto:', error.message);
        }
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleLogin = (userData, opts = {}) => {
    const closeModal = opts.closeModal !== false;
    setUser(userData);
    if (closeModal) setIsAuthOpen(false);
    fetchUserProfile(userData.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    setIsSellerDashboardOpen(false);
  };

  const handleCreateProduct = async (payload) => {
    if (!user) {
      throw new Error('Utilizador não autenticado.');
    }

    const insertPayload = {
      nome: payload.nome,
      descricao: payload.descricao,
      preco: payload.preco,
      categoria: payload.categoria,
      imagem_url: payload.imagem_url || null,
      imagens: Array.isArray(payload.imagens) && payload.imagens.length ? payload.imagens : null,
      disponivel: true,
      vendedor_id: user.id,
    };

    const insertResult = await supabase
      .from('produtos')
      .insert(insertPayload)
      .select('*')
      .maybeSingle();

    console.log('Resultado do insert em produtos:', insertResult);

    const { data: insertedRow, error } = insertResult;

    if (error) {
      throw error;
    }

    if (insertedRow) {
      const [mapped] = await mapRowsWithSellerInfo([insertedRow]);
      if (!mapped) return;
      setSupabaseProducts((prev) => {
        if (prev.some((p) => p.sourceId === mapped.sourceId)) return prev;
        return [mapped, ...prev];
      });
      return;
    }

    const { data: products } = await supabase
      .from('produtos')
      .select('*')
      .order('criado_em', { ascending: false });

    const mapped = await mapRowsWithSellerInfo(products ?? []);
    setSupabaseProducts(mapped);
  };

  const handleDeleteProduct = async (product) => {
    if (!user) {
      throw new Error('Utilizador não autenticado.');
    }
    if (!product?.sourceId) {
      throw new Error('Produto inválido.');
    }

    const deleteResult = await supabase
      .from('produtos')
      .delete()
      .eq('id', product.sourceId)
      .eq('vendedor_id', user.id)
      .select('id')
      .maybeSingle();

    console.log('Resultado do delete em produtos:', deleteResult);

    const { error } = deleteResult;
    if (error) throw error;

    setSupabaseProducts((prev) => prev.filter((p) => p.sourceId !== product.sourceId));
  };

  const handleAddToCart = (product) => {
    if (!user) {
      setIsLoginRequiredOpen(true);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...prev, { ...product, quantidade: 1 }];
    });
  };

  const handleOpenAuth = (mode) => {
    setIsLoginRequiredOpen(false);
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantidade, 0),
    [cartItems]
  );

  const handleConfirmOrder = async () => {
    if (!user) {
      setIsLoginRequiredOpen(true);
      setAuthMode('login');
      return;
    }

    if (!cartItems.length) {
      alert('Seu carrinho está vazio.');
      return;
    }

    const lineItemsForDb = cartItems.filter(
      (item) => !item.isStatic && item.sourceId
    );
    if (!lineItemsForDb.length) {
      alert(
        'Apenas produtos publicados no site podem ser encomendados online. Remova itens de demonstração ou contacte o vendedor.'
      );
      return;
    }

    const orderTotal = lineItemsForDb.reduce(
      (sum, item) => sum + item.price * item.quantidade,
      0
    );

    try {
      await ensureUsuarioProfile(user);

      const { data: order, error: orderError } = await supabase
        .from('pedidos')
        .insert({
          usuario_id: user.id,
          status: 'pendente',
          total: orderTotal,
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      const orderItems = lineItemsForDb.map((item) => ({
        pedido_id: order.id,
        produto_id: item.sourceId,
        quantidade: item.quantidade,
        preco_unitario: item.price,
      }));

      const { error: itemsError } = await supabase.from('itens_pedido').insert(orderItems);
      if (itemsError) throw itemsError;

      setCartItems([]);
      setIsCartDrawerOpen(false);
      setIsModalOpen(false);
      alert('Pedido confirmado com sucesso!');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Erro ao confirmar pedido.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  useEffect(() => {
    if (isAdminRoute) return;
    supabase.from('acessos_site').insert({ pagina: window.location.pathname }).then(({ error }) => {
      if (error) {
        console.warn('Falha ao registar acesso:', error.message);
      }
    });
  }, [isAdminRoute]);

  if (isAdminRoute) {
    return <AdminPage />;
  }

  return (
    <div className="app-container min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <Navigation
        categories={allCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onLoginClick={() => setIsAuthOpen(true)}
        user={user}
        userProfile={userProfile}
        canAccessSellerDashboard={canAccessSellerDashboard}
        onLogoutClick={handleLogout}
        cartCount={cartItems.length}
        onCartClick={() => setIsCartDrawerOpen(true)}
        onSellerDashboardClick={() => setIsSellerDashboardOpen(true)}
      />

      {/* Main Content */}
      <main className="main-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search Bar */}
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          categories={allCategories}
          selectedCategory={selectedCategory}
        />

        {supabaseProductsTimedOut && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            O catálogo online demorou demasiado a responder; a mostrar os itens locais. Pode atualizar a página mais tarde para ver produtos dos vendedores.
          </p>
        )}

        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4"
        >
          <h2 className="text-base sm:text-xl font-bold text-gray-800">
            {filteredSupabase.length + filteredStatic.length}{' '}
            {selectedCategory !== 'Todos' ? `em ${selectedCategory}` : 'itens encontrados'}
          </h2>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {searchTerm && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Todos');
                }}
                className="text-blue-600 font-semibold hover:underline flex items-center gap-1 text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Grelha: estáticos primeiro; Supabase e skeleton em segundo plano (nunca bloqueia os estáticos) */}
        {filteredSupabase.length > 0 ||
        filteredStatic.length > 0 ||
        (isLoadingSupabaseProducts && !supabaseProductsTimedOut) ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {filteredStatic.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} onOpen={handleOpenModal} />
              </motion.div>
            ))}
            {isLoadingSupabaseProducts &&
              !supabaseProductsTimedOut &&
              Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="bg-white rounded-2xl overflow-hidden h-full border border-gray-100 shadow-sm"
                >
                  <div className="h-40 sm:h-48 skeleton-card-shimmer" />
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="h-4 bg-slate-200/90 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-slate-200/90 rounded w-full animate-pulse" />
                    <div className="h-3 bg-slate-200/90 rounded w-5/6 animate-pulse" />
                    <div className="h-8 bg-slate-200/90 rounded w-full mt-4 animate-pulse" />
                  </div>
                </div>
              ))}
            {filteredSupabase.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} onOpen={handleOpenModal} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-20"
          >
            <svg
              className="mx-auto w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">
              Nenhum item encontrado
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Tente ajustar seus filtros ou termos de busca
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todos');
              }}
              className="bg-primary text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base"
            >
              Ver Todos os Itens
            </motion.button>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-dark text-gray-300 py-8 mt-12 sm:mt-16 border-t border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">Sobre</h3>
              <p className="text-xs sm:text-sm">A+ Kriativa Marketplace - O seu marketplace online em Angola.</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Links Rápidos</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-primary transition">Início</a></li>
                <li><a href="#" className="hover:text-primary transition">Produtos</a></li>
                <li><a href="#" className="hover:text-primary transition">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Contacto</h3>
              <p className="text-xs sm:text-sm">Email: contato@akritativa.com</p>
              <p className="text-xs sm:text-sm">Fone: +244 9XX XXX XXX</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-xs sm:text-sm">
            <p>&copy; 2026 A+ Kriativa. Todos os direitos reservados.</p>
          </div>
        </div>
      </motion.footer>

      {/* Modals */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
        onConfirmOrder={handleConfirmOrder}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        defaultMode={authMode}
      />

      <AnimatePresence>
        {isLoginRequiredOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsLoginRequiredOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed z-[60] inset-0 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-soft-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Login necessário</h3>
                <p className="text-gray-600 text-sm mb-5">
                  Precisas de fazer login para adicionar produtos ao carrinho.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition"
                  >
                    Fazer Login
                  </button>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="w-full border border-primary text-primary py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition"
                  >
                    Criar Conta
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setIsCartDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-[60] shadow-soft-lg flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Carrinho ({cartItems.length})</h3>
                <button onClick={() => setIsCartDrawerOpen(false)} className="text-gray-500 hover:text-gray-800">Fechar</button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cartItems.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum produto no carrinho.</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 border border-gray-100 rounded-xl p-3">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{formatPriceKZA(item.price)}</p>
                        <p className="text-xs text-gray-600 mt-1">Qtd: {item.quantidade}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-xs text-red-600 hover:underline self-start"
                      >
                        Remover
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-bold text-primary">{formatPriceKZA(cartTotal)}</span>
                </div>
                <button
                  onClick={() => setCartItems([])}
                  className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition"
                >
                  Limpar Carrinho
                </button>
                {user && (
                  <button
                    onClick={handleConfirmOrder}
                    disabled={!cartItems.length}
                    className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    Confirmar Pedido
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {isSellerDashboardOpen && canAccessSellerDashboard && (
        <SellerDashboard
          authUserId={user?.id}
          userProfile={userProfile}
          userProducts={allProducts.filter((product) => product.vendedorId === user?.id)}
          onClose={() => setIsSellerDashboardOpen(false)}
          onCreateProduct={handleCreateProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}
    </div>
  );
}

export default App;
