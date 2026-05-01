import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadProductImageFiles } from './utils/uploadProductImage'; // Assuming this utility exists

export default function EditProductModal({ isOpen, onClose, product, onUpdateProduct }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    preco_original: '',
    categoria: 'produtos',
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const fileInputRef = useRef(null);

  const allowedCategories = ['produtos', 'websites', 'personalizacao', 'servicos', 'camisetas'];

  useEffect(() => {
    if (product) {
      setFormData({
        nome: product.name || '',
        descricao: product.description || '',
        preco: product.price || '',
        preco_original: product.original_price || '',
        categoria: product.category || 'produtos',
      });
      // Initialize image previews if product has images
      if (product.images && product.images.length > 0) {
        setImagePreviews(product.images);
      } else if (product.image) { // Fallback for single image
        setImagePreviews([product.image]);
      } else {
        setImagePreviews([]);
      }
      setSelectedImageFiles([]);
    }
  }, [product]);

  useEffect(() => {
    return () => {
      // Clean up object URLs when component unmounts or imagePreviews change
      imagePreviews.forEach((previewUrl) => {
        if (previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
      });
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

    // Revoke old blob URLs before creating new ones
    imagePreviews.forEach((previewUrl) => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    });
    setSelectedImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const clearImageSelection = () => {
    imagePreviews.forEach((previewUrl) => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      } 
    });
    setSelectedImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let updatedImageUrls = product.images || (product.image ? [product.image] : []);

      if (selectedImageFiles.length > 0) {
        // Upload new images if selected
        const newImageUrls = await uploadProductImageFiles(selectedImageFiles, product.user_id);
        updatedImageUrls = newImageUrls;
      } else if (imagePreviews.length === 0 && (product.images || product.image)) {
        // If no new images are selected and existing images are cleared
        updatedImageUrls = [];
      }

      await onUpdateProduct(product.id, {
        ...formData,
        preco: Number(formData.preco),
        preco_original: formData.preco_original ? Number(formData.preco_original) : Number(formData.preco),
        imagem_url: updatedImageUrls[0] || null, // For backward compatibility if single image is expected
        imagens: updatedImageUrls,
      });
      onClose(); // Close modal on successful update
    } catch (err) {
      console.error(err);
      alert(err?.message ?? 'Não foi possível atualizar o produto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col self-center overflow-hidden rounded-3xl bg-white shadow-soft-lg"
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
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Editar Produto</h2>
              <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
                Ajuste os detalhes do seu produto
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input name="nome" value={formData.nome} onChange={handleChange} required placeholder="Nome do produto" className="w-full px-4 py-2 border rounded-lg text-sm" />
                  <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-sm">
                    <option value="produtos">Produtos</option>
                    <option value="websites">Websites</option>
                    <option value="personalizacao">Personalização</option>
                    <option value="servicos">Serviços</option>
                    <option value="camisetas">Camisetas</option>
                  </select>
                  <input type="number" min="0" step="0.01" name="preco" value={formData.preco} onChange={handleChange} required placeholder="Preço" className="w-full px-4 py-2 border rounded-lg text-sm" />
                  <input type="number" min="0" step="0.01" name="preco_original" value={formData.preco_original} onChange={handleChange} placeholder="Preço Original (Opcional)" className="w-full px-4 py-2 border rounded-lg text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Imagens do produto</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                  />
                  <p className="text-xs text-gray-500">Selecione novas imagens para substituir as existentes (JPEG, PNG, WebP ou GIF até 5 MB cada).</p>
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
                        Remover todas as imagens
                      </button>
                    </div>
                  )}
                </div>
                <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows="3" required placeholder="Descrição do produto" className="w-full px-4 py-2 border rounded-lg text-sm" />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100 sm:flex-none sm:px-6"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 sm:flex-none sm:px-6"
                  >
                    {isSubmitting ? 'A Guardar...' : 'Guardar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}