import React from 'react';
import { motion } from 'framer-motion';

export default function SearchBar({ searchTerm, setSearchTerm, onCategoryChange, categories, selectedCategory }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mb-8 sm:mb-12"
    >
      <div className="bg-white rounded-2xl shadow-soft-md p-4 sm:p-6 md:p-8">
        {/* Search Input */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-primary transition-colors text-sm sm:text-base text-gray-800 placeholder-gray-400"
            />
            <motion.svg
              whileHover={{ scale: 1.1 }}
              className="absolute right-4 top-3 sm:top-4 w-5 h-5 sm:w-6 sm:h-6 text-gray-400 cursor-pointer"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </motion.svg>
          </div>
          {searchTerm && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Buscando por: "<span className="font-semibold">{searchTerm}</span>"
            </p>
          )}
        </div>

        {/* Category Filter */}
        <div>
          <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Categorias</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCategoryChange(category)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                  category === selectedCategory
                    ? 'bg-primary text-white shadow-soft-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
