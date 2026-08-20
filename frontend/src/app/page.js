"use client";

import { useState } from "react";
import { ShoppingBag, Search, Heart, Filter, ArrowRight } from "lucide-react";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Barchasi");

  const categories = ["Barchasi", "Erkaklar", "Ayollar", "Bolalar", "Aksessuar"];
  
  const products = [
    {
      id: 1,
      title: "Premium Qishki Kurtka",
      price_usd: 45,
      price_uzs: 585000,
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
      category: "Erkaklar",
      isNew: true,
    },
    {
      id: 2,
      title: "Kuzgi Krossovka Nike",
      price_usd: 30,
      price_uzs: 390000,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      category: "Ayollar",
      isNew: false,
    },
    {
      id: 3,
      title: "Bolalar Qalin Jemperi",
      price_usd: 20,
      price_uzs: 260000,
      image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&q=80",
      category: "Bolalar",
      isNew: true,
    },
    {
      id: 4,
      title: "Charm Ryukzak",
      price_usd: 25,
      price_uzs: 325000,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
      category: "Aksessuar",
      isNew: false,
    }
  ];

  const filteredProducts = activeCategory === "Barchasi" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans selection:bg-black selection:text-white">
      
      {/* Glassmorphism Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-gray-200/50 px-5 py-4 flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 leading-none">Do'kon</h1>
          <p className="text-xs font-medium text-gray-500 mt-1">Xitoydan to'g'ridan-to'g'ri</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full bg-gray-100/80 hover:bg-gray-200 active:scale-95 transition-all text-gray-700">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Category Pills with Smooth Scroll */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Kategoriyalar</h2>
          <button className="p-1.5 rounded-lg bg-white border border-gray-200 shadow-sm text-gray-600 hover:bg-gray-50 active:scale-95 transition-all">
            <Filter className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat 
                  ? "bg-black text-white shadow-md shadow-gray-400/30 transform scale-105" 
                  : "bg-white text-gray-600 border border-gray-100 shadow-sm hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid - Modern Aspect Ratio & Shadows */}
      <div className="px-5 mt-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
              
              {/* Image Container */}
              <div className="relative aspect-[4/5] w-full bg-gray-50 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                
                {/* Badges */}
                {product.isNew && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Yangi
                  </div>
                )}
                
                {/* Like Button */}
                <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white active:scale-90 transition-all shadow-sm">
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                  {product.title}
                </h3>
                <p className="text-[11px] font-medium text-gray-500 mb-3">{product.category}</p>
                
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <p className="text-lg font-black text-gray-900 tracking-tight">${product.price_usd}</p>
                    <p className="text-[10px] font-semibold text-gray-400 line-through mt-0.5">{product.price_uzs.toLocaleString()} so'm</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 active:scale-90 transition-all shadow-md shadow-gray-300">
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Checkout Action Bar (Glassmorphism + Gradient) */}
      <div className="fixed bottom-6 left-5 right-5 bg-black/95 backdrop-blur-xl rounded-3xl p-2 shadow-2xl shadow-gray-400/40 border border-gray-800/50 flex justify-between items-center z-50">
        <div className="flex items-center gap-3 pl-4 py-2">
          <div className="relative">
            <ShoppingBag className="w-6 h-6 text-white/90" />
            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-black">
              2
            </span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Jami summa</p>
            <p className="text-base font-bold text-white">$65.00</p>
          </div>
        </div>
        <button className="bg-white text-black px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-gray-100 active:scale-95 transition-all">
          Xarid qilish
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
