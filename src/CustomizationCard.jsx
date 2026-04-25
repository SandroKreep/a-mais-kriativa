import React from 'react';
import { motion } from 'framer-motion';

export default function CustomizationCard({ product, onOpen }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onClick={() => onOpen(product)}
      className="bg-white rounded-2xl shadow-soft overflow-hidden cursor-pointer group h-full flex flex-col hover:shadow-soft-lg transition-shadow"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-48 sm:h-56 bg-gray-100">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
          Personalizar
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-600 mb-4 flex-grow line-clamp-2">
          {product.description}
        </p>

        {/* Customization Options */}
        <div className="mb-4 space-y-1">
          {product.customizations.map((customization, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.002v.946h.5A2.066 2.066 0 0120 9.001v7a2 2 0 01-2 2H2a2 2 0 01-2-2V9v-.954c0-1.596 1.215-2.969 2.812-3.002a3.066 3.066 0 001.745-.723 3.066 3.066 0 003.976 0zm6.75 13.5H2.5v-7h12v7z" clipRule="evenodd" />
              </svg>
              <span className="line-clamp-1">{customization}</span>
            </div>
          ))}
        </div>

        {/* Lead Time & Min Order */}
        <div className="mb-4 space-y-1 bg-purple-50 p-3 rounded">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>📅 Prazo:</span>
            <span className="font-semibold text-gray-900">{product.leadTime}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>📦 Pedido mínimo:</span>
            <span className="font-semibold text-gray-900">{product.minOrder} un.</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${
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
          <span className="text-xs text-gray-600">({product.rating})</span>
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex flex-col">
            <span className="text-xs text-gray-600">Preço base:</span>
            <span className="text-lg sm:text-xl font-bold text-purple-600">
              {product.basePrice.toLocaleString()} KZA
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-purple-500 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all hover:bg-purple-700"
          >
            Customizar
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
