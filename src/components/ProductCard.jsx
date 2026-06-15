import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useCart } from '@/context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function ProductCard({ product, index }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  // Make sure price formatting is clean and safe
  const formattedPrice = typeof product.price === 'number' ? product.price.toLocaleString() : product.price
  const formattedOriginalPrice = product.originalPrice 
    ? (typeof product.originalPrice === 'number' ? product.originalPrice.toLocaleString() : product.originalPrice)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative cursor-pointer flex flex-col h-full rounded-2xl border border-border/85 bg-background/50 hover:border-kurima-orange/60 hover:shadow-lg hover:shadow-kurima-orange/5 transition-all duration-300 overflow-hidden"
    >
      <div className="relative h-[200px] overflow-hidden bg-kurima-gray">
        <img
          src={product.image || (product.images && product.images[0])}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Basket button in the top right instead of wish list */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (product.inStock !== false) {
              addToCart(product, 1)
            }
          }}
          disabled={product.inStock === false}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:bg-kurima-orange hover:text-black transition-all cursor-pointer disabled:opacity-40 disabled:hover:bg-black/40 disabled:hover:text-white/70"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>

        {!product.inStock && product.inStock !== undefined && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-4 py-2 border border-red-500 text-red-500 font-extrabold text-[10px] uppercase tracking-widest rounded-lg">
              Backorder
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between p-5 bg-foreground/[0.015]">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-kurima-muted font-black tracking-wider uppercase">
              {typeof product.brand === 'object' && product.brand !== null ? (product.brand.name || 'Premium') : (product.brand || 'Premium')}
            </span>
            <span className="text-[10px] text-kurima-orange/80 font-bold uppercase tracking-widest">
              {typeof product.category === 'object' && product.category !== null 
                ? (t(product.category.name || '').split(' ')[0]) 
                : (t(product.category || '').split(' ')[0])}
            </span>
          </div>
          <h3 className="font-bold text-foreground text-sm mb-2 group-hover:text-kurima-orange transition-colors line-clamp-2">
            {product.name}
          </h3>
        </div>
        
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] text-kurima-muted font-black mb-0.5">
              Ref: {product.ref || `REF-P${product.id}`}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-black dark:text-kurima-orange font-black text-sm">
                {formattedPrice} DA
              </span>
              {formattedOriginalPrice && (
                <span className="text-foreground/45 line-through text-[10px] font-semibold">
                  {formattedOriginalPrice} DA
                </span>
              )}
            </div>
          </div>
          
          {/* Buy Button in the bottom right! */}
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              if (product.inStock !== false) {
                addToCart(product, 1)
              }
            }}
            disabled={product.inStock === false}
            className="bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold rounded-full px-4 text-[10px] h-8 cursor-pointer transition-all active:scale-95 disabled:opacity-40"
          >
            Buy
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
