import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPriceKZA } from './utils/formatPrice';

export default function ProductModal({ product, isOpen, onClose, onAddToCart, onConfirmOrder }) {
  if (!product) return null;

  const original = Number(product.originalPrice) || 0;
  const price = Number(product.price) || 0;
  const discount =
    original > 0 && original > price ? Math.round(((original - price) / original) * 100) : 0;
  const whatsappNumber = (product.whatsapp || '').replace(/\D/g, '');
  const whatsappMessage = `Olá! Tenho interesse no produto "${product.name}" por ${formatPriceKZA(price)}.`;
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-soft-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Image */}
              <div className="relative h-48 sm:h-96 bg-gray-100 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {discount > 0 && (
                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-red-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-sm sm:text-lg">
                    -{discount}%
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 sm:p-8">
                {/* Category */}
                <div className="inline-block bg-blue-100 text-primary px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold mb-4">
                  {product.category}
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          i < Math.round(product.rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600 font-semibold text-sm sm:text-base">
                    Avaliação: {product.rating} / 5
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm sm:text-lg mb-6 sm:mb-8 leading-relaxed">
                  {product.description}
                </p>

                {/* Pricing Section */}
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                  <p className="text-gray-600 text-xs sm:text-sm mb-2">Preço</p>
                  <div className="flex items-baseline gap-2 sm:gap-4 flex-wrap">
                    <span className="text-2xl sm:text-4xl font-bold text-primary">{formatPriceKZA(price)}</span>
                    {original > price && (
                      <span className="text-lg sm:text-xl text-gray-500 line-through">{formatPriceKZA(original)}</span>
                    )}
                  </div>
                  {discount > 0 && (
                    <p className="text-green-600 font-semibold mt-3 text-sm sm:text-base">
                      Poupa {formatPriceKZA(original - price)}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAddToCart(product)}
                    className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm sm:text-lg transition-all"
                  >
                    Adicionar ao Carrinho
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onConfirmOrder}
                    className="flex-1 border-2 border-primary text-primary py-3 rounded-xl font-bold text-sm sm:text-lg hover:bg-blue-50 transition-all"
                  >
                    Confirmar Pedido
                  </motion.button>
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
                  <h3 className="font-bold text-gray-900 mb-2">Contacto do Vendedor</h3>
                  <p className="text-gray-700">Email: {product.email || 'Não informado'}</p>
                  <p className="text-gray-700">Telefone: {product.telefone || 'Não informado'}</p>
                  <p className="text-gray-700">Localização: {product.localizacao || 'Não informada'}</p>
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 transition"
                    >
                      Comprar pelo WhatsApp
                    </a>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">Por que escolher este produto?</h3>
                  <ul className="space-y-2 sm:space-y-3 text-gray-700 text-xs sm:text-base">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Melhor preço garantido no comparador</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Frete gratuito para pedidos acima de 50.000 KZA</span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Garantia de compatibilidade de 30 dias</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
