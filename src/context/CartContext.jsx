import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('kurama_cart')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error('Failed to parse cart items', e)
      return []
    }
  })
  
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kurama_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product, quantity = 1, size = '', color = '') => {
    const defaultColor = color || (product.colors && product.colors[0]?.name) || ''
    const defaultSize = size || (product.sizes && product.sizes[0]) || ''
    
    // Create unique key for the specific product variation
    const cartItemId = `${product.id}-${defaultSize}-${defaultColor}`
    
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.cartItemId === cartItemId)
      
      const productPrice = typeof product.price === 'string' 
        ? parseFloat(product.price.replace(/,/g, '')) 
        : product.price

      const productImage = product.image || (product.images && product.images[0]) || '/logo.png'

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const newItems = [...prevItems]
        newItems[existingItemIndex].quantity += quantity
        return newItems
      } else {
        // New item
        return [
          ...prevItems,
          {
            cartItemId,
            id: product.id,
            name: product.name,
            price: productPrice,
            image: productImage,
            category: product.category,
            size: defaultSize,
            color: defaultColor,
            quantity: quantity,
          },
        ]
      }
    })
    
    // Auto-open cart on add
    setIsCartOpen(true)
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
        clearCart,
        cartCount,
        cartTotal,
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
