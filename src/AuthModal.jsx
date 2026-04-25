import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, supabaseEnvIssues } from './supabase';

function formatSupabaseError(err) {
  if (err == null) return 'Erro desconhecido.';
  if (typeof err === 'string') return err;
  if (err.message) return String(err.message);
  if (err.error_description) return String(err.error_description);
  if (err.msg) return String(err.msg);
  const bits = [err.code, err.details, err.hint].filter(Boolean);
  if (bits.length) return bits.join(' — ');
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function withTimeout(promise, ms) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(`Tempo limite (${ms / 1000}s).`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => window.clearTimeout(timeoutId));
}

const emptyForm = () => ({
  name: '',
  email: '',
  password: '',
  phone: '',
  tipoPerfil: 'comprador',
  whatsapp: '',
  localizacao: '',
  descricaoLoja: '',
  website: '',
});

export default function AuthModal({ isOpen, onClose, onLogin, defaultMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(true);
  /** 'basic' = nome/email/password; 'extras' = opcional após signUp bem-sucedido */
  const [registerStep, setRegisterStep] = useState('basic');
  const [registeredUser, setRegisteredUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    setIsLogin(defaultMode !== 'register');
    setRegisterStep('basic');
    setRegisteredUser(null);
    setShowPassword(false);
  }, [defaultMode, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setAuthError('');
      setAuthSuccess('');
      setIsSubmitting(false);
      setRegisterStep('basic');
      setRegisteredUser(null);
      setShowPassword(false);
    }
  }, [isOpen]);

  const resetRegisterFlow = () => {
    setRegisterStep('basic');
    setRegisteredUser(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsSubmitting(true);

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        }),
        15000
      );

      if (error) {
        setAuthError(formatSupabaseError(error));
        return;
      }
      if (!data?.user) {
        setAuthError('Não foi possível obter a sessão. Tente novamente.');
        return;
      }

      setAuthSuccess('Sessão iniciada com sucesso.');
      try {
        onLogin(data.user, { closeModal: true });
      } catch (cbErr) {
        setAuthError(formatSupabaseError(cbErr));
        return;
      }
      setFormData(emptyForm());
      setAuthSuccess('');
    } catch (err) {
      const base = formatSupabaseError(err);
      const envHint =
        supabaseEnvIssues.length > 0 ? `\n\nVerifique o .env:\n- ${supabaseEnvIssues.join('\n- ')}` : '';
      setAuthError(`${base}${envHint}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterBasic = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        data: {
          nome: formData.name,
        },
      },
    });

    setIsSubmitting(false);

    if (error) {
      setAuthError(formatSupabaseError(error));
      return;
    }

    if (!data?.user) {
      setAuthSuccess(
        'Se o projeto pedir confirmação por email, verifique a caixa de entrada. Depois pode iniciar sessão aqui.'
      );
      setIsLogin(true);
      resetRegisterFlow();
      return;
    }

    setRegisteredUser(data.user);
    setRegisterStep('extras');
    setAuthSuccess('Conta criada com sucesso. Pode completar o perfil abaixo (opcional) ou ignorar.');
    onLogin(data.user, { closeModal: false });
  };

  const buildExtrasUpsertPayload = () => ({
    id: registeredUser.id,
    nome: formData.name,
    email: formData.email.trim().toLowerCase(),
    telefone: formData.phone || null,
    whatsapp: formData.whatsapp || null,
    localizacao: formData.localizacao || null,
    descricao_loja: formData.descricaoLoja || null,
    website: formData.website || null,
    tipo_perfil: formData.tipoPerfil,
    role: 'cliente',
  });

  const buildMinimalUpsertPayload = () => ({
    id: registeredUser.id,
    nome: formData.name,
    email: formData.email.trim().toLowerCase(),
    telefone: null,
    whatsapp: null,
    localizacao: null,
    descricao_loja: null,
    website: null,
    tipo_perfil: 'comprador',
    role: 'cliente',
  });

  const handleSaveExtras = async (e) => {
    e.preventDefault();
    if (!registeredUser) return;
    setAuthError('');
    setAuthSuccess('');
    setIsSubmitting(true);

    const { error } = await supabase.from('usuarios').upsert(buildExtrasUpsertPayload(), { onConflict: 'id' });

    setIsSubmitting(false);

    if (error) {
      setAuthError(`Não foi possível guardar o perfil: ${formatSupabaseError(error)}`);
      return;
    }

    setAuthSuccess('Perfil guardado com sucesso.');
    await new Promise((r) => setTimeout(r, 700));
    onLogin(registeredUser, { closeModal: true });
    setFormData(emptyForm());
    setAuthSuccess('');
    resetRegisterFlow();
    setIsLogin(true);
  };

  const handleSkipExtras = async () => {
    if (!registeredUser) return;
    setAuthError('');
    setAuthSuccess('');
    setIsSubmitting(true);

    const { error } = await supabase.from('usuarios').upsert(buildMinimalUpsertPayload(), { onConflict: 'id' });

    setIsSubmitting(false);

    if (error) {
      setAuthError(`Não foi possível criar o perfil mínimo: ${formatSupabaseError(error)}`);
      return;
    }

    setAuthSuccess('Pode utilizar a loja. Pode completar o perfil mais tarde nas definições.');
    await new Promise((r) => setTimeout(r, 700));
    onLogin(registeredUser, { closeModal: true });
    setFormData(emptyForm());
    setAuthSuccess('');
    resetRegisterFlow();
    setIsLogin(true);
  };

  const switchToRegister = () => {
    setAuthError('');
    setAuthSuccess('');
    setIsSubmitting(false);
    setShowPassword(false);
    setIsLogin(false);
    resetRegisterFlow();
    setFormData(emptyForm());
  };

  const switchToLogin = () => {
    setAuthError('');
    setAuthSuccess('');
    setIsSubmitting(false);
    setShowPassword(false);
    setIsLogin(true);
    resetRegisterFlow();
    setFormData(emptyForm());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative bg-white rounded-3xl shadow-soft-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                type="button"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isLogin ? 'Entrar' : registerStep === 'extras' ? 'Completar perfil' : 'Criar conta'}
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  {isLogin
                    ? 'Email e palavra-passe para aceder à sua conta.'
                    : registerStep === 'extras'
                      ? 'Estes dados são opcionais e não impedem o registo.'
                      : 'Indique nome, email e palavra-passe para criar a conta.'}
                </p>

                {supabaseEnvIssues.length > 0 && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                    <p className="font-semibold mb-1">Configuração Supabase (VITE_*)</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {supabaseEnvIssues.map((msg) => (
                        <li key={msg}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {authSuccess && (
                  <div
                    role="status"
                    className="mb-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs sm:text-sm text-green-900 whitespace-pre-wrap break-words"
                  >
                    {authSuccess}
                  </div>
                )}

                {authError && (
                  <div
                    role="alert"
                    className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs sm:text-sm text-red-800 whitespace-pre-wrap break-words"
                  >
                    {authError}
                  </div>
                )}

                {isLogin && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Palavra-passe</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          autoComplete="current-password"
                          className="w-full px-4 py-2 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm"
                          placeholder="A sua palavra-passe"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg text-lg text-gray-600 hover:bg-gray-100"
                          aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                          aria-pressed={showPassword}
                        >
                          👁
                        </button>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm sm:text-base transition-all hover:bg-blue-700 disabled:opacity-60"
                    >
                      {isSubmitting ? 'A entrar...' : 'Entrar'}
                    </motion.button>
                  </form>
                )}

                {!isLogin && registerStep === 'basic' && (
                  <form onSubmit={handleRegisterBasic} className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Nome</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        autoComplete="name"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm"
                        placeholder="O seu nome"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Palavra-passe</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          autoComplete="new-password"
                          className="w-full px-4 py-2 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm"
                          placeholder="Crie uma palavra-passe"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg text-lg text-gray-600 hover:bg-gray-100"
                          aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                          aria-pressed={showPassword}
                        >
                          👁
                        </button>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm sm:text-base transition-all hover:bg-blue-700 disabled:opacity-60"
                    >
                      {isSubmitting ? 'A criar conta...' : 'Criar conta'}
                    </motion.button>
                  </form>
                )}

                {!isLogin && registerStep === 'extras' && (
                  <form onSubmit={handleSaveExtras} className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">Tipo de perfil</label>
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, tipoPerfil: 'vendedor' }))}
                          className={`w-full rounded-xl border-2 p-4 text-left transition ${
                            formData.tipoPerfil === 'vendedor' ? 'border-primary bg-blue-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <p className="font-bold text-sm text-gray-900">Vendedor / Prestador de serviços</p>
                          <p className="text-xs text-gray-600 mt-1">Publicar produtos e serviços.</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, tipoPerfil: 'comprador' }))}
                          className={`w-full rounded-xl border-2 p-4 text-left transition ${
                            formData.tipoPerfil === 'comprador' ? 'border-primary bg-blue-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <p className="font-bold text-sm text-gray-900">Comprador</p>
                          <p className="text-xs text-gray-600 mt-1">Comprar e solicitar serviços.</p>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Telefone (opcional)</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm"
                        placeholder="+244 9XX XXX XXX"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">WhatsApp (opcional)</label>
                      <input
                        type="text"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm"
                        placeholder="2449XXXXXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Localização (opcional)</label>
                      <input
                        type="text"
                        name="localizacao"
                        value={formData.localizacao}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm"
                        placeholder="Luanda, Angola"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Website (opcional)</label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm"
                        placeholder="https://"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Descrição da loja (opcional)</label>
                      <textarea
                        name="descricaoLoja"
                        value={formData.descricaoLoja}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm"
                        placeholder="Breve descrição da sua actividade."
                      />
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm transition-all hover:bg-blue-700 disabled:opacity-60"
                      >
                        {isSubmitting ? 'A guardar...' : 'Guardar perfil e entrar'}
                      </motion.button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleSkipExtras}
                        className="w-full py-2.5 rounded-xl font-semibold text-sm text-gray-700 border-2 border-gray-200 hover:bg-gray-50 disabled:opacity-60"
                      >
                        Ignorar por agora
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-6 text-center">
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      type="button"
                      onClick={isLogin ? switchToRegister : switchToLogin}
                      className="text-primary font-bold hover:underline"
                    >
                      {isLogin ? 'Cadastre-se' : 'Iniciar sessão'}
                    </motion.button>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
