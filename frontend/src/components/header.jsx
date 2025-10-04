// frontend/src/components/header.jsx
import React, { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <img
                  src="./logo.svg"
                  alt="Planora Logo"
                  className="h-[40px] w-auto object-contain"
                />
              </div>
              <span className="text-xl font-bold">Planora</span>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium">Features</a>
            <a href="#about" className="text-gray-700 hover:text-indigo-600 font-medium">About</a>
            <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 font-medium">Testimonials</a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <a href="/login" className="text-gray-700 hover:text-indigo-600 font-medium">Login</a>
            <a href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">Get Started</a>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">Features</a>
            <a href="#about" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">About</a>
            <a href="#testimonials" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">Testimonials</a>
            <a href="/login" className="block w-full text-left px-3 py-2 text-gray-700 hover:text-indigo-600">Login</a>
            <a href="/signup" className="block w-full text-left px-3 py-2 bg-indigo-600 text-white rounded-lg mt-2">Get Started</a>
          </div>
        </div>
      )}
    </header>
  );
}