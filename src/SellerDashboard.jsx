import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { formatPriceKZA } from './utils/formatPrice';
import { uploadProductImageFiles } from './utils/uploadProductImage';

export default function SellerDashboard({
  authUserId,
  userProfile,
  userProducts,
  onClose,
  onCreateProduct,
  onDeleteProduct,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: 'produtos',
  });

  useEffect(() => {
    return () => {
      imagePreviews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, [imagePreviews]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const hasInvalid = files.some((file) => !file.type.startsWith('image/'));
    if (hasInvalid) {
      alert('Todos os ficheiros selecionados devem ser imagens.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    imagePreviews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    setSelectedImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const clearImageSelection = () => {
    imagePreviews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    setSelectedImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    if (!authUserId) {
      alert('Sessão inválida. Inicie sessão novamente.');
      return;
    }
    if (!selectedImageFiles.length) {
      alert('Selecione pelo menos uma imagem do produto.');
      return;
    }

    setIsSubmitting(true);
    try {
      const imagens = await uploadProductImageFiles(selectedImageFiles, authUserId);
      await onCreateProduct({
        ...formData,
        preco: Number(formData.preco),
        imagem_url: imagens[0] || null,
        imagens,
      });
      setSuccessMessage('Produto publicado com sucesso!');
      setFormData((prev) => ({
        ...prev,
        nome: '',
        descricao: '',
        preco: '',
        categoria: 'produtos',
      }));
      clearImageSelection();
    } catch (err) {
      console.error(err);
      const msg = err?.message ?? 'Não foi possível guardar o produto. Tente novamente.';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    if (!product) return;
    const ok = window.confirm(`Remover o produto \"${product.name}\"? Esta ação não pode ser desfeita.`);
    if (!ok) return;

    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      await onDeleteProduct(product);
      setSuccessMessage('Produto removido com sucesso!');
    } catch (err) {
      console.error(err);
      alert(err?.message ?? 'Não foi possível remover o produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black bg-opacity-50 p-4 sm:items-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col self-center overflow-hidden rounded-3xl bg-white shadow-soft-lg"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          type="button"
          className="absolute right-3 top-3 z-20 rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200"
          aria-label="Fechar"
        >
          <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>

        <div className="shrink-0 border-b border-gray-100 bg-white px-4 py-3 pr-14 sm:px-6 sm:py-4 sm:pr-16">
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Adicionar Produto</h2>
          <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
            Painel de vendedor ·{' '}
            <span className="font-semibold text-primary">{userProfile?.nome || 'Vendedor'}</span>
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
          {successMessage && (
            <div
              role="status"
              className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900"
            >
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl">
              <div className="text-3xl font-bold text-primary mb-2">{userProducts.length}</div>
              <p className="text-sm text-gray-700">Produtos Listados</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl">
              <div className="text-sm font-semibold text-gray-700 mb-1">WhatsApp</div>
              <p className="text-xs text-gray-600 truncate">{userProfile?.whatsapp || '-'}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl">
              <div className="text-sm font-semibold text-gray-700 mb-1">Contacto:</div>
              <p className="text-xs text-gray-600 truncate">{userProfile?.telefone || '-'}</p>
              <p className="text-xs text-gray-600 truncate">{userProfile?.email || '-'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-2xl bg-gray-50 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input name="nome" value={formData.nome} onChange={handleChange} required placeholder="Nome do produto" className="w-full px-4 py-2 border rounded-lg text-sm" />
              <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-sm">
                <option value="produtos">Produtos</option>
                <option value="websites">Websites</option>
                <option value="personalizacao">Personalização</option>
                <option value="servicos">Serviços</option>
              </select>
              <input type="number" min="0" step="0.01" name="preco" value={formData.preco} onChange={handleChange} required placeholder="Preço" className="w-full px-4 py-2 border rounded-lg text-sm" />
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">Imagens do produto</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                />
                <p className="text-xs text-gray-500">Selecione várias imagens (JPEG, PNG, WebP ou GIF até 5 MB cada).</p>
                {imagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600 mb-1">Pré-visualização</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {imagePreviews.map((previewUrl, index) => (
                        <img
                          key={`${previewUrl}-${index}`}
                          src={previewUrl}
                          alt={`Pré-visualização ${index + 1}`}
                          className="h-24 w-full rounded-lg border border-gray-200 object-cover bg-gray-100"
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={clearImageSelection}
                      className="mt-2 text-xs text-red-600 underline hover:text-red-800"
                    >
                      Remover imagem
                    </button>
                  </div>
                )}
              </div>
            </div>
            <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows="3" required placeholder="Descrição do produto" className="w-full px-4 py-2 border rounded-lg text-sm" />
            <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-60">
              {isSubmitting ? 'A guardar...' : 'Publicar Produto'}
            </button>
          </form>

          {/* Products List */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Seus Produtos ({userProducts.length})
            </h3>

            {userProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200 hover:border-primary transition-colors"
                  >
                    {/* Product Image */}
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}

                    {/* Product Info */}
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-2 line-clamp-2">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Category and Price */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs bg-blue-100 text-primary px-2 py-1 rounded">
                        {product.category}
                      </span>
                      <span className="text-lg font-bold text-primary">{formatPriceKZA(product.price)}</span>
                    </div>

                    {/* Contacto */}
                    <div className="bg-white rounded-lg p-2 mb-3 text-xs space-y-1">
                      <p className="text-gray-600">
                        Tel: <span className="font-semibold">{product.telefone || '-'}</span>
                      </p>
                      <p className="text-gray-600">
                        Email: <span className="font-semibold truncate">{product.email || '-'}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={isSubmitting || !onDeleteProduct}
                        onClick={() => handleDelete(product)}
                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Remover
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <svg
                  className="mx-auto w-16 h-16 text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Nenhum produto ainda
                </h4>
                <p className="text-gray-600 text-sm mb-6">
                  Comece adicionando seu primeiro produto
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm inline-block hover:bg-blue-700 transition-all"
                >
                  Fechar
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
