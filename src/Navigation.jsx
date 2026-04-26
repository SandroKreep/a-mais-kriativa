import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Navigation({ categories, selectedCategory, onCategoryChange, onLoginClick, user, userProfile, canAccessSellerDashboard = false, onLogoutClick, cartCount = 0, onSellerDashboardClick, onCartClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-dark text-white shadow-soft-lg sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-lg"
            />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">A+ Kriativa</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 flex-1 mx-8">
            <div className="flex gap-2 lg:gap-4">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onCategoryChange(category)}
                  className={`px-3 lg:px-4 py-1.5 rounded-lg font-medium text-xs lg:text-sm transition-all ${
                    category === selectedCategory
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            <motion.button
              type="button"
              aria-label="Abrir carrinho"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCartClick}
              className="relative p-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4M9 5h6"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-0.5 rounded-full bg-primary text-[10px] flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </motion.button>
            {user ? (
              <>
                {canAccessSellerDashboard && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onSellerDashboardClick}
                    className="hidden sm:block px-3 lg:px-4 py-2 bg-primary text-white rounded-lg font-semibold text-xs lg:text-sm hover:bg-blue-700 transition-all"
                  >
                    Painel do Vendedor
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogoutClick}
                  className="px-3 lg:px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold text-xs lg:text-sm hover:bg-gray-600 transition-all"
                >
                  Sair
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLoginClick}
                className="px-3 lg:px-4 py-2 bg-primary text-white rounded-lg font-semibold text-xs lg:text-sm hover:bg-blue-700 transition-all"
              >
                Entrar
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4 border-t border-gray-700"
          >
            <div className="flex flex-col gap-2 mt-4">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    onCategoryChange(category);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all text-left ${
                    category === selectedCategory
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
              <div className="px-4 py-2 text-xs text-gray-300">
                Carrinho: {cartCount}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  onCartClick();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold text-sm hover:bg-gray-700 transition-all"
              >
                Abrir Carrinho
              </motion.button>
              {canAccessSellerDashboard && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    onSellerDashboardClick();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all"
                >
                  Painel do Vendedor
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
