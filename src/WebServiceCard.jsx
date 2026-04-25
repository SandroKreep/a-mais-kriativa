import React from 'react';
import { motion } from 'framer-motion';

export default function WebServiceCard({ service, product, onOpen }) {
  const item = service || product;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onClick={() => onOpen(item)}
      className="bg-white rounded-2xl shadow-soft overflow-hidden cursor-pointer group h-full flex flex-col hover:shadow-soft-lg transition-shadow"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-48 sm:h-56 bg-gradient-to-br from-primary/10 to-blue-100">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        {/* Type Badge */}
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="inline-block bg-blue-100 text-primary px-3 py-1 rounded-full text-xs font-semibold">
            {item.type === 'simple' && 'Site Simples'}
            {item.type === 'intermediate' && 'Site Intermediário'}
            {item.type === 'ecommerce-simple' && 'E-commerce'}
            {item.type === 'ecommerce-complex' && 'E-commerce Avançado'}
            {item.type === 'portal' && 'Portal'}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-600 mb-4 flex-grow line-clamp-2">
          {item.description}
        </p>

        {/* Features */}
        <div className="mb-4 space-y-1">
          {item.features.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="line-clamp-1">{feature}</span>
            </div>
          ))}
        </div>

        {/* Delivery Time */}
        <div className="mb-4 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Entrega: {item.deliveryTime}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                  i < Math.round(item.rating)
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
          <span className="text-xs text-gray-600">({item.rating})</span>
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex flex-col">
            <span className="text-xs text-gray-600">A partir de:</span>
            <span className="text-lg sm:text-xl font-bold text-primary">
              {item.price.toLocaleString()} KZA
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all hover:bg-blue-700"
          >
            Solicitar
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
