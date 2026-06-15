import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
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
import api from '@/lib/api'

export default function Products() {
  // Nested Tabs inside products page
  // 'productsList' | 'categories' | 'brands' | 'gammes'
  const [productTab, setProductTab] = useState('productsList')

  // Database states
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [gammes, setGammes] = useState([])

  // Modal control
  const [modalType, setModalType] = useState(null) // 'product' | 'category' | 'brand' | 'gamme'
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [editId, setEditId] = useState(null)

  // Form Field States
  const [productForm, setProductForm] = useState({
    ref: '',
    name: '',
    description: '',
    priceBought: '',
    priceSold: '',
    promotionPercentage: '0',
    quantity: '',
    category: '',
    brand: '',
    gamme: '',
    images: ['/product-1.png'],
    sizes: '',
    colors: '',
    details: '',
    positives: '',
    negatives: ''
  })

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    parentCategory: '',
    image: ''
  })

  const [brandForm, setBrandForm] = useState({
    name: '',
    origin: '',
    image: ''
  })

  const [gammeForm, setGammeForm] = useState({
    name: '',
    brand: '',
    category: '',
    image: ''
  })

  const [formErrors, setFormErrors] = useState({})

  // Load from database API
  const loadData = async () => {
    try {
      const [prodsData, catsData, brandsData, gammesData] = await Promise.all([
        api.adminGetProducts(),
        api.getCategories(),
        api.getBrands(),
        api.getGammes()
      ]);

      const mappedProds = prodsData.map(p => ({
        ...p,
        priceBought: Number(p.priceBought),
        priceSold: Number(p.priceSold),
        category: p.category?.name || p.category,
        brand: p.brand?.name || p.brand,
        gamme: p.gamme?.name || p.gamme,
      }));

      const mappedGammes = gammesData.map(g => ({
        ...g,
        brand: g.brand?.name || g.brand,
        category: g.category?.name || g.category
      }));

      setProducts(mappedProds);
      setCategories(catsData);
      setBrands(brandsData);
      setGammes(mappedGammes);
    } catch (err) {
      console.error("Error loading admin dashboard lists:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Deletion logic
  const handleDeleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      if (type === 'product') {
        await api.adminDeleteProduct(id)
      } else if (type === 'category') {
        await api.adminDeleteCategory(id)
      } else if (type === 'brand') {
        await api.adminDeleteBrand(id)
      } else if (type === 'gamme') {
        await api.adminDeleteGamme(id)
      }
      await loadData()
    } catch (err) {
      alert(err.message || `Failed to delete ${type}`)
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
        ref: 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        name: '',
        description: '',
        priceBought: '',
        priceSold: '',
        promotionPercentage: '0',
        quantity: '',
        category: categories[0]?.name || '',
        brand: brands[0]?.name || '',
        gamme: '',
        images: ['/product-1.png'],
        sizes: [{ name: '', priceBought: '', priceSold: '' }],
        colors: [{ name: '', hex: '#000000' }],
        details: '',
        positives: '',
        negatives: ''
      })
    }
    if (type === 'category') {
      setCategoryForm({
        name: '',
        parentCategory: '',
        image: ''
      })
    }
    if (type === 'brand') {
      setBrandForm({
        name: '',
        origin: '',
        image: ''
      })
    }
    if (type === 'gamme') {
      setGammeForm({
        name: '',
        brand: brands[0]?.name || '',
        category: categories[0]?.name || '',
        image: ''
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
        ref: item.ref || ('REF-' + item.id),
        name: item.name || '',
        description: item.description || '',
        priceBought: item.priceBought !== undefined ? item.priceBought : '',
        priceSold: item.priceSold !== undefined ? item.priceSold : '',
        promotionPercentage: item.promotionPercentage !== undefined ? item.promotionPercentage : 0,
        quantity: item.quantity !== undefined ? item.quantity : '',
        category: item.category || '',
        brand: item.brand || '',
        gamme: item.gamme || '',
        images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : ['/product-1.png']),
        sizes: Array.isArray(item.sizes) && item.sizes.length > 0
          ? item.sizes.map(s => typeof s === 'object' && s !== null 
              ? { name: s.name || '', priceBought: s.priceBought !== undefined ? s.priceBought : '', priceSold: s.priceSold !== undefined ? s.priceSold : '' } 
              : { name: String(s), priceBought: item.priceBought || '', priceSold: item.priceSold || '' })
          : [{ name: '', priceBought: item.priceBought || '', priceSold: item.priceSold || '' }],
        colors: Array.isArray(item.colors) ? item.colors.map(c => ({ name: c.name || '', hex: c.hex || '#000000' })) : [{ name: '', hex: '#000000' }],
        details: item.details ? item.details.join('\n') : '',
        positives: item.positives ? item.positives.join('\n') : '',
        negatives: item.negatives ? item.negatives.join('\n') : ''
      })
    }
    if (type === 'category') {
      setCategoryForm({
        name: item.name,
        parentCategory: item.parentCategory || '',
        image: item.image || ''
      })
    }
    if (type === 'brand') {
      setBrandForm({
        name: item.name,
        origin: item.origin || '',
        image: item.image || ''
      })
    }
    if (type === 'gamme') {
      setGammeForm({
        name: item.name,
        brand: item.brand || '',
        category: item.category || '',
        image: item.image || ''
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
      if (!productForm.images || productForm.images.filter(img => img && img.trim()).length === 0) {
        errors.images = 'At least one product image is required.'
      }
    }

    if (modalType === 'category') {
      if (!categoryForm.name.trim()) errors.name = 'Category name is required.'
    }

    if (modalType === 'brand') {
      if (!brandForm.name.trim()) errors.name = 'Brand name is required.'
      if (!brandForm.origin.trim()) errors.origin = 'Country of origin is required.'
    }

    if (modalType === 'gamme') {
      if (!gammeForm.name.trim()) errors.name = 'Gamme name is required.'
      if (!gammeForm.brand) errors.brand = 'Select a brand.'
      if (!gammeForm.category) errors.category = 'Select a category.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle Save
  const handleSaveModal = async (e) => {
    e.preventDefault()
    if (!validateFormFields()) return

    try {
      if (modalType === 'product') {
        const parsedSizes = Array.isArray(productForm.sizes)
          ? productForm.sizes
              .filter(s => s && s.name && s.name.trim() !== '')
              .map(s => ({
                name: s.name.trim(),
                priceBought: parseFloat(s.priceBought) || parseFloat(productForm.priceBought || 0),
                priceSold: parseFloat(s.priceSold) || parseFloat(productForm.priceSold || 0)
              }))
          : []
        const parsedImages = productForm.images.map(i => i.trim()).filter(Boolean)
        const mainImage = parsedImages[0] || '/product-1.png'
        const parsedDetails = productForm.details ? productForm.details.split('\n').map(d => d.trim()).filter(Boolean) : []
        const parsedPositives = productForm.positives ? productForm.positives.split('\n').map(p => p.trim()).filter(Boolean) : []
        const parsedNegatives = productForm.negatives ? productForm.negatives.split('\n').map(n => n.trim()).filter(Boolean) : []
        const parsedColors = Array.isArray(productForm.colors)
          ? productForm.colors.filter(c => c.name && c.name.trim()).map(c => ({ name: c.name.trim(), hex: c.hex.trim() || '#7F8C8D' }))
          : []

        const catObj = categories.find(c => c.name === productForm.category)
        const brandObj = brands.find(b => b.name === productForm.brand)
        const gammeObj = gammes.find(g => g.name === productForm.gamme)

        const payload = {
          ref: productForm.ref,
          name: productForm.name,
          description: productForm.description,
          priceBought: parseFloat(productForm.priceBought),
          priceSold: parseFloat(productForm.priceSold),
          promotionPercentage: parseFloat(productForm.promotionPercentage || 0),
          quantity: parseInt(productForm.quantity),
          categoryId: catObj?.id,
          brandId: brandObj?.id,
          gammeId: gammeObj?.id || null,
          image: mainImage,
          images: parsedImages,
          sizes: parsedSizes.length > 0 ? parsedSizes : [{ name: 'Standard', priceBought: parseFloat(productForm.priceBought || 0), priceSold: parseFloat(productForm.priceSold || 0) }],
          colors: parsedColors,
          details: parsedDetails,
          positives: parsedPositives,
          negatives: parsedNegatives,
          inStock: parseInt(productForm.quantity) > 0
        }

        if (modalMode === 'add') {
          await api.adminCreateProduct(payload)
        } else {
          await api.adminUpdateProduct(editId, payload)
        }
      }

      if (modalType === 'category') {
        const payload = {
          name: categoryForm.name,
          parentCategory: categoryForm.parentCategory || null,
          image: categoryForm.image || null
        }
        if (modalMode === 'add') {
          await api.adminCreateCategory(payload)
        } else {
          await api.adminUpdateCategory(editId, payload)
        }
      }

      if (modalType === 'brand') {
        const payload = {
          name: brandForm.name,
          origin: brandForm.origin || null,
          image: brandForm.image || null
        }
        if (modalMode === 'add') {
          await api.adminCreateBrand(payload)
        } else {
          await api.adminUpdateBrand(editId, payload)
        }
      }

      if (modalType === 'gamme') {
        const brandObj = brands.find(b => b.name === gammeForm.brand)
        const catObj = categories.find(c => c.name === gammeForm.category)

        const payload = {
          name: gammeForm.name,
          brandId: brandObj?.id,
          categoryId: catObj?.id,
          image: gammeForm.image || null
        }
        if (modalMode === 'add') {
          await api.adminCreateGamme(payload)
        } else {
          await api.adminUpdateGamme(editId, payload)
        }
      }

      // Refresh data and close modal
      await loadData()
      setModalType(null)
      setEditId(null)
      setFormErrors({})
    } catch (err) {
      alert(err.message || 'Error occurred while saving.')
    }
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
            { id: 'brands', label: 'Brands', count: brands.length },
            { id: 'gammes', label: 'Gammes', count: gammes.length }
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
              if (productTab === 'gammes') openAddModal('gamme')
            }}
            className="bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold px-5 py-2.5 h-auto text-[10px] uppercase tracking-widest rounded-full cursor-pointer shadow-lg shadow-kurima-orange/5 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {productTab === 'productsList' && 'Add Product'}
              {productTab === 'categories' && 'Add Category'}
              {productTab === 'brands' && 'Add Brand'}
              {productTab === 'gammes' && 'Add Gamme'}
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
                  <th className="p-5">Gamme</th>
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
                      <td className="p-5 text-foreground font-semibold">{p.gamme || <span className="text-kurima-muted/40 italic">-</span>}</td>
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

      {/* TAB CONTENT: GAMMES LIST */}
      {productTab === 'gammes' && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-foreground/[0.015] border-b border-border/50 text-[10px] font-black uppercase tracking-wider text-kurima-muted">
                  <th className="p-5">Gamme Name</th>
                  <th className="p-5">Linked Brand</th>
                  <th className="p-5">Linked Category</th>
                  <th className="p-5 text-center">Total Products</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-semibold text-foreground/80">
                {gammes.map(g => {
                  const linkedCount = products.filter(p => p.gamme === g.name).length
                  return (
                    <tr key={g.id} className="hover:bg-foreground/[0.005] transition-colors">
                      <td className="p-5 font-bold text-foreground flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-foreground/[0.03] border border-border/40 flex items-center justify-center text-[10px] font-black uppercase text-kurima-orange">
                          {g.name.slice(0,2)}
                        </div>
                        <span>{g.name}</span>
                      </td>
                      <td className="p-5 text-foreground">{g.brand}</td>
                      <td className="p-5 text-foreground uppercase tracking-wider text-[10px] font-bold">
                        <span className="bg-foreground/5 px-2 py-0.5 rounded text-foreground/60">{g.category}</span>
                      </td>
                      <td className="p-5 text-center font-mono text-foreground/60">{linkedCount} items</td>
                      <td className="p-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal('gamme', g)}
                            className="p-2 bg-foreground/5 hover:bg-kurima-orange hover:text-black rounded-xl transition-all cursor-pointer text-foreground/60"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem('gamme', g.id)}
                            className="p-2 bg-foreground/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all cursor-pointer text-foreground/60"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {gammes.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-kurima-muted uppercase tracking-widest text-[10px]">
                      No product lines/gammes currently logged in database streams.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          DYNAMIC ADD / EDIT MODALS FOR PRODUCTS, CATEGORIES, BRANDS, GAMMES
          ───────────────────────────────────────────── */}
      {createPortal(
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
                className="relative w-full max-w-xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-left z-10"
              >
                {/* Close Button */}
                <button
                  type="button"
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
                      {/* Product Images Section (At the top!) */}
                      <div className="bg-foreground/[0.015] border border-border/80 rounded-2xl p-4 space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-wider text-kurima-orange block mb-1">Product Images *</label>
                        
                        <div className="flex flex-wrap gap-3">
                          {/* Existing Images Cards */}
                          {productForm.images.filter(Boolean).map((imgUrl, idx) => (
                            <div key={idx} className="w-20 h-20 rounded-2xl border border-border/80 overflow-hidden relative group bg-foreground/[0.02] flex items-center justify-center shrink-0">
                              <img src={imgUrl} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                              {/* Delete overlay */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newImages = productForm.images.filter((_, i) => i !== idx)
                                    setProductForm({ ...productForm, images: newImages.length > 0 ? newImages : [''] })
                                  }}
                                  className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                                  title="Delete Image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Add Image Card (Dashed) */}
                          <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-border/80 hover:border-kurima-orange hover:bg-kurima-orange/5 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group shrink-0">
                            <Plus className="w-5 h-5 text-kurima-muted group-hover:text-kurima-orange transition-colors" />
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files)
                                files.forEach(file => {
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    setProductForm(prev => {
                                      const current = prev.images.filter(Boolean)
                                      return {
                                        ...prev,
                                        images: [...current, reader.result]
                                      }
                                    })
                                  }
                                  reader.readAsDataURL(file)
                                })
                              }}
                            />
                          </label>
                        </div>

                        {/* Paste URL Input field */}
                        <div className="flex gap-2 items-center mt-2">
                          <input
                            type="text"
                            placeholder="Or paste image URL here..."
                            className="flex-1 px-3 py-2 bg-foreground/[0.02] border border-border/80 rounded-xl text-[10px] font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                const val = e.target.value.trim()
                                if (val) {
                                  setProductForm(prev => ({
                                    ...prev,
                                    images: [...prev.images.filter(Boolean), val]
                                  }))
                                  e.target.value = ''
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget.previousSibling
                              const val = input.value.trim()
                              if (val) {
                                setProductForm(prev => ({
                                  ...prev,
                                  images: [...prev.images.filter(Boolean), val]
                                }))
                                input.value = ''
                              }
                            }}
                            className="px-3 py-2 bg-foreground/5 hover:bg-kurima-orange hover:text-black rounded-xl text-[9px] font-black uppercase transition-all cursor-pointer text-foreground border border-border/40"
                          >
                            Add URL
                          </button>
                        </div>

                        {formErrors.images && (
                          <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider block">{formErrors.images}</span>
                        )}
                      </div>

                      {/* Ref & Name */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col col-span-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Reference *</label>
                          <input
                            type="text"
                            value={productForm.ref}
                            onChange={(e) => setProductForm({ ...productForm, ref: e.target.value })}
                            className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold font-mono text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                            placeholder="REF-S1-098"
                          />
                        </div>
                        <div className="flex flex-col col-span-2">
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

                      {/* Quantity */}
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

                      {/* Brand / Category / Gamme selectors */}
                      <div className="grid grid-cols-3 gap-3">
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
                          <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Linked Gamme</label>
                          <select
                            value={productForm.gamme}
                            onChange={(e) => setProductForm({ ...productForm, gamme: e.target.value })}
                            className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange cursor-pointer"
                          >
                            <option value="">None</option>
                            {gammes
                              .filter(g => g.brand === productForm.brand)
                              .map(g => (
                                <option key={g.id} value={g.name}>{g.name}</option>
                              ))}
                          </select>
                        </div>
                      </div>

                      {/* Sizes & Colors */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Dynamic Specifications / Sizes */}
                        <div className="flex flex-col space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted">Sizes & Specifications</label>
                            <button
                              type="button"
                              onClick={() => setProductForm({ ...productForm, sizes: [...productForm.sizes, { name: '', priceBought: '', priceSold: '' }] })}
                              className="text-[9px] font-black uppercase text-kurima-orange hover:text-kurima-orange-light flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Spec</span>
                            </button>
                          </div>
                          
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {productForm.sizes.map((sizeObj, idx) => {
                              const sizeVal = typeof sizeObj === 'object' && sizeObj !== null ? sizeObj.name : sizeObj
                              const priceBoughtVal = typeof sizeObj === 'object' && sizeObj !== null ? sizeObj.priceBought : ''
                              const priceSoldVal = typeof sizeObj === 'object' && sizeObj !== null ? sizeObj.priceSold : ''
                              return (
                                <div key={idx} className="bg-foreground/[0.01] border border-border/80 rounded-xl p-2.5 space-y-2 relative">
                                  <div className="flex gap-2 items-center">
                                    <input
                                      type="text"
                                      value={sizeVal}
                                      onChange={(e) => {
                                        const updated = [...productForm.sizes]
                                        const curObj = typeof updated[idx] === 'object' && updated[idx] !== null ? updated[idx] : { name: updated[idx] }
                                        updated[idx] = { ...curObj, name: e.target.value }
                                        setProductForm({ ...productForm, sizes: updated })
                                      }}
                                      className="flex-1 px-3 py-1.5 bg-foreground/[0.02] border border-border/80 rounded-lg text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                                      placeholder="Spec/Size name (e.g. 16A)"
                                    />
                                    {productForm.sizes.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = productForm.sizes.filter((_, i) => i !== idx)
                                          setProductForm({ ...productForm, sizes: updated })
                                        }}
                                        className="p-1.5 bg-red-500/5 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-foreground/60 transition-all cursor-pointer"
                                        title="Remove Spec"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="flex flex-col">
                                      <label className="text-[8px] font-bold text-kurima-muted uppercase mb-0.5">Bought (DA)</label>
                                      <input
                                        type="number"
                                        value={priceBoughtVal}
                                        onChange={(e) => {
                                          const updated = [...productForm.sizes]
                                          const curObj = typeof updated[idx] === 'object' && updated[idx] !== null ? updated[idx] : { name: updated[idx] }
                                          updated[idx] = { ...curObj, priceBought: e.target.value }
                                          setProductForm({ ...productForm, sizes: updated })
                                        }}
                                        className="px-2 py-1 bg-foreground/[0.02] border border-border/80 rounded text-xs font-mono text-foreground focus:outline-none"
                                        placeholder="Bought price"
                                      />
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-[8px] font-bold text-kurima-muted uppercase mb-0.5">Sold (DA)</label>
                                      <input
                                        type="number"
                                        value={priceSoldVal}
                                        onChange={(e) => {
                                          const updated = [...productForm.sizes]
                                          const curObj = typeof updated[idx] === 'object' && updated[idx] !== null ? updated[idx] : { name: updated[idx] }
                                          updated[idx] = { ...curObj, priceSold: e.target.value }
                                          setProductForm({ ...productForm, sizes: updated })
                                        }}
                                        className="px-2 py-1 bg-foreground/[0.02] border border-border/80 rounded text-xs font-mono text-foreground focus:outline-none"
                                        placeholder="Sold price"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Dynamic Colors */}
                        <div className="flex flex-col space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted">Colors</label>
                            <button
                              type="button"
                              onClick={() => setProductForm({ ...productForm, colors: [...productForm.colors, { name: '', hex: '#000000' }] })}
                              className="text-[9px] font-black uppercase text-kurima-orange hover:text-kurima-orange-light flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Color</span>
                            </button>
                          </div>
                          
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {productForm.colors.map((color, idx) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={color.name}
                                  onChange={(e) => {
                                    const updated = [...productForm.colors]
                                    updated[idx] = { ...updated[idx], name: e.target.value }
                                    setProductForm({ ...productForm, colors: updated })
                                  }}
                                  className="flex-1 px-3 py-2 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                                  placeholder="Name (e.g. Red)"
                                />
                                
                                <div className="flex items-center gap-1.5 shrink-0 bg-foreground/[0.02] border border-border/80 rounded-xl px-2 py-1.5 relative">
                                  <input
                                    type="color"
                                    value={color.hex}
                                    onChange={(e) => {
                                      const updated = [...productForm.colors]
                                      updated[idx] = { ...updated[idx], hex: e.target.value }
                                      setProductForm({ ...productForm, colors: updated })
                                    }}
                                    className="w-5 h-5 rounded-lg border-0 cursor-pointer overflow-hidden bg-transparent"
                                  />
                                  <input
                                    type="text"
                                    value={color.hex}
                                    onChange={(e) => {
                                      const updated = [...productForm.colors]
                                      updated[idx] = { ...updated[idx], hex: e.target.value }
                                      setProductForm({ ...productForm, colors: updated })
                                    }}
                                    className="w-16 bg-transparent border-0 text-[10px] font-semibold text-foreground focus:outline-none uppercase font-mono"
                                    placeholder="#FF0000"
                                  />
                                </div>

                                {productForm.colors.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = productForm.colors.filter((_, i) => i !== idx)
                                      setProductForm({ ...productForm, colors: updated })
                                    }}
                                    className="p-2 bg-red-500/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl text-foreground/60 transition-all cursor-pointer"
                                    title="Remove Color"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Details / Bullet points */}
                      <div className="flex flex-col">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Details / Bullet Points (one per line)</label>
                        <textarea
                          rows="2"
                          value={productForm.details}
                          onChange={(e) => setProductForm({ ...productForm, details: e.target.value })}
                          className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all resize-none"
                          placeholder="Bullet point 1&#10;Bullet point 2"
                        />
                      </div>

                      {/* Positives & Negatives */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-green-500 mb-1">Positives / Pros (one per line)</label>
                          <textarea
                            rows="2"
                            value={productForm.positives}
                            onChange={(e) => setProductForm({ ...productForm, positives: e.target.value })}
                            className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all resize-none"
                            placeholder="Positive 1&#10;Positive 2"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-red-500 mb-1">Negatives / Cons (one per line)</label>
                          <textarea
                            rows="2"
                            value={productForm.negatives}
                            onChange={(e) => setProductForm({ ...productForm, negatives: e.target.value })}
                            className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all resize-none"
                            placeholder="Negative 1&#10;Negative 2"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── CATEGORY FORM FIELDS ── */}
                  {modalType === 'category' && (
                    <div className="space-y-4 text-xs">
                      {/* Image option at the top (single option) */}
                      <div className="bg-foreground/[0.015] border border-border/80 rounded-2xl p-4 space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-wider text-kurima-orange block mb-1">Category Image</label>
                        
                        <div className="flex items-center gap-3">
                          {categoryForm.image ? (
                            <div className="w-20 h-20 rounded-2xl border border-border/80 overflow-hidden relative group bg-foreground/[0.02] flex items-center justify-center shrink-0">
                              <img src={categoryForm.image} alt="Category" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => setCategoryForm({ ...categoryForm, image: '' })}
                                  className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                                  title="Remove Image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-border/80 hover:border-kurima-orange hover:bg-kurima-orange/5 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group shrink-0">
                              <Plus className="w-5 h-5 text-kurima-muted group-hover:text-kurima-orange transition-colors" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onloadend = () => {
                                      setCategoryForm({ ...categoryForm, image: reader.result })
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                }}
                              />
                            </label>
                          )}

                          <div className="flex-1 flex flex-col justify-center">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-kurima-muted mb-1 block">Or paste Category image URL</span>
                            <input
                              type="text"
                              value={categoryForm.image}
                              onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                              className="w-full px-3 py-2 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                              placeholder="e.g. /category-distribution.png"
                            />
                          </div>
                        </div>
                      </div>

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
                            .filter(c => c.id !== editId && !c.parentCategory)
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
                      {/* Image option at the top (single option) */}
                      <div className="bg-foreground/[0.015] border border-border/80 rounded-2xl p-4 space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-wider text-kurima-orange block mb-1">Brand Logo / Image</label>
                        
                        <div className="flex items-center gap-3">
                          {brandForm.image ? (
                            <div className="w-20 h-20 rounded-2xl border border-border/80 overflow-hidden relative group bg-foreground/[0.02] flex items-center justify-center shrink-0">
                              <img src={brandForm.image} alt="Brand Logo" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => setBrandForm({ ...brandForm, image: '' })}
                                  className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                                  title="Remove Image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-border/80 hover:border-kurima-orange hover:bg-kurima-orange/5 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group shrink-0">
                              <Plus className="w-5 h-5 text-kurima-muted group-hover:text-kurima-orange transition-colors" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onloadend = () => {
                                      setBrandForm({ ...brandForm, image: reader.result })
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                }}
                              />
                            </label>
                          )}

                          <div className="flex-1 flex flex-col justify-center">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-kurima-muted mb-1 block">Or paste Brand logo URL</span>
                            <input
                              type="text"
                              value={brandForm.image}
                              onChange={(e) => setBrandForm({ ...brandForm, image: e.target.value })}
                              className="w-full px-3 py-2 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                              placeholder="e.g. /brand-siemens.png"
                            />
                          </div>
                        </div>
                      </div>

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

                  {/* ── GAMME FORM FIELDS ── */}
                  {modalType === 'gamme' && (
                    <div className="space-y-4 text-xs">
                      {/* Image option at the top (single option) */}
                      <div className="bg-foreground/[0.015] border border-border/80 rounded-2xl p-4 space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-wider text-kurima-orange block mb-1">Gamme Image</label>
                        
                        <div className="flex items-center gap-3">
                          {gammeForm.image ? (
                            <div className="w-20 h-20 rounded-2xl border border-border/80 overflow-hidden relative group bg-foreground/[0.02] flex items-center justify-center shrink-0">
                              <img src={gammeForm.image} alt="Gamme Image" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => setGammeForm({ ...gammeForm, image: '' })}
                                  className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                                  title="Remove Image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-border/80 hover:border-kurima-orange hover:bg-kurima-orange/5 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group shrink-0">
                              <Plus className="w-5 h-5 text-kurima-muted group-hover:text-kurima-orange transition-colors" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onloadend = () => {
                                      setGammeForm({ ...gammeForm, image: reader.result })
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                }}
                              />
                            </label>
                          )}

                          <div className="flex-1 flex flex-col justify-center">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-kurima-muted mb-1 block">Or paste Gamme image URL</span>
                            <input
                              type="text"
                              value={gammeForm.image}
                              onChange={(e) => setGammeForm({ ...gammeForm, image: e.target.value })}
                              className="w-full px-3 py-2 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                              placeholder="e.g. /gamme-acti9.png"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Gamme Name *</label>
                        <input
                          type="text"
                          value={gammeForm.name}
                          onChange={(e) => setGammeForm({ ...gammeForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange transition-all"
                          placeholder="e.g. Acti9, Niloé..."
                        />
                        {formErrors.name && <span className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wider">{formErrors.name}</span>}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Linked Brand *</label>
                          <select
                            value={gammeForm.brand}
                            onChange={(e) => setGammeForm({ ...gammeForm, brand: e.target.value })}
                            className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange cursor-pointer"
                          >
                            {brands.map(b => (
                              <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-kurima-muted mb-1">Linked Category *</label>
                          <select
                            value={gammeForm.category}
                            onChange={(e) => setGammeForm({ ...gammeForm, category: e.target.value })}
                            className="w-full px-4 py-2.5 bg-foreground/[0.02] border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-kurima-orange cursor-pointer"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
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
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  )
}
