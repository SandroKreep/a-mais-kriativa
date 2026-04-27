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
      <div className="relative overflow-hidden h-32 sm:h-40 lg:h-48 bg-gray-100">
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
            className="absolute top-1 sm:top-2 lg:top-4 right-1 sm:right-2 lg:right-4 bg-red-500 text-white px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full font-bold text-xs"
          >
            -{discount}%
          </motion.div>
        )}

        {/* Category Badge */}
        <div className="absolute top-1 sm:top-2 lg:top-4 left-1 sm:left-2 lg:left-4 bg-white bg-opacity-90 text-gray-700 px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full font-medium text-xs">
          {product.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-4 lg:p-5 flex flex-col flex-grow">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-1 sm:mb-2 lg:mb-3">
          <span className="text-xs text-gray-500 font-medium">Avaliação</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <motion.svg
                key={i}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 ${
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
          <span className="text-xs text-gray-600 ml-0.5 sm:ml-1 lg:ml-2">({product.rating})</span>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-gray-900 text-xs sm:text-sm lg:text-lg mb-1 sm:mb-2 lg:mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-600 mb-2 sm:mb-3 lg:mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>

        {/* Pricing */}
        <div className="flex items-end gap-1 sm:gap-2 lg:gap-3 mb-2 sm:mb-3 lg:mb-4">
          <span className="text-base sm:text-lg lg:text-2xl font-bold text-primary">{formatPriceKZA(price)}</span>
          {original > price && (
            <span className="text-xs text-gray-500 line-through">{formatPriceKZA(original)}</span>
          )}
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ backgroundColor: '#0052CC' }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-primary text-white py-1.5 sm:py-2 lg:py-3 rounded-xl font-semibold text-xs sm:text-sm lg:text-base transition-all"
        >
          Ver Detalhes
        </motion.button>
      </div>
    </motion.div>
  );
}
