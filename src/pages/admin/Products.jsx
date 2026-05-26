import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag,
  FolderTree,
  Tag,
  Plus,
  Edit3,
  Trash2,
  Search,
  Globe,
  TrendingUp,
  Layers,
  X,
  PlusCircle,
  BadgeAlert
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function Products() {
  // Nested Tabs inside products page
  // 'productsList' | 'categories' | 'brands'
  const [productTab, setProductTab] = useState('productsList')

  // Database states
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  // Modal control
  const [modalType, setModalType] = useState(null) // 'product' | 'category' | 'brand'
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [editId, setEditId] = useState(null)

  // Form Field States
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    priceBought: '',
    priceSold: '',
    promotionPercentage: '0',
    quantity: '',
    category: '',
    brand: '',
    image: '/product-1.png'
  })

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    parentCategory: ''
  })

  const [brandForm, setBrandForm] = useState({
    name: '',
    origin: ''
  })

  const [formErrors, setFormErrors] = useState({})

  // Load from LocalStorage
  useEffect(() => {
    // Categories
    const storedCats = localStorage.getItem('admin_categories')
    if (storedCats) setCategories(JSON.parse(storedCats))

    // Brands
    const storedBrands = localStorage.getItem('admin_brands')
    if (storedBrands) setBrands(JSON.parse(storedBrands))

    // Products
    const storedProds = localStorage.getItem('admin_products')
    if (storedProds) setProducts(JSON.parse(storedProds))
  }, [])

  // Deletion logic
  const handleDeleteItem = (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return

    if (type === 'product') {
      const filtered = products.filter(p => p.id !== id)
      setProducts(filtered)
      localStorage.setItem('admin_products', JSON.stringify(filtered))
    }
    if (type === 'category') {
      const filtered = categories.filter(c => c.id !== id)
      setCategories(filtered)
      localStorage.setItem('admin_categories', JSON.stringify(filtered))
    }
    if (type === 'brand') {
      const filtered = brands.filter(b => b.id !== id)
      setBrands(filtered)
      localStorage.setItem('admin_brands', JSON.stringify(filtered))
    }
  }

  // Modals opening logic
  const openAddModal = (type) => {
    setModalType(type)
    setModalMode('add')
    setEditId(null)
    setFormErrors({})

    if (type === 'product') {
      setProductForm({
        name: '',
        description: '',
        priceBought: '',
        priceSold: '',
        promotionPercentage: '0',
        quantity: '',
        category: categories[0]?.name || '',
        brand: brands[0]?.name || '',
        image: '/product-1.png'
      })
    }
    if (type === 'category') {
      setCategoryForm({
        name: '',
        parentCategory: ''
      })
    }
    if (type === 'brand') {
      setBrandForm({
        name: '',
        origin: ''
      })
    }
  }

  const openEditModal = (type, item) => {
    setModalType(type)
    setModalMode('edit')
    setEditId(item.id)
    setFormErrors({})

    if (type === 'product') {
      setProductForm({
        name: item.name,
        description: item.description,
        priceBought: item.priceBought,
        priceSold: item.priceSold,
        promotionPercentage: item.promotionPercentage,
        quantity: item.quantity,
        category: item.category,
        brand: item.brand,
        image: item.image
      })
    }
    if (type === 'category') {
      setCategoryForm({
        name: item.name,
        parentCategory: item.parentCategory
      })
    }
    if (type === 'brand') {
      setBrandForm({
        name: item.name,
        origin: item.origin
      })
    }
  }

  // Validations
  const validateFormFields = () => {
    const errors = {}
    if (modalType === 'product') {
      if (!productForm.name.trim()) errors.name = 'Product name is required.'
      if (!productForm.description.trim()) errors.description = 'Description is required.'
      if (!productForm.priceBought || parseFloat(productForm.priceBought) <= 0) {
        errors.priceBought = 'Please enter a valid buy price.'
      }
      if (!productForm.priceSold || parseFloat(productForm.priceSold) <= 0) {
        errors.priceSold = 'Please enter a valid sell price.'
      } else if (parseFloat(productForm.priceSold) < parseFloat(productForm.priceBought)) {
        errors.priceSold = 'Sell price cannot be less than buy price.'
      }
      if (parseFloat(productForm.promotionPercentage) < 0 || parseFloat(productForm.promotionPercentage) > 100) {
        errors.promotionPercentage = 'Promotion percentage must be between 0 and 100.'
      }
      if (productForm.quantity === '' || parseInt(productForm.quantity) < 0) {
        errors.quantity = 'Stock quantity cannot be empty or negative.'
      }
      if (!productForm.category) errors.category = 'Select a category.'
      if (!productForm.brand) errors.brand = 'Select a brand.'
    }

    if (modalType === 'category') {
      if (!categoryForm.name.trim()) errors.name = 'Category name is required.'
    }

    if (modalType === 'brand') {
      if (!brandForm.name.trim()) errors.name = 'Brand name is required.'
      if (!brandForm.origin.trim()) errors.origin = 'Country of origin is required.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle Save
  const handleSaveModal = (e) => {
    e.preventDefault()
    if (!validateFormFields()) return

    if (modalType === 'product') {
      let updatedProds = []
      if (modalMode === 'add') {
        const newProduct = {
          id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
          name: productForm.name,
          description: productForm.description,
          priceBought: parseFloat(productForm.priceBought),
          priceSold: parseFloat(productForm.priceSold),
          promotionPercentage: parseFloat(productForm.promotionPercentage || 0),
          quantity: parseInt(productForm.quantity),
          category: productForm.category,
          brand: productForm.brand,
          image: productForm.image || '/product-1.png'
        }
        updatedProds = [...products, newProduct]
      } else {
        updatedProds = products.map(p => {
          if (p.id === editId) {
            return {
              ...p,
              name: productForm.name,
              description: productForm.description,
              priceBought: parseFloat(productForm.priceBought),
              priceSold: parseFloat(productForm.priceSold),
              promotionPercentage: parseFloat(productForm.promotionPercentage || 0),
              quantity: parseInt(productForm.quantity),
              category: productForm.category,
              brand: productForm.brand,
              image: productForm.image
            }
          }
          return p
        })
      }
      setProducts(updatedProds)
      localStorage.setItem('admin_products', JSON.stringify(updatedProds))
    }

    if (modalType === 'category') {
      let updatedCats = []
      if (modalMode === 'add') {
        const newCat = {
          id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
          name: categoryForm.name,
          parentCategory: categoryForm.parentCategory
        }
        updatedCats = [...categories, newCat]
      } else {
        updatedCats = categories.map(c => {
          if (c.id === editId) {
            return {
              ...c,
              name: categoryForm.name,
              parentCategory: categoryForm.parentCategory
            }
          }
          return c
        })
      }
      setCategories(updatedCats)
      localStorage.setItem('admin_categories', JSON.stringify(updatedCats))
    }

    if (modalType === 'brand') {
      let updatedBrands = []
      if (modalMode === 'add') {
        const newBrand = {
          id: brands.length > 0 ? Math.max(...brands.map(b => b.id)) + 1 : 1,
          name: brandForm.name,
          origin: brandForm.origin
        }
        updatedBrands = [...brands, newBrand]
      } else {
        updatedBrands = brands.map(b => {
          if (b.id === editId) {
            return {
              ...b,
              name: brandForm.name,
              origin: brandForm.origin
            }
          }
          return b
        })
      }
      setBrands(updatedBrands)
      localStorage.setItem('admin_brands', JSON.stringify(updatedBrands))
    }

    // Reset and Close
    setModalType(null)
    setEditId(null)
    setFormErrors({})
  }

  // Profit calculations
  const calcProductMargins = () => {
    const bought = parseFloat(productForm.priceBought) || 0
    const sold = parseFloat(productForm.priceSold) || 0
    const promo = parseFloat(productForm.promotionPercentage) || 0
    
    if (bought <= 0 || sold <= 0) return { margin: 0, marginPercent: 0, roi: 0, finalPrice: 0 }
    
    const finalPrice = sold * (1 - promo / 100)
    const margin = finalPrice - bought
    const marginPercent = finalPrice > 0 ? (margin / finalPrice) * 100 : 0
    const roi = bought > 0 ? (margin / bought) * 100 : 0
    
    return {
      margin: Math.round(margin),
      marginPercent: Math.round(marginPercent),
      roi: Math.round(roi),
      finalPrice: Math.round(finalPrice)
    }
  }

  const calculatedMargins = calcProductMargins()

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 animate-fade-in-up"
    >
      {/* Product Tabs Header Controls */}
      <div className="flex border-b border-border gap-6 justify-between items-center flex-wrap">
        <div className="flex border-b-0 gap-6">
          {[
            { id: 'productsList', label: 'Products', count: products.length },
            { id: 'categories', label: 'Categories', count: categories.length },
            { id: 'brands', label: 'Brands', count: brands.length }
          ].map(tab => {
            const isActive = productTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setProductTab(tab.id)}
                className={`pb-4 text-xs sm:text-sm font-black uppercase tracking-widest transition-all relative cursor-pointer ${
                  isActive ? 'text-kurima-orange' : 'text-kurima-muted hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] bg-foreground/[0.05] text-foreground/60 font-semibold px-2 py-0.5 rounded-full ml-1.5">
                  {tab.count}
                </span>
                {isActive && (
                  <motion.div layoutId="adminProductTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-kurima-orange" />
                )}
              </button>
            )
          })}
        </div>

        <div className="pb-3 sm:pb-0">
          <Button
            onClick={() => {
              if (productTab === 'productsList') openAddModal('product')
              if (productTab === 'categories') openAddModal('category')
              if (productTab === 'brands') openAddModal('brand')
            }}
            className="bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold px-5 py-2.5 h-auto text-[10px] uppercase tracking-widest rounded-full cursor-pointer shadow-lg shadow-kurima-orange/5 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {productTab === 'productsList' && 'Add Product'}
              {productTab === 'categories' && 'Add Category'}
              {productTab === 'brands' && 'Add Brand'}
            </span>
          </Button>
        </div>
      </div>

      {/* TAB CONTENT: PRODUCTS LIST */}
      {productTab === 'productsList' && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
          {/* Table Toolbar */}
          <div className="p-5 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-kurima-muted text-left w-full sm:w-auto">Warehouse Inventory Showroom</span>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/45 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products by title..."
                className="w-full pl-10 pr-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-2xl text-xs font-semibold text-foreground placeholder-foreground/30 focus:outline-none focus:border-kurima-orange transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-foreground/[0.015] border-b border-border/50 text-[10px] font-black uppercase tracking-wider text-kurima-muted">
                  <th className="p-5">Product Info</th>
                  <th className="p-5">Category</th>
                  <th className="p-5">Brand</th>
                  <th className="p-5 text-right">Cost Price</th>
                  <th className="p-5 text-right">Sale Price</th>
                  <th className="p-5 text-center">Promo</th>
                  <th className="p-5 text-center">Final Price</th>
                  <th className="p-5 text-center">Stock Quantity</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-semibold text-foreground/80">
                {products.map(p => {
                  const isLowStock = p.quantity <= 10
                  const isPromo = p.promotionPercentage > 0
                  const discountedPrice = Math.round(p.priceSold * (1 - p.promotionPercentage / 100))
                  return (
                    <tr key={p.id} className="hover:bg-foreground/[0.005] transition-colors">
                      <td className="p-5">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-foreground/5 border border-border/40 shrink-0 flex items-center justify-center">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-bold text-foreground truncate max-w-[200px]">{p.name}</h5>
                            <p className="text-[10px] text-kurima-muted truncate max-w-[200px] mt-0.5">{p.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="bg-foreground/5 text-foreground/60 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-5 text-foreground">{p.brand}</td>
                      <td className="p-5 text-right text-kurima-muted font-mono">{p.priceBought.toLocaleString()} DA</td>
                      <td className="p-5 text-right font-mono">{p.priceSold.toLocaleString()} DA</td>
                      <td className="p-5 text-center font-mono">
                        {isPromo ? (
                          <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-bold">
                            -{p.promotionPercentage}%
                          </Badge>
                        ) : (
                          <span className="text-kurima-muted">-</span>
                        )}
                      </td>
                      <td className="p-5 text-center text-kurima-orange font-bold font-mono">
                        {discountedPrice.toLocaleString()} DA
                      </td>
                      <td className="p-5 text-center font-mono">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={isLowStock ? 'text-red-500 font-bold' : 'text-foreground'}>
                            {p.quantity} units
                          </span>
                          {/* Micro progress bar */}
                          <div className="w-16 h-1 bg-foreground/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                p.quantity === 0
                                  ? 'bg-red-500 w-0'
                                  : isLowStock
                                  ? 'bg-orange-500 w-[20%]'
                                  : 'bg-green-500 w-[80%]'
                              }`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal('product', p)}
                            className="p-2 bg-foreground/5 hover:bg-kurima-orange hover:text-black rounded-xl transition-all cursor-pointer text-foreground/60"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem('product', p.id)}
                            className="p-2 bg-foreground/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all cursor-pointer text-foreground/60"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CATEGORIES LIST */}
      {productTab === 'categories' && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-foreground/[0.015] border-b border-border/50 text-[10px] font-black uppercase tracking-wider text-kurima-muted">
                  <th className="p-5">Category Name</th>
                  <th className="p-5">Parent Category</th>
                  <th className="p-5 text-center">Total Products Linked</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-semibold text-foreground/80">
                {categories.map(c => {
                  const linkedCount = products.filter(p => p.category === c.name).length
                  return (
                    <tr key={c.id} className="hover:bg-foreground/[0.005] transition-colors">
                      <td className="p-5 font-bold text-foreground">{c.name}</td>
                      <td className="p-5 text-kurima-muted">
                        {c.parentCategory ? (
                          <span className="flex items-center gap-1 text-[11px]">
                            <FolderTree className="w-3.5 h-3.5 text-kurima-orange" />
                            {c.parentCategory}
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-kurima-muted/40">Top Level Category</span>
                        )}
                      </td>
                      <td className="p-5 text-center font-mono text-foreground/60">{linkedCount} items</td>
                      <td className="p-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal('category', c)}
                            className="p-2 bg-foreground/5 hover:bg-kurima-orange hover:text-black rounded-xl transition-all cursor-pointer text-foreground/60"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem('category', c.id)}
                            className="p-2 bg-foreground/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all cursor-pointer text-foreground/60"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BRANDS LIST */}
      {productTab === 'brands' && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-foreground/[0.015] border-b border-border/50 text-[10px] font-black uppercase tracking-wider text-kurima-muted">
                  <th className="p-5">Brand Name</th>
                  <th className="p-5">Country of Origin</th>
                  <th className="p-5 text-center">Total Products Linked</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-semibold text-foreground/80">
                {brands.map(b => {
                  const linkedCount = products.filter(p => p.brand === b.name).length
                  return (
                    <tr key={b.id} className="hover:bg-foreground/[0.005] transition-colors">
                      <td className="p-5 font-bold text-foreground flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-foreground/[0.03] border border-border/40 flex items-center justify-center text-[10px] font-black uppercase text-kurima-orange">
                          {b.name.slice(0,2)}
                        </div>
                        <span>{b.name}</span>
                      </td>
                      <td className="p-5 text-kurima-muted">
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-kurima-orange" />
                          {b.origin}
                        </span>
                      </td>
                      <td className="p-5 text-center font-mono text-foreground/60">{linkedCount} items</td>
                      <td className="p-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal('brand', b)}
                            className="p-2 bg-foreground/5 hover:bg-kurima-orange hover:text-black rounded-xl transition-all cursor-pointer text-foreground/60"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem('brand', b.id)}
                            className="p-2 bg-foreground/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all cursor-pointer text-foreground/60"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          DYNAMIC ADD / EDIT MODALS FOR PRODUCTS, CATEGORIES, BRANDS
          ───────────────────────────────────────────── */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[85vh] text-left"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalType(null)}
                className="absolute right-6 top-6 p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black uppercase tracking-tight text-foreground mb-4">
                {modalMode === 'add' ? 'Add New' : 'Edit Existing'} {modalType}
              </h3>

              <form onSubmit={handleSaveModal} className="space-y-4">
                {/* ── PRODUCT FORM FIELDS ── */}
                {modalType === 'product' && (
                  <div className="space-y-4 text-xs">
                    {/* Name */}
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Product Title *</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                        placeholder="Smart Circuit Breaker..."
                      />
                      {formErrors.name && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.name}</span>}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Description *</label>
                      <textarea
                        rows="2"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all resize-none"
                        placeholder="Provide details about specs, CE approvals..."
                      />
                      {formErrors.description && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.description}</span>}
                    </div>

                    {/* Row bought/sold/promo */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Price Bought (DA) *</label>
                        <input
                          type="number"
                          value={productForm.priceBought}
                          onChange={(e) => setProductForm({ ...productForm, priceBought: e.target.value })}
                          className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold font-mono text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                          placeholder="20000"
                        />
                        {formErrors.priceBought && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.priceBought}</span>}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Price Sold (DA) *</label>
                        <input
                          type="number"
                          value={productForm.priceSold}
                          onChange={(e) => setProductForm({ ...productForm, priceSold: e.target.value })}
                          className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold font-mono text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                          placeholder="30000"
                        />
                        {formErrors.priceSold && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.priceSold}</span>}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Promo (%)</label>
                        <input
                          type="number"
                          value={productForm.promotionPercentage}
                          onChange={(e) => setProductForm({ ...productForm, promotionPercentage: e.target.value })}
                          className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold font-mono text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                          placeholder="0"
                        />
                        {formErrors.promotionPercentage && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.promotionPercentage}</span>}
                      </div>
                    </div>

                    {/* LIVE ROI / MARGINS CALCULATION PREVIEW PANEL */}
                    {parseFloat(productForm.priceBought) > 0 && parseFloat(productForm.priceSold) > 0 && (
                      <div className="bg-foreground/[0.02] border border-border/80 rounded-2xl p-4 grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-kurima-muted">Final Price Sold After Promo</span>
                          <p className="font-black text-kurima-orange text-sm font-mono">{calculatedMargins.finalPrice.toLocaleString()} DA</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-kurima-muted">Calculated Margins</span>
                          <p className="font-black text-foreground text-sm font-mono">
                            {calculatedMargins.margin.toLocaleString()} DA ({calculatedMargins.marginPercent}%)
                          </p>
                        </div>
                        <div className="space-y-1 col-span-2 border-t border-foreground/5 pt-2">
                          <span className="text-[8px] font-black uppercase text-kurima-muted">Estimated Return on Investment (ROI)</span>
                          <p className={`font-black text-xs uppercase tracking-wider flex items-center gap-1 ${calculatedMargins.roi > 40 ? 'text-green-500' : 'text-foreground'}`}>
                            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                            <span>{calculatedMargins.roi}% gain margin on wholesale bought asset</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Quantity & Image link */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Stock Quantity *</label>
                        <input
                          type="number"
                          value={productForm.quantity}
                          onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                          className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold font-mono text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                          placeholder="24"
                        />
                        {formErrors.quantity && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.quantity}</span>}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Image Endpoint URI</label>
                        <select
                          value={productForm.image}
                          onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                          className="w-full appearance-none px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange cursor-pointer"
                        >
                          <option value="/product-1.png">/product-1.png (Smart Breaker)</option>
                          <option value="/product-2.png">/product-2.png (Monitor)</option>
                          <option value="/product-3.png">/product-3.png (Heavy Cables)</option>
                          <option value="/product-4.png">/product-4.png (Wall Switch)</option>
                          <option value="/bg1.jpg">/bg1.jpg (Inverters)</option>
                          <option value="/bg2.jpg">/bg2.jpg (Batteries)</option>
                        </select>
                      </div>
                    </div>

                    {/* Brand / Category selectors */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Linked Category *</label>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange cursor-pointer"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Linked Brand *</label>
                        <select
                          value={productForm.brand}
                          onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                          className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange cursor-pointer"
                        >
                          {brands.map(b => (
                            <option key={b.id} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── CATEGORY FORM FIELDS ── */}
                {modalType === 'category' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Category Name *</label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                        placeholder="e.g. Copper wire roll, Breakers"
                      />
                      {formErrors.name && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.name}</span>}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Parent Category selection</label>
                      <select
                        value={categoryForm.parentCategory}
                        onChange={(e) => setCategoryForm({ ...categoryForm, parentCategory: e.target.value })}
                        className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange cursor-pointer"
                      >
                        <option value="">None (Top Level Category)</option>
                        {categories
                          .filter(c => c.id !== editId && !c.parentCategory) // Avoid nesting too deep
                          .map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* ── BRAND FORM FIELDS ── */}
                {modalType === 'brand' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Brand Name *</label>
                      <input
                        type="text"
                        value={brandForm.name}
                        onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                        placeholder="Siemens, Legrand..."
                      />
                      {formErrors.name && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.name}</span>}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Country of Origin *</label>
                      <input
                        type="text"
                        value={brandForm.origin}
                        onChange={(e) => setBrandForm({ ...brandForm, origin: e.target.value })}
                        className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                        placeholder="Germany, France, Swiss..."
                      />
                      {formErrors.origin && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.origin}</span>}
                    </div>
                  </div>
                )}

                {/* Footer buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-foreground/5">
                  <Button
                    type="button"
                    onClick={() => setModalType(null)}
                    variant="outline"
                    className="border-white/10 text-white rounded-full px-6 py-2.5 h-auto text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold px-6 py-2.5 h-auto text-[10px] uppercase tracking-widest rounded-full cursor-pointer shadow-lg shadow-kurima-orange/5"
                  >
                    {modalMode === 'add' ? 'Create Entity' : 'Update Entity'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
