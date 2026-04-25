import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';
import { formatPriceKZA } from './utils/formatPrice';
import { isAdminLoggedIn, loginAdmin, logoutAdmin, getAdminUsername } from './adminAuth';

const SECTIONS = [
  { id: 'produtos', label: 'Gestão de Produtos' },
  { id: 'usuarios', label: 'Gestão de Utilizadores' },
  { id: 'estatisticas', label: 'Estatísticas' },
  { id: 'pedidos', label: 'Gestão de Pedidos' },
];

export default function AdminPage() {
  const [isLogged, setIsLogged] = useState(() => isAdminLoggedIn());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeSection, setActiveSection] = useState('produtos');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [accessStats, setAccessStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topSellers, setTopSellers] = useState([]);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [
        productsRes,
        usersRes,
        ordersRes,
        accessesRes,
        viewsRes,
        sellerProductsRes,
      ] = await Promise.all([
        supabase
          .from('produtos')
          .select('id, nome, categoria, preco, disponivel, criado_em, usuario_id, vendedor_id')
          .order('criado_em', { ascending: false }),
        supabase
          .from('usuarios')
          .select('id, nome, email, telefone, role, bloqueado, criado_em')
          .order('criado_em', { ascending: false }),
        supabase
          .from('pedidos')
          .select('id, status, total, criado_em, usuario_id, usuarios(nome, email)')
          .order('criado_em', { ascending: false }),
        supabase
          .from('acessos_site')
          .select('id, criado_em')
          .order('criado_em', { ascending: false })
          .limit(1000),
        supabase
          .from('visualizacoes_produto')
          .select('id, produto_id, criado_em, produtos(nome)')
          .order('criado_em', { ascending: false })
          .limit(5000),
        supabase
          .from('produtos')
          .select('id, nome, usuario_id, vendedor_id, usuarios(nome, email)')
          .limit(5000),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (usersRes.error) throw usersRes.error;
      if (ordersRes.error) throw ordersRes.error;
      if (accessesRes.error) throw accessesRes.error;
      if (viewsRes.error) throw viewsRes.error;
      if (sellerProductsRes.error) throw sellerProductsRes.error;

      setProducts(productsRes.data || []);
      setUsers(usersRes.data || []);
      setOrders(ordersRes.data || []);

      const accessByDay = {};
      for (const access of accessesRes.data || []) {
        const dt = new Date(access.criado_em);
        const dayKey = dt.toISOString().slice(0, 10);
        if (!accessByDay[dayKey]) {
          accessByDay[dayKey] = {
            dayKey,
            dayLabel: dt.toLocaleDateString('pt-PT'),
            total: 0,
          };
        }
        accessByDay[dayKey].total += 1;
      }
      setAccessStats(
        Object.values(accessByDay)
          .sort((a, b) => (a.dayKey < b.dayKey ? 1 : -1))
          .slice(0, 14)
      );

      const productViewsMap = {};
      for (const view of viewsRes.data || []) {
        const productId = view.produto_id;
        if (!productId) continue;
        if (!productViewsMap[productId]) {
          productViewsMap[productId] = {
            productId,
            productName: view.produtos?.nome || 'Produto sem nome',
            total: 0,
          };
        }
        productViewsMap[productId].total += 1;
      }
      setTopProducts(
        Object.values(productViewsMap)
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)
      );

      const sellersMap = {};
      for (const product of sellerProductsRes.data || []) {
        const sellerId = product.usuario_id || product.vendedor_id;
        if (!sellerId) continue;
        if (!sellersMap[sellerId]) {
          sellersMap[sellerId] = {
            sellerId,
            sellerName: product.usuarios?.nome || product.usuarios?.email || 'Vendedor',
            productsCount: 0,
          };
        }
        sellersMap[sellerId].productsCount += 1;
      }
      setTopSellers(
        Object.values(sellersMap)
          .sort((a, b) => b.productsCount - a.productsCount)
          .slice(0, 5)
      );
    } catch (err) {
      setError(err.message || 'Erro ao carregar painel de administração.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLogged) {
      loadDashboardData();
    }
  }, [isLogged, loadDashboardData]);

  const usersTotal = users.length;

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    const ok = loginAdmin(username, password);
    if (!ok) {
      setLoginError('Credenciais inválidas.');
      return;
    }
    setLoginError('');
    setPassword('');
    setIsLogged(true);
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsLogged(false);
    setUsername('');
    setPassword('');
  };

  const removeProduct = async (productId) => {
    const confirmed = window.confirm('Remover este produto permanentemente?');
    if (!confirmed) return;
    const { error: removeError } = await supabase.from('produtos').delete().eq('id', productId);
    if (removeError) {
      alert(removeError.message || 'Erro ao remover produto.');
      return;
    }
    setProducts((prev) => prev.filter((item) => item.id !== productId));
  };

  const toggleUserBlocked = async (user) => {
    const nextBlocked = !user.bloqueado;
    const payload = {
      bloqueado: nextBlocked,
      bloqueado_em: nextBlocked ? new Date().toISOString() : null,
    };
    const { error: updateError } = await supabase.from('usuarios').update(payload).eq('id', user.id);
    if (updateError) {
      alert(updateError.message || 'Erro ao atualizar bloqueio do utilizador.');
      return;
    }
    setUsers((prev) =>
      prev.map((item) => (item.id === user.id ? { ...item, bloqueado: nextBlocked } : item))
    );
  };

  const removeUser = async (userId) => {
    const confirmed = window.confirm('Remover utilizador? Esta ação não pode ser desfeita.');
    if (!confirmed) return;
    const { error: removeError } = await supabase.from('usuarios').delete().eq('id', userId);
    if (removeError) {
      alert(removeError.message || 'Erro ao remover utilizador.');
      return;
    }
    setUsers((prev) => prev.filter((item) => item.id !== userId));
  };

  const content = useMemo(() => {
    if (activeSection === 'produtos') {
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Produtos ({products.length})</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">Categoria</th>
                  <th className="px-4 py-3 text-left">Preço</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{product.nome}</td>
                    <td className="px-4 py-3 text-slate-600">{product.categoria}</td>
                    <td className="px-4 py-3 text-slate-600">{formatPriceKZA(product.preco)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          product.disponivel
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {product.disponivel ? 'Disponível' : 'Indisponível'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeSection === 'usuarios') {
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Utilizadores ({usersTotal})</h2>
          <div className="grid gap-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{user.nome || 'Sem nome'}</p>
                  <p className="text-sm text-slate-600">{user.email || 'Sem email'}</p>
                  <p className="text-xs text-slate-500">Telefone: {user.telefone || 'N/A'}</p>
                  <p className="text-xs text-slate-500">Perfil: {user.role || 'cliente'}</p>
                  <p className="text-xs text-slate-500">
                    Estado: {user.bloqueado ? 'Bloqueado' : 'Ativo'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleUserBlocked(user)}
                    className={`rounded-md px-3 py-2 text-xs font-semibold text-white ${
                      user.bloqueado ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    {user.bloqueado ? 'Desbloquear' : 'Bloquear'}
                  </button>
                  <button
                    onClick={() => removeUser(user.id)}
                    className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                  >
                    Remover conta
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection === 'pedidos') {
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Pedidos ({orders.length})</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">Pedido</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Data</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-700">{order.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.usuarios?.nome || 'Utilizador'}</p>
                      <p className="text-xs text-slate-500">{order.usuarios?.email || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-1 text-xs font-semibold">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatPriceKZA(order.total)}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(order.criado_em).toLocaleString('pt-PT')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-slate-900">Estatísticas do Supabase</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-800 mb-2">Acessos por dia</h3>
            <div className="space-y-2 text-sm">
              {accessStats.length ? (
                accessStats.map((item) => (
                  <div key={item.dayKey} className="flex items-center justify-between">
                    <span className="text-slate-600">{item.dayLabel}</span>
                    <span className="font-semibold text-slate-900">{item.total}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">Sem dados de acesso.</p>
              )}
            </div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-800 mb-2">Produtos mais vistos</h3>
            <div className="space-y-2 text-sm">
              {topProducts.length ? (
                topProducts.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 truncate">{item.productName}</span>
                    <span className="font-semibold text-slate-900">{item.total}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">Sem visualizações registadas.</p>
              )}
            </div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-800 mb-2">Vendedores mais ativos</h3>
            <div className="space-y-2 text-sm">
              {topSellers.length ? (
                topSellers.map((item) => (
                  <div key={item.sellerId} className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 truncate">{item.sellerName}</span>
                    <span className="font-semibold text-slate-900">{item.productsCount} produtos</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">Sem atividade de vendedores.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }, [activeSection, accessStats, orders, products, topProducts, topSellers, users, usersTotal]);

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <form
          onSubmit={handleLoginSubmit}
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg border border-slate-200"
        >
          <h1 className="text-2xl font-bold text-slate-900">Login Admin</h1>
          <p className="mt-2 text-sm text-slate-600">
            Acesso restrito ao painel administrativo.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Utilizador esperado: {getAdminUsername()}
          </p>
          <div className="mt-5 space-y-3">
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Utilizador"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Senha"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {loginError && (
              <p className="text-sm text-red-600">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Entrar no painel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex w-full max-w-7xl gap-6 p-4 sm:p-6">
        <aside className="w-64 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 hidden md:block">
          <h1 className="text-lg font-bold text-slate-900">Admin</h1>
          <p className="mt-1 text-xs text-slate-500">Painel de controlo</p>
          <nav className="mt-5 space-y-1">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="mt-6 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </aside>

        <main className="flex-1">
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 md:hidden">
            <select
              value={activeSection}
              onChange={(event) => setActiveSection(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
            >
              {SECTIONS.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleLogout}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              Logout
            </button>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 min-h-[70vh]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {SECTIONS.find((item) => item.id === activeSection)?.label}
              </h2>
              <button
                onClick={loadDashboardData}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Atualizar dados
              </button>
            </div>
            {isLoading && <p className="text-sm text-slate-500 mb-4">A carregar dados...</p>}
            {error && (
              <p className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            {content}
          </section>
        </main>
      </div>
    </div>
  );
}
