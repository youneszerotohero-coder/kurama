import { createContext, useContext, useState, useEffect, useLayoutEffect, useRef } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  // Starts empty (matches the prerendered HTML), then restores the saved cart before the first paint
  const [cartItems, setCartItems] = useState([])
  const restored = useRef(false)
  useLayoutEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kurama_cart') || '[]')
      if (Array.isArray(saved) && saved.length) setCartItems(saved)
    } catch (e) {
      console.warn('Saved cart could not be read', e)
    }
    restored.current = true
  }, [])

  const [isCartOpen, setIsCartOpen] = useState(false)

  // Sync to localStorage — skipping the very first pass, which still holds the empty initial state
  const synced = useRef(false)
  useEffect(() => {
    if (!restored.current) return
    if (!synced.current) {
      synced.current = true
      return
    }
    localStorage.setItem('kurama_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const [lastAdded, setLastAdded] = useState(null)

  // `open: true` shows the cart drawer; otherwise a small confirmation toast appears
  const addToCart = (product, quantity = 1, size = '', color = '', { open = false } = {}) => {
    const defaultColor = color || (product.colors && product.colors[0]?.name) || ''
    
    // Get size name string for defaultSize lookup
    let defaultSize = ''
    if (size) {
      defaultSize = typeof size === 'object' ? size.name : size
    } else if (product.sizes && product.sizes.length > 0) {
      const firstSize = product.sizes[0]
      defaultSize = typeof firstSize === 'object' ? firstSize.name : firstSize
    }

    // Create unique key for the specific product variation
    const cartItemId = `${product.id}-${defaultSize}-${defaultColor}`
    
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.cartItemId === cartItemId)
      
      let originalSizePrice = typeof product.price === 'string' 
        ? parseFloat(product.price.replace(/,/g, '')) 
        : (product.priceSold !== undefined ? Number(product.priceSold) : Number(product.price || 0))

      if (Array.isArray(product.sizes)) {
        const matched = product.sizes.find(s => s && (s.name === defaultSize || s === defaultSize))
        if (matched && typeof matched === 'object' && matched.priceSold !== undefined) {
          originalSizePrice = Number(matched.priceSold)
        }
      }

      const promoPercent = Number(product.promotionPercentage || 0)
      const discountedPrice = promoPercent > 0 ? (originalSizePrice * (1 - promoPercent / 100)) : originalSizePrice

      const productImage = product.image || (product.images && product.images[0]) || '/img/bundle-480.webp'

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        return prevItems.map((item, i) => (i === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item))
      } else {
        // New item
        return [
          ...prevItems,
          {
            cartItemId,
            id: product.id,
            ref: product.ref,
            name: product.name,
            price: discountedPrice,
            priceOriginal: originalSizePrice,
            promotionPercentage: promoPercent,
            image: productImage,
            category: product.category,
            size: defaultSize,
            color: defaultColor,
            quantity: quantity,
            sizes: product.sizes || [],
            colors: product.colors || []
          },
        ]
      }
    })
    
    if (open) setIsCartOpen(true)
    else setLastAdded({ key: Date.now(), name: product.name, image: product.image || (product.images && product.images[0]) || '', quantity })
  }

  const removeFromCart = (cartItemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartItemId !== cartItemId))
  }

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
      return
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    )
  }

  const updateCartItemSpecs = (cartItemId, newSize, newColor) => {
    setCartItems((prevItems) => {
      const itemIndex = prevItems.findIndex((item) => item.cartItemId === cartItemId)
      if (itemIndex === -1) return prevItems

      const item = prevItems[itemIndex]
      const targetSize = newSize !== undefined ? newSize : item.size
      const targetColor = newColor !== undefined ? newColor : item.color

      // Find the price for the new size
      let originalSizePrice = item.priceOriginal || item.price
      if (Array.isArray(item.sizes) && item.sizes.length > 0) {
        const matched = item.sizes.find(s => {
          if (!s) return false
          if (typeof s === 'object') return s.name === targetSize
          return s === targetSize
        })
        if (matched && typeof matched === 'object' && matched.priceSold !== undefined) {
          originalSizePrice = Number(matched.priceSold)
        }
      }

      const promoPercent = Number(item.promotionPercentage || 0)
      const discountedPrice = promoPercent > 0 ? (originalSizePrice * (1 - promoPercent / 100)) : originalSizePrice

      // Generate the new cartItemId
      const newCartItemId = `${item.id}-${targetSize}-${targetColor}`

      // Check if another item with newCartItemId already exists in the cart (other than this one)
      const existingIndex = prevItems.findIndex((x) => x.cartItemId === newCartItemId)

      const newItems = [...prevItems]

      if (existingIndex > -1 && existingIndex !== itemIndex) {
        // Merge quantity with the existing item
        newItems[existingIndex] = { ...newItems[existingIndex], quantity: newItems[existingIndex].quantity + item.quantity }
        // Remove the item being updated
        newItems.splice(itemIndex, 1)
      } else {
        // Update this item in place
        newItems[itemIndex] = {
          ...item,
          cartItemId: newCartItemId,
          size: targetSize,
          color: targetColor,
          price: discountedPrice,
          priceOriginal: originalSizePrice
        }
      }
      return newItems
    })
  }

  const clearCart = () => {
    setCartItems([])
  }

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCartItemSpecs,
        clearCart,
        cartCount,
        cartTotal,
        lastAdded,
        dismissLastAdded: () => setLastAdded(null),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
