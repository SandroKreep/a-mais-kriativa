import React from 'react';
import { motion } from 'framer-motion';
import { formatPriceKZA } from './utils/formatPrice';

export default function ProductCard({ product, onOpen }) {
  const original = Number(product.originalPrice) || 0;
  const price = Number(product.price) || 0;
  const discount =
    original > 0 && original > price ? Math.round(((original - price) / original) * 100) : 0;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onClick={() => onOpen(product)}
      className="bg-white rounded-2xl shadow-soft overflow-hidden cursor-pointer group h-full flex flex-col hover:shadow-soft-lg transition-shadow"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-40 sm:h-48 bg-gray-100">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm"
          >
            -{discount}%
          </motion.div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-white bg-opacity-90 text-gray-700 px-2 sm:px-3 py-1 rounded-full font-medium text-xs">
          {product.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2 sm:mb-3">
          <span className="text-xs text-gray-500 font-medium">Avaliação</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <motion.svg
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                  i < Math.round(product.rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                aria-hidden
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </motion.svg>
            ))}
          </div>
          <span className="text-xs text-gray-600 ml-1 sm:ml-2">({product.rating})</span>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-gray-900 text-sm sm:text-lg mb-2 sm:mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>

        {/* Pricing */}
        <div className="flex items-end gap-2 sm:gap-3 mb-3 sm:mb-4">
          <span className="text-lg sm:text-2xl font-bold text-primary">{formatPriceKZA(price)}</span>
          {original > price && (
            <span className="text-xs sm:text-sm text-gray-500 line-through">{formatPriceKZA(original)}</span>
          )}
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ backgroundColor: '#0052CC' }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-primary text-white py-2 sm:py-3 rounded-xl font-semibold text-xs sm:text-base transition-all"
        >
          Ver Detalhes
        </motion.button>
      </div>
    </motion.div>
  );
}
