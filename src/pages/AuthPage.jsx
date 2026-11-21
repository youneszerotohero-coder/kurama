import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Loader2, Check, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import { setSeo } from '@/lib/seo'
import Page, { SplitWords, useIntro } from '@/components/layout/Page'
import Btn, { Logo, cn } from '@/components/ui/Btn'
import LanguageSwitch from '@/components/layout/LanguageSwitch'

export default function AuthPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const scope = useRef(null)
  const [isLogin, setIsLogin] = useState(true)
  const [show, setShow] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useIntro(scope, [isLogin])
  useEffect(() => setSeo({ title: t('ui.signIn', 'Espace client'), noindex: true }), [t])

  const validate = () => {
    const e = {}
    if (!isLogin && !name.trim()) e.name = t('auth.required')
    const p = phone.replace(/\s+/g, '')
    if (!p) e.phone = t('auth.required')
    else if (!/^0[567]\d{8}$/.test(p)) e.phone = t('auth.phoneError')
    if (!password) e.password = t('auth.required')
    else if (password.length < 6) e.password = t('auth.pwdError')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors({})
    try {
      const p = phone.replace(/\s+/g, '')
      const data = isLogin ? await api.login({ phone: p, password }) : await api.register({ fullName: name.trim(), phone: p, password })
      const user = { ...data.user, name: data.user.fullName }
      localStorage.setItem('token', data.token)
      localStorage.setItem('currentUser', JSON.stringify(user))
      setDone(true)
      setTimeout(() => navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/profile'), 900)
    } catch (err) {
      setErrors({ submit: err.message || t('ui.authFailed', 'Connexion impossible, réessayez.') })
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin((v) => !v)
    setErrors({})
  }

  const field = (id, label, input) => (
    <label htmlFor={id} className="block">
      <span className="eyebrow mb-2 flex justify-between text-ink-900/60">
        {label}
        {errors[id] && <span className="normal-case tracking-normal text-[#d93025]">{errors[id]}</span>}
      </span>
      {input}
    </label>
  )

  return (
    <Page>
      <main id="main" ref={scope} className="grid min-h-[100svh] lg:grid-cols-2">
        {/* Visual */}
        <div className="relative hidden overflow-hidden lg:block">
          <img
            src="/img/store-735.webp"
            srcSet="/img/store-480.webp 480w, /img/store-735.webp 735w"
            sizes="50vw"
            alt=""
            width="735"
            height="490"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/20" />
          <div className="grid-lines-dark absolute inset-0 opacity-40" />
          <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
            <Link to="/" className="group w-fit">
              <Logo size="lg" />
            </Link>
            <div>
              <p className="eyebrow mb-5 flex items-center gap-2 text-forest">
                <span className="live-dot" /> {t('auth.premiumManager')}
              </p>
              <p className="max-w-[14em] text-[clamp(2.2rem,3.2vw,3.2rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-ink-900">{t('auth.powerFuture')}</p>
              <p className="mt-5 max-w-md text-ink-900/65">{t('auth.powerDesc')}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="relative flex flex-col px-[clamp(1rem,5vw,4rem)] py-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="eyebrow flex items-center gap-2 text-ink-900/62 hover:text-ink-900">
              <ArrowLeft className="size-4 rtl:rotate-180" /> {t('nav.home')}
            </Link>
            <LanguageSwitch className="flex" />
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
            <Link to="/" className="group mb-10 w-fit lg:hidden">
              <Logo size="lg" />
            </Link>

            <div role="tablist" className="mb-8 grid grid-cols-2 gap-1 rounded-full bg-ink-900/[0.04] p-1 ring-hair">
              {[
                [true, t('auth.signIn')],
                [false, t('auth.signUp')],
              ].map(([mode, label]) => (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={isLogin === mode}
                  onClick={() => isLogin !== mode && switchMode()}
                  className={cn('h-11 rounded-full text-[0.93rem] transition-colors', isLogin === mode ? 'bg-volt text-ink-900' : 'text-ink-900/65 hover:text-ink-900')}
                >
                  {label}
                </button>
              ))}
            </div>

            <h1 key={String(isLogin)} className="text-[clamp(2rem,3.4vw,2.9rem)] leading-[1.02] font-semibold tracking-[-0.04em]">
              <SplitWords text={isLogin ? t('auth.welcomeBack') : t('auth.joinToday')} />
            </h1>
            <p data-intro className="mt-3 mb-8 text-ink-900/62">
              {isLogin ? t('auth.signInAccount') : t('auth.registerAccount')}
            </p>

            {done ? (
              <div data-intro className="flex items-center gap-4 rounded-2xl bg-volt/20 p-5 shadow-[inset_0_0_0_1px_rgba(154,240,126,0.3)]">
                <span className="flex size-11 items-center justify-center rounded-full bg-volt text-ink-900">
                  <Check className="size-5" />
                </span>
                <div>
                  <p className="text-ink-900">{t('auth.accessGranted')}</p>
                  <p className="text-[0.9rem] text-ink-900/62">{t('auth.connecting')}</p>
                </div>
              </div>
            ) : (
              <form data-intro onSubmit={submit} noValidate className="space-y-4">
                {!isLogin &&
                  field(
                    'name',
                    t('auth.fullName'),
                    <input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} className="field" />,
                  )}
                {field(
                  'phone',
                  t('auth.phoneNumber'),
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="05 / 06 / 07 XX XX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-invalid={!!errors.phone}
                    dir="ltr"
                    className="field rtl:text-right"
                  />,
                )}
                {field(
                  'password',
                  t('auth.password'),
                  <span className="relative block">
                    <input
                      id="password"
                      type={show ? 'text' : 'password'}
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!errors.password}
                      className="field pe-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      className="absolute top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-900/60 hover:text-ink-900 ltr:right-1.5 rtl:left-1.5"
                      aria-label={show ? t('ui.hidePassword', 'Masquer le mot de passe') : t('ui.showPassword', 'Afficher le mot de passe')}
                    >
                      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </span>,
                )}

                {errors.submit && (
                  <p role="alert" className="rounded-xl bg-[#ff6b5e]/10 px-4 py-3 text-[0.9rem] text-[#d93025]">
                    {errors.submit}
                  </p>
                )}

                <Btn
                  type="submit"
                  variant="volt"
                  size="lg"
                  chip={!loading}
                  disabled={loading}
                  className="w-full justify-between ps-7"
                  icon={loading ? <Loader2 className="size-4 animate-spin" /> : null}
                >
                  {isLogin ? t('auth.login') : t('auth.register')}
                </Btn>
              </form>
            )}

            <p className="mt-8 text-center text-[0.93rem] text-ink-900/60">
              {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
              <button type="button" onClick={switchMode} className="text-forest">
                <span className="link-line">{isLogin ? t('auth.signUp') : t('auth.signIn')}</span>
              </button>
            </p>
          </div>
        </div>
      </main>
    </Page>
  )
}
