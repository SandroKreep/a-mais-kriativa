import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabase';

export default function EditProductModal({ product, isOpen, onClose, onProductUpdate, user }) {
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    nome: product?.name || '',
    preco: product?.price || '',
    preco_original: product?.originalPrice || '',
    categoria: product?.rawCategory || product?.category || 'Produtos',
    descricao: product?.description || '',
    imagem_url: product?.image || '',
  });

  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(product?.image ? [product.image] : []);

  const categories = ['produtos', 'websites', 'personalizacao', 'servicos'];

  // Esconder mensagem de sucesso após 3 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Esconder mensagem de erro após 4 segundos
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setNewImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Converter categoria para minúsculas (formato esperado pelo banco)
      const categoriaNormalizada = formData.categoria.toLowerCase();

      // Atualizar produto no Supabase
      const updatePayload = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco),
        preco_original: parseFloat(formData.preco_original) || parseFloat(formData.preco),
        categoria: categoriaNormalizada,
        imagem_url: formData.imagem_url || product.image,
      };

      const { error: updateError } = await supabase
        .from('produtos')
        .update(updatePayload)
        .eq('id', product.sourceId)
        .eq('vendedor_id', user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Preparar dados atualizados
      const updatedProduct = {
        ...product,
        name: formData.nome,
        description: formData.descricao,
        price: parseFloat(formData.preco),
        originalPrice: parseFloat(formData.preco_original) || parseFloat(formData.preco),
        category: formData.categoria,
        rawCategory: categoriaNormalizada,
        image: formData.imagem_url || product.image,
      };

      onProductUpdate(updatedProduct);
      setSuccessMessage('Produto atualizado com sucesso!');
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      setErrorMessage('Erro ao atualizar produto: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Editar Produto</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-gray-600 text-sm mb-4">Ajuste os detalhes do seu produto</p>

            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome do Produto
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                placeholder="Ex: Cartier Panthère"
              />
            </div>

            {/* Categoria e Preço em uma linha */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preço (KZA)
                </label>
                <input
                  type="number"
                  name="preco"
                  value={formData.preco}
                  onChange={handleChange}
                  required
                  step="1000"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                  placeholder="72000"
                />
              </div>
            </div>

            {/* Preço Original */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preço Original (Opcional)
              </label>
              <input
                type="number"
                name="preco_original"
                value={formData.preco_original}
                onChange={handleChange}
                step="1000"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                placeholder="Deixe em branco se igual ao preço"
              />
            </div>

            {/* Imagens */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Imagens do produto
              </label>
              <div className="mb-3">
                <label className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-blue-700 transition text-sm font-semibold">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Escolher Ficheiros
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 mb-2">
                    Selecione novas imagens para substituir as existentes (JPEG, PNG, WebP ou GIF até 5 MB cada).
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Pré-visualização</p>
                    <div className="grid grid-cols-2 gap-2">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${idx}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    {newImages.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreviews([]);
                          setNewImages([]);
                        }}
                        className="text-xs text-red-600 hover:text-red-700 mt-2 font-semibold"
                      >
                        Remover todas as imagens
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                placeholder="Descreva seu produto em detalhes..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition ${
                  isSaving
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-blue-700'
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Salvando...
                  </>
                ) : (
                  'Guardar Alterações'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {/* Notificação de Sucesso */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 left-1/2 z-[60] max-w-sm"
          >
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-4 shadow-lg flex items-start gap-3">
              <div className="flex-shrink-0 pt-0.5">
                <svg className="w-5 h-5 text-green-600 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-green-800 text-sm">Sucesso!</p>
                <p className="text-green-700 text-xs mt-0.5">{successMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notificação de Erro */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 left-1/2 z-[60] max-w-sm"
          >
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-400 rounded-xl p-4 shadow-lg flex items-start gap-3">
              <div className="flex-shrink-0 pt-0.5">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-red-800 text-sm">Erro</p>
                <p className="text-red-700 text-xs mt-0.5">{errorMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
