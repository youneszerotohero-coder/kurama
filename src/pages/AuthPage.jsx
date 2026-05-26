import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Phone, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'

export default function AuthPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  // Form states
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  
  // Validation / interaction states
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    if (!isLogin && !name.trim()) {
      newErrors.name = t('auth.required')
    }
    if (!phone.trim()) {
      newErrors.phone = t('auth.required')
    } else if (!/^(05|06|07)[0-9]{8}$/.test(phone.trim().replace(/\s+/g, ''))) {
      newErrors.phone = t('auth.phoneError')
    }
    if (!password) {
      newErrors.password = t('auth.required')
    } else if (password.length < 6) {
      newErrors.password = t('auth.pwdError')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    // Simulate API request
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)

      // Save user to localStorage
      const mockUser = {
        name: isLogin ? (name || 'Younes Coder') : name,
        phone: phone || '0550123456',
        email: phone ? `${phone.trim()}@electrohub.dz` : 'younes.coder@electrohub.dz',
        company: 'ElectroTech Solutions DZ',
        wilaya: 'Algiers (16)',
        commune: 'Hydra'
      }
      localStorage.setItem('currentUser', JSON.stringify(mockUser))

      setTimeout(() => {
        navigate('/profile')
      }, 2000)
    }, 1500)
  }

  return (
    <div className="w-full h-[100vh] grid md:grid-cols-12 relative z-10">
        
        {/* Left Column: Visual/Brand Section (Takes 5 cols) */}
        <div className="hidden md:block md:col-span-5 relative overflow-hidden group">
          <img
            src="/bg1.jpg"
            alt="ElectroHub Background"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* High-end gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/25 to-background/50" />
          <div className="absolute inset-0 bg-kurima-orange/5 mix-blend-color-dodge" />

          {/* Logo overlay at top */}
          <div className="absolute top-8 left-8 flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-kurima-orange flex items-center justify-center shadow-lg shadow-kurima-orange/30">
              <Zap className="w-5 h-5 text-black fill-black" />
            </div>
            <span className="text-lg font-black tracking-wider uppercase text-black dark:text-white font-mono transition-colors duration-300">
              ElectroHub
            </span>
          </div>

          {/* Bottom text overlay */}
          <div className="absolute bottom-10 left-8 right-8 text-left rtl:text-right">
            <Badge className="bg-kurima-orange text-black font-extrabold px-3 py-1 rounded-full uppercase tracking-wider text-[8px] mb-3">
              {t('auth.premiumManager')}
            </Badge>
            <h3 className="text-2xl font-black text-black dark:text-white leading-tight uppercase tracking-tight transition-colors duration-300">
              {t('auth.powerFuture')}
            </h3>
            <p className="text-black/70 dark:text-white/70 text-xs mt-2 leading-relaxed transition-colors duration-300">
              {t('auth.powerDesc')}
            </p>
            {/* Carousel indicator dots */}
            <div className="flex gap-1.5 mt-5">
              <span className="h-1.5 w-6 rounded-full bg-kurima-orange transition-all" />
              <span className="h-1.5 w-1.5 rounded-full bg-black/20 dark:bg-white/40 transition-colors" />
              <span className="h-1.5 w-1.5 rounded-full bg-black/20 dark:bg-white/40 transition-colors" />
            </div>
          </div>
        </div>

        {/* Right Column: Form Section (Takes 7 cols) */}
        <div className="col-span-12 md:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden bg-background">          
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form-container"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full justify-between gap-8"
              >
                {/* Header Switcher */}
                <div className="flex items-center justify-between">
                  {/* Mobile Logo Only */}
                  <div className="flex md:hidden items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-kurima-orange flex items-center justify-center">
                      <Zap className="w-4.5 h-4.5 text-black fill-black" />
                    </div>
                    <span className="text-sm font-black tracking-wider uppercase text-foreground">ElectroHub</span>
                  </div>
                  <div className="hidden md:block" />

                  {/* Switch Pill Button */}
                  <Button
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setErrors({})
                    }}
                    variant="outline"
                    className="rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-widest border-border text-foreground hover:bg-foreground/5 hover:border-kurima-orange/50 transition-all cursor-pointer"
                  >
                    {isLogin ? t('auth.signUp') : t('auth.signIn')}
                  </Button>
                </div>

                {/* Form Content */}
                <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground leading-none">
                      {isLogin ? t('auth.welcomeBack') : t('auth.joinToday')}
                    </h2>
                    <p className="text-kurima-muted text-xs mt-2.5">
                      {isLogin ? t('auth.signInAccount') : t('auth.registerAccount')}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name field for Register */}
                    <AnimatePresence mode="popLayout">
                      {!isLogin && (
                        <motion.div
                          key="register-name"
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                          className="flex flex-col overflow-hidden"
                        >
                          <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-1.5">
                            {t('auth.fullName')} <span className="text-kurima-orange">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                            <input
                              type="text"
                              placeholder={t('auth.fullName')}
                              value={name}
                              onChange={(e) => {
                                setName(e.target.value)
                                if (errors.name) setErrors({ ...errors, name: null })
                              }}
                              className={`w-full pl-11 pr-4 py-3.5 bg-foreground/[0.015] border rounded-2xl text-xs font-semibold text-foreground placeholder-foreground/25 focus:outline-none focus:ring-1 focus:ring-kurima-orange/20 focus:border-kurima-orange transition-all ${
                                errors.name ? 'border-kurima-orange ring-1 ring-kurima-orange/25' : 'border-border/80'
                              }`}
                            />
                          </div>
                          {errors.name && (
                            <span className="text-[9px] text-kurima-orange font-bold mt-1 uppercase tracking-wider">
                              {errors.name}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Phone Number field */}
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-1.5">
                        {t('auth.phoneNumber')} <span className="text-kurima-orange">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                        <input
                          type="tel"
                          placeholder={t('auth.phoneNumber')}
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value)
                            if (errors.phone) setErrors({ ...errors, phone: null })
                          }}
                          className={`w-full pl-11 pr-4 py-3.5 bg-foreground/[0.015] border rounded-2xl text-xs font-semibold text-foreground placeholder-foreground/25 focus:outline-none focus:ring-1 focus:ring-kurima-orange/20 focus:border-kurima-orange transition-all ${
                            errors.phone ? 'border-kurima-orange ring-1 ring-kurima-orange/25' : 'border-border/80'
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <span className="text-[9px] text-kurima-orange font-bold mt-1 uppercase tracking-wider">
                          {errors.phone}
                        </span>
                      )}
                    </div>

                    {/* Password field */}
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted mb-1.5">
                        {t('auth.password')} <span className="text-kurima-orange">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('auth.password')}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            if (errors.password) setErrors({ ...errors, password: null })
                          }}
                          className={`w-full pl-11 pr-11 py-3.5 bg-foreground/[0.015] border rounded-2xl text-xs font-semibold text-foreground placeholder-foreground/25 focus:outline-none focus:ring-1 focus:ring-kurima-orange/20 focus:border-kurima-orange transition-all ${
                            errors.password ? 'border-kurima-orange ring-1 ring-kurima-orange/25' : 'border-border/80'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <span className="text-[9px] text-kurima-orange font-bold mt-1 uppercase tracking-wider">
                          {errors.password}
                        </span>
                      )}
                    </div>

                    {/* Remember me & Forgot Password row */}
                    {isLogin && (
                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider text-kurima-muted hover:text-foreground transition-colors">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-3.5 h-3.5 accent-kurima-orange bg-foreground/10 border-border rounded cursor-pointer"
                          />
                          <span>{t('auth.rememberMe')}</span>
                        </label>
                        <a href="#forgot" className="text-[10px] font-bold text-kurima-orange hover:underline uppercase tracking-wider">
                          {t('auth.forgotPassword')}
                        </a>
                      </div>
                    )}

                    {/* Submit CTA button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-kurima-orange hover:bg-kurima-orange-light text-black font-extrabold py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-kurima-orange/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>{isLogin ? t('auth.login') : t('auth.register')}</span>
                          <ArrowRight className="w-4.5 h-4.5" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                {/* Footer Switcher Label */}
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-kurima-muted">
                    {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}
                    <button
                      onClick={() => {
                        setIsLogin(!isLogin)
                        setErrors({})
                      }}
                      className="text-kurima-orange hover:underline font-black cursor-pointer bg-transparent border-none p-0 inline ml-1"
                    >
                      {isLogin ? t('auth.register') : t('auth.login')}
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col justify-center items-center text-center p-8 max-w-sm mx-auto"
              >
                {/* Success lights */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(151,255,0,0.06),transparent_60%)]" />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-kurima-orange/15 rounded-full flex items-center justify-center mb-6 text-kurima-orange border border-kurima-orange/30 shadow-lg shadow-kurima-orange/5"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                
                <h3 className="text-2xl font-black text-foreground uppercase tracking-wide mb-2 leading-tight">
                  {t('auth.accessGranted')}
                </h3>
                <p className="text-kurima-muted text-xs leading-relaxed mb-6">
                  {t('auth.connecting')}
                </p>
                
                <div className="flex items-center justify-center gap-1.5 text-[9px] font-black uppercase text-kurima-orange tracking-widest animate-pulse">
                  <span>{t('auth.poweringSecure')}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-kurima-orange" />
                  <span className="w-1.5 h-1.5 rounded-full bg-kurima-orange delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-kurima-orange delay-300" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  )
}
