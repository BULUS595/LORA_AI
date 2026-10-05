import { useEffect, useState } from 'react'
import './App.css'
import { authService, billingService, profileService } from './lib/auth'

const featureCards = [
  {
    title: 'Daily focus',
    text: 'Turn busy days into calm, trackable plans with smart guidance and structured support.',
    badge: 'Personal',
  },
  {
    title: 'Learning that adapts',
    text: 'Move from beginner to advanced with guided lessons that explain, teach, and simplify.',
    badge: 'Learn',
  },
  {
    title: 'Voice and workflow',
    text: 'Speak naturally, manage tasks, and keep momentum without losing context in the flow of work.',
    badge: 'Voice',
  },
  {
    title: 'Clear thinking',
    text: 'Ask for practical steps, frameworks, and summaries that sharpen decisions instead of adding noise.',
    badge: 'Reason',
  },
]

const learningPaths = [
  {
    title: 'Getting started',
    description: 'Set up your account, configure your device, and begin your first LORA conversation.',
    level: 'Beginner',
  },
  {
    title: 'Writing better prompts',
    description: 'Use Goal + Context + Details + Desired Output to turn vague requests into useful answers.',
    level: 'Core skill',
  },
  {
    title: 'Students and learning',
    description: 'Study more effectively, break hard topics into manageable steps, and practice with examples.',
    level: 'Academic',
  },
  {
    title: 'Work and productivity',
    description: 'Plan days, prepare agendas, draft clear communication, and simplify complex project work.',
    level: 'Productive',
  },
  {
    title: 'Business owners',
    description: 'Create customer-ready messaging, content ideas, service descriptions, and operational clarity.',
    level: 'Business',
  },
  {
    title: 'Privacy and responsible use',
    description: 'Understand what to avoid sharing, how to verify output, and how to use LORA responsibly.',
    level: 'Safe use',
  },
]

const promptExamples = [
  'Help me study introductory mathematics. Explain domain and range using simple examples, teach one step at a time, and give me three practice questions before showing the answers.',
  'Draft a clear and professional message to a client asking for a timeline update without sounding urgent or defensive.',
  'Plan my week for a small business launch. Organize tasks into priority groups, identify bottlenecks, and suggest a realistic workflow.',
]

const faqs = [
  {
    question: 'What is LORA AI?',
    answer:
      'LORA AI is a premium assistant designed to support everyday learning, planning, writing, and productivity with a calm, clear, intelligent experience.',
  },
  {
    question: 'Who created LORA AI?',
    answer:
      'LORA AI was created by Larry Rimamsikwe Bulus and developed under Larry Technologies.',
  },
  {
    question: 'Can I learn without technical knowledge?',
    answer:
      'Yes. The public learning center is designed for everyday users, students, professionals, and business owners with beginner-friendly explanations and examples.',
  },
  {
    question: 'Does the site show internal provider details?',
    answer:
      'No. LORA presents one consistent public identity and keeps internal provision routing, credentials, and provider configuration in protected systems.',
  },
]

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Explore the learning center and get comfortable with the product.',
    features: ['Basic assistant access', 'Learning path previews', 'Helpful onboarding'],
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Built for focused day-to-day work and deeper personal productivity.',
    features: ['Full assistant access', 'Voice-ready workflows', 'Priority learning resources'],
    highlight: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Ideal for founders, teams, and professionals who need structure and speed.',
    features: ['Shared workflows', 'Business templates', 'Advanced planning support'],
  },
]

const downloadOptions = [
  {
    platform: 'Windows',
    note: 'Coming soon',
    action: 'Not available yet',
  },
  {
    platform: 'Mac',
    note: 'Coming soon',
    action: 'Not available yet',
  },
  {
    platform: 'iPhone',
    note: 'Coming soon',
    action: 'Not available yet',
  },
  {
    platform: 'Android',
    note: 'Coming soon',
    action: 'Not available yet',
  },
  {
    platform: 'Linux',
    note: 'Coming soon',
    action: 'Not available yet',
  },
]

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Learn', href: '#learn' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Download', href: '#download' },
]

const answerWebsiteQuestion = (question, pageContext) => {
  const normalized = question.toLowerCase()

  if (/\b(what is lora|what does lora do|about lora)\b/.test(normalized)) {
    return 'LORA is being built as an assistant for learning, writing, planning, and everyday work. This site currently provides product information, account setup, and plan selection.'
  }
  if (/\b(sign ?up|create an account|register|join)\b/.test(normalized)) {
    return 'Choose Sign Up in the top navigation, enter your name, email, and password, then confirm your email if verification is enabled. You need an account before activating any plan.'
  }
  if (/\b(log ?in|sign ?in|password|reset)\b/.test(normalized)) {
    return 'Choose Log In in the top navigation. Use Forgot password? to request a reset email. If sign-in is unavailable, the Supabase project still needs to be configured.'
  }
  if (/\b(plan|billing|upgrade|subscription|cancel|payment|stripe|free)\b/.test(normalized)) {
    if (pageContext === 'billing') {
      return 'Choose a plan below. You must be signed in first; paid checkout opens Stripe. After Stripe confirms a subscription, its webhook updates your account plan. Billing is unavailable until Stripe is configured.'
    }
    return 'Open your account menu and choose Billing to view your plan or manage a paid subscription. New users can select the Free plan from Pricing, but still need an account first.'
  }
  if (/\b(download|install|windows|mac|iphone|android|linux)\b/.test(normalized)) {
    return 'LORA installers are not published yet. The Download section will be updated when releases are available.'
  }
  if (/\b(dashboard|use lora|ask lora|assistant|chat)\b/.test(normalized)) {
    return 'The primary LORA assistant workspace is not connected in this website yet. This help chat can guide you around the current site, but it does not answer general AI questions.'
  }
  if (pageContext === 'billing') {
    return 'You are viewing Pricing. Select Free, Basic, or Pro, then continue. Account creation is required before any plan is activated.'
  }
  if (pageContext === 'account') {
    return 'Account settings include your profile, response-style preference, and the plan status saved for your signed-in account.'
  }
  return 'I can help with accounts, login, password reset, plans, billing, and downloads. What would you like to do?'
}

const socialProviders = [
  { id: 'google', name: 'Google' },
  { id: 'apple', name: 'Apple' },
  { id: 'microsoft', name: 'Microsoft' },
  { id: 'github', name: 'GitHub' },
]

function App() {
  const [copiedPrompt, setCopiedPrompt] = useState('')
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('lora-theme') === 'dark' ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })
  const [pointer, setPointer] = useState({ x: 50, y: 32 })
  const [selectedPlan, setSelectedPlan] = useState('Basic')
  const [checkoutMessage, setCheckoutMessage] = useState(() => {
    const checkoutResult = new URLSearchParams(window.location.search).get('checkout')
    if (checkoutResult === 'success') {
      return 'Stripe Checkout returned. Your subscription will appear after Stripe confirms it; refresh Billing shortly.'
    }
    if (checkoutResult === 'cancelled') return 'Checkout was canceled. No plan was changed.'
    return ''
  })
  const [checkoutMessageType, setCheckoutMessageType] = useState('status')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [planCatalog, setPlanCatalog] = useState([])
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [accountTab, setAccountTab] = useState('profile')
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [accountMessage, setAccountMessage] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileForm, setProfileForm] = useState({ fullName: '', assistantStyle: 'balanced' })
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [authMessage, setAuthMessage] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpInput, setHelpInput] = useState('')
  const [helpContext, setHelpContext] = useState('home')
  const [helpMessages, setHelpMessages] = useState([
    { role: 'assistant', text: 'Hi, I can help you find your way around LORA. Ask about accounts, plans, billing, or downloads.' },
  ])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('lora-theme', theme)
    } catch {}
  }, [theme])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('checkout')) return
    url.searchParams.delete('checkout')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }, [])

  useEffect(() => {
    const handleMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 100
      const y = (event.clientY / window.innerHeight) * 100
      setPointer({ x, y })
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setAuthModalOpen(false)
        setAccountModalOpen(false)
        setAccountMenuOpen(false)
        setHelpOpen(false)
      }
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('keydown', handleEscape)

    const unsubscribeAuth = authService.onAuthStateChange((user, event) => {
      const nextUser = user
        ? {
            id: user.id,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'LORA user',
            email: user.email,
          }
        : null
      setCurrentUser(nextUser)
      setIsLoggedIn(Boolean(user))
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('recovery')
        setAuthModalOpen(true)
      }
    })

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('keydown', handleEscape)
      unsubscribeAuth()
    }
  }, [])

  useEffect(() => {
    if (!authModalOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [authModalOpen])

  useEffect(() => {
    const updateContext = () => {
      const section = window.location.hash.slice(1)
      setHelpContext(section === 'pricing' ? 'billing' : section === 'account' ? 'account' : 'home')
    }
    updateContext()
    window.addEventListener('hashchange', updateContext)
    return () => window.removeEventListener('hashchange', updateContext)
  }, [])

  useEffect(() => {
    let active = true
    billingService.getPlanCatalog()
      .then((catalog) => {
        if (active) setPlanCatalog(catalog?.plans || [])
      })
      .catch(() => {
        if (active) setPlanCatalog([])
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    if (!currentUser?.id || !accountModalOpen) {
      return () => { active = false }
    }

    Promise.all([profileService.get(), billingService.getCurrentSubscription()])
      .then(([profile, subscription]) => {
        if (!active) return
        setProfileForm({
          fullName: profile.full_name || currentUser.name,
          assistantStyle: profile.preferences?.assistant_style || 'balanced',
        })
        setCurrentSubscription(subscription)
        setAccountError('')
      })
      .catch((error) => {
        if (active) setAccountError(error.message || 'Unable to load your account details.')
      })
      .finally(() => {
        if (active) setAccountLoading(false)
      })

    return () => { active = false }
  }, [accountModalOpen, currentUser?.id, currentUser?.name])

  const activePlan = plans.find((plan) => plan.name === selectedPlan) ?? plans[1]
  const getPlanPrice = (plan) => {
    if (plan.id === 'free') return { price: 'Free', period: 'No payment required' }
    const configuredPrice = planCatalog.find((catalogPlan) => catalogPlan.id === plan.id)
    if (!configuredPrice) return { price: 'Not configured', period: 'Billing unavailable' }

    const digits = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: configuredPrice.currency,
    }).resolvedOptions().maximumFractionDigits
    const amount = configuredPrice.amount / 10 ** digits
    const interval = `${configuredPrice.intervalCount > 1 ? `${configuredPrice.intervalCount} ` : ''}${configuredPrice.interval}`
    return {
      price: new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: configuredPrice.currency,
      }).format(amount),
      period: `per ${interval}`,
    }
  }

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode)
    setHelpContext(mode)
    setAuthMessage('')
    setAuthForm({ name: '', email: '', password: '', confirmPassword: '' })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setOauthLoading('')
    setAuthModalOpen(true)
    setMobileNavOpen(false)
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPrompt(text)
      window.setTimeout(() => setCopiedPrompt(''), 1600)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      openAuthModal('signup')
      return
    }

    setCheckoutLoading(true)
    setCheckoutMessage('')
    setCheckoutMessageType('status')

    try {
      if (activePlan.id === 'free') {
        await billingService.activateFreePlan()
        setCurrentSubscription(await billingService.getCurrentSubscription())
        setCheckoutMessage('Your free account plan is active.')
        return
      }

      const checkout = await billingService.createCheckoutSession(activePlan.id)
      if (!checkout?.url) throw new Error('Secure checkout could not be started. Please try again.')
      window.location.assign(checkout.url)
    } catch (error) {
      setCheckoutMessageType('error')
      setCheckoutMessage(error.message || 'Billing is unavailable. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthMessage('')

    const email = authForm.email.trim()
    const password = authForm.password.trim()

    if (authMode === 'reset') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setAuthMessage('Enter the email address for your account.')
        return
      }

      setAuthLoading(true)
      try {
        await authService.requestPasswordReset({ email })
        setAuthMessage('If an account exists for that email, a password reset link has been sent.')
      } catch (error) {
        setAuthMessage(error.message || 'Unable to send a reset link. Please try again.')
      } finally {
        setAuthLoading(false)
      }
      return
    }

    if (authMode === 'recovery') {
      if (password.length < 8) {
        setAuthMessage('Your password must be at least 8 characters.')
        return
      }
      if (password !== authForm.confirmPassword) {
        setAuthMessage('Passwords do not match.')
        return
      }

      setAuthLoading(true)
      try {
        await authService.updatePassword({ password })
        setAuthMode('login')
        setAuthForm({ name: '', email: '', password: '', confirmPassword: '' })
        setAuthMessage('Password updated. Log in with your new password.')
      } catch (error) {
        setAuthMessage(error.message || 'Unable to update your password. Please try again.')
      } finally {
        setAuthLoading(false)
      }
      return
    }

    if (authMode === 'signup') {
      if (!authForm.name.trim()) {
        setAuthMessage('Please enter your full name.')
        return
      }

      if (!email || !password) {
        setAuthMessage('Please complete all required signup fields.')
        return
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setAuthMessage('Please enter a valid email address.')
        return
      }

      if (password.length < 8) {
        setAuthMessage('Your password does not meet the requirements.')
        return
      }

      if (password !== authForm.confirmPassword) {
        setAuthMessage('Passwords do not match.')
        return
      }
    }

    if (authMode === 'login') {
      if (!email || !password) {
        setAuthMessage('Please complete the email and password fields.')
        return
      }
    }

    setAuthLoading(true)

    try {
      const response =
        authMode === 'login'
          ? await authService.login({ email, password })
          : await authService.signup({
              name: authForm.name.trim(),
              email,
              password,
            })

      if (!response.session) {
        setAuthMessage('Check your email to confirm your account before continuing.')
        return
      }

      const nextUser = {
        id: response.user.id,
        name: response.user.user_metadata?.full_name || authForm.name.trim() || email.split('@')[0],
        email: response.user.email || email,
      }
      setCurrentUser(nextUser)
      setIsLoggedIn(true)
      setAuthModalOpen(false)
      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' })
      setShowPassword(false)
      setShowConfirmPassword(false)
      setAuthMessage('')
    } catch (error) {
      setAuthMessage(error.message || 'Something went wrong. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSocialAuth = async (provider) => {
    setAuthMessage('')
    setOauthLoading(provider)

    try {
      await authService.startOAuth(provider)
    } catch (error) {
      setAuthMessage(error.message || 'Unable to start sign in. Please try again.')
      setOauthLoading('')
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      setIsLoggedIn(false)
      setCurrentUser(null)
      setCurrentSubscription(null)
      setAccountMenuOpen(false)
      setAuthModalOpen(false)
      setAuthMessage('')
    } catch (error) {
      setAuthMessage(error.message || 'Unable to log out. Please try again.')
    }
  }

  const openAccount = (tab) => {
    setAccountTab(tab)
    setAccountLoading(true)
    setAccountError('')
    setAccountMessage('')
    setAccountMenuOpen(false)
    setAccountModalOpen(true)
  }

  const handleSaveProfile = async (event) => {
    event.preventDefault()
    setProfileSaving(true)
    setAccountError('')
    setAccountMessage('')

    try {
      await profileService.update({
        fullName: profileForm.fullName.trim(),
        preferences: { assistant_style: profileForm.assistantStyle },
      })
      setCurrentUser((user) => ({ ...user, name: profileForm.fullName.trim() }))
      setAccountMessage('Your account details are saved.')
    } catch (error) {
      setAccountError(error.message || 'Unable to save your account details.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleBillingPortal = async () => {
    setCheckoutLoading(true)
    setAccountError('')
    try {
      const portal = await billingService.createPortalSession()
      if (!portal?.url) throw new Error('Billing management could not be opened.')
      window.location.assign(portal.url)
    } catch (error) {
      setAccountError(error.message || 'Unable to open billing management.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleRefreshSubscription = async () => {
    setAccountLoading(true)
    setAccountError('')
    try {
      setCurrentSubscription(await billingService.getCurrentSubscription())
    } catch (error) {
      setAccountError(error.message || 'Unable to refresh your plan status.')
    } finally {
      setAccountLoading(false)
    }
  }

  const sendHelpMessage = (message = helpInput) => {
    const question = message.trim()
    if (!question) return
    setHelpMessages((messages) => [
      ...messages,
      { role: 'user', text: question },
      { role: 'assistant', text: answerWebsiteQuestion(question, helpContext) },
    ])
    setHelpInput('')
  }

  return (
    <div
      className="app-shell"
      style={{
        '--pointer-x': `${pointer.x}%`,
        '--pointer-y': `${pointer.y}%`,
      }}
    >
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grid-overlay" />

      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-core" />
          </div>
          <div>
            <div className="brand-name">LORA AI</div>
            <div className="brand-tag">Your intelligent assistant for everyday life and work.</div>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          {isLoggedIn ? (
            <div className="account-menu" aria-label="Account menu">
              <button
                type="button"
                className="account-trigger"
                onClick={() => setAccountMenuOpen((open) => !open)}
              >
                {currentUser?.name || 'Larry'} <span aria-hidden="true">▾</span>
              </button>

              {accountMenuOpen ? (
                <div className="account-dropdown">
                  <button type="button" onClick={() => openAccount('profile')}>My Account</button>
                  <button type="button" onClick={() => openAccount('billing')}>Billing</button>
                  <a href="#download" onClick={() => setAccountMenuOpen(false)}>Downloads</a>
                  <button type="button" onClick={() => openAccount('settings')}>Settings</button>
                  <button type="button" className="danger-action" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <button type="button" className="nav-link" onClick={() => openAuthModal('login')}>
                Log In
              </button>
              <button type="button" className="nav-cta" onClick={() => openAuthModal('signup')}>
                Sign Up
              </button>
            </>
          )}
          <button
            type="button"
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? '🌙 Dark' : '☀ Light'}
          </button>
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          aria-label={mobileNavOpen ? 'Close mobile menu' : 'Open mobile menu'}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          ☰
        </button>
      </header>

      {mobileNavOpen ? (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setMobileNavOpen(false)}>
              {item.label}
            </a>
          ))}
          {isLoggedIn ? (
            <>
              <button type="button" className="mobile-auth-button" onClick={() => { setMobileNavOpen(false); openAccount('profile') }}>
                My Account
              </button>
              <button type="button" className="mobile-auth-button primary" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <button type="button" className="mobile-auth-button" onClick={() => openAuthModal('login')}>
                Log In
              </button>
              <button type="button" className="mobile-auth-button primary" onClick={() => openAuthModal('signup')}>
                Sign Up
              </button>
            </>
          )}
          <button
            type="button"
            className="theme-toggle mobile-theme-toggle"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? '🌙 Dark' : '☀ Light'}
          </button>
        </nav>
      ) : null}

      {authModalOpen ? (
        <div className="auth-modal-backdrop auth-fullscreen-backdrop" onClick={() => setAuthModalOpen(false)}>
          <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="auth-close" aria-label="Close auth form" onClick={() => setAuthModalOpen(false)}>
              ×
            </button>

            <div className="auth-header">
              <span className="eyebrow">LORA account</span>
              <h2 id="auth-title">
                {authMode === 'login'
                  ? 'Welcome back'
                  : authMode === 'signup'
                    ? 'Create your LORA account'
                    : authMode === 'reset'
                      ? 'Reset your password'
                      : 'Choose a new password'}
              </h2>
            </div>

            {authMode === 'login' || authMode === 'signup' ? <div className="auth-toggle" aria-label="Account mode switcher">
              <button
                type="button"
                className={authMode === 'login' ? 'auth-tab active' : 'auth-tab'}
                onClick={() => {
                  setAuthMode('login')
                  setAuthMessage('')
                }}
              >
                Log In
              </button>
              <button
                type="button"
                className={authMode === 'signup' ? 'auth-tab active' : 'auth-tab'}
                onClick={() => {
                  setAuthMode('signup')
                  setAuthMessage('')
                }}
              >
                Sign Up
              </button>
            </div> : null}

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === 'signup' ? (
                <label>
                  Name
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>
              ) : null}

              {authMode !== 'recovery' ? <label>
                Email
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label> : null}

              {authMode !== 'reset' ? <label>
                {authMode === 'recovery' ? 'New password' : 'Password'}
                <div className="password-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={authForm.password}
                    onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="••••••••"
                    autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </label> : null}

              {authMode === 'signup' || authMode === 'recovery' ? (
                <label>
                  Confirm password
                  <div className="password-wrap">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={authForm.confirmPassword}
                      onChange={(event) => setAuthForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                      placeholder="Confirm password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      onClick={() => setShowConfirmPassword((current) => !current)}
                    >
                      {showConfirmPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </label>
              ) : null}

              {authMode === 'login' ? (
                <div className="auth-meta-row">
                  <button type="button" className="text-link" onClick={() => { setAuthMode('reset'); setAuthMessage('') }}>
                    Forgot password?
                  </button>
                </div>
              ) : null}

              <button type="submit" className="checkout-btn" disabled={authLoading || Boolean(oauthLoading)}>
                {authLoading
                  ? 'Please wait...'
                  : authMode === 'login'
                    ? 'Log In'
                    : authMode === 'signup'
                      ? 'Create Account'
                      : authMode === 'reset'
                        ? 'Send reset link'
                        : 'Update password'}
              </button>
            </form>

            {authMode === 'login' || authMode === 'signup' ? <>
            <div className="social-auth-divider"><span>or continue with</span></div>
            <div className="social-auth-options">
              {socialProviders.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  className="social-auth-button"
                  onClick={() => handleSocialAuth(provider.id)}
                  disabled={authLoading || Boolean(oauthLoading)}
                  aria-label={`Continue with ${provider.name}`}
                >
                  <span>{oauthLoading === provider.id ? 'Connecting...' : provider.name}</span>
                </button>
              ))}
            </div>
            </> : null}

            {authMessage ? <p className="checkout-message" role="alert">{authMessage}</p> : null}

            {authMode === 'login' || authMode === 'signup' ? <p className="auth-switch">
              {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button type="button" className="text-link" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
                {authMode === 'login' ? 'Create one' : 'Log In'}
              </button>
            </p> : <p className="auth-switch">
              <button type="button" className="text-link" onClick={() => { setAuthMode('login'); setAuthMessage('') }}>
                Back to Log In
              </button>
            </p>}
            <button
              type="button"
              className="auth-help-shortcut"
              onClick={() => { setHelpContext(authMode); setHelpOpen(true) }}
            >
              Need help? Ask Lora
            </button>
          </div>
        </div>
      ) : null}

      {accountModalOpen ? (
        <div className="auth-modal-backdrop" onClick={() => setAccountModalOpen(false)}>
          <section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="account-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="auth-close" aria-label="Close account" onClick={() => setAccountModalOpen(false)}>
              ×
            </button>
            <div className="auth-header">
              <span className="eyebrow">Your account</span>
              <h2 id="account-title">Account settings</h2>
            </div>

            <div className="auth-toggle account-tabs" aria-label="Account sections">
              {[
                ['profile', 'Profile'],
                ['settings', 'Preferences'],
                ['billing', 'Billing'],
              ].map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  className={accountTab === tab ? 'auth-tab active' : 'auth-tab'}
                  onClick={() => { setAccountTab(tab); setAccountMessage(''); setAccountError('') }}
                >
                  {label}
                </button>
              ))}
            </div>

            {accountLoading ? <p className="account-feedback" role="status">Loading your account...</p> : null}
            {accountError ? <p className="checkout-message" role="alert">{accountError}</p> : null}
            {accountMessage ? <p className="account-feedback" role="status">{accountMessage}</p> : null}

            {accountTab === 'profile' ? (
              <form className="auth-form" onSubmit={handleSaveProfile}>
                <label>
                  Name
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))}
                    autoComplete="name"
                    required
                  />
                </label>
                <label>
                  Email
                  <input type="email" value={currentUser?.email || ''} readOnly />
                </label>
                <button type="submit" className="checkout-btn" disabled={profileSaving || accountLoading}>
                  {profileSaving ? 'Saving...' : 'Save profile'}
                </button>
              </form>
            ) : null}

            {accountTab === 'settings' ? (
              <form className="auth-form" onSubmit={handleSaveProfile}>
                <label>
                  Assistant response style
                  <select
                    value={profileForm.assistantStyle}
                    onChange={(event) => setProfileForm((current) => ({ ...current, assistantStyle: event.target.value }))}
                  >
                    <option value="balanced">Balanced</option>
                    <option value="concise">Concise</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </label>
                <button type="submit" className="checkout-btn" disabled={profileSaving || accountLoading}>
                  {profileSaving ? 'Saving...' : 'Save preferences'}
                </button>
              </form>
            ) : null}

            {accountTab === 'billing' ? (
              <div className="account-billing">
                <div className="account-plan-row">
                  <span>Current plan</span>
                  <strong>{plans.find((plan) => plan.id === currentSubscription?.plan)?.name || 'No plan activated'}</strong>
                </div>
                <div className="account-plan-row">
                  <span>Status</span>
                  <strong>{currentSubscription?.status || 'No subscription'}</strong>
                </div>
                {currentSubscription?.current_period_end ? (
                  <div className="account-plan-row">
                    <span>Current period ends</span>
                    <strong>{new Date(currentSubscription.current_period_end).toLocaleDateString()}</strong>
                  </div>
                ) : null}
                {currentSubscription && (currentSubscription.plan !== 'free' || currentSubscription.status !== 'active') ? (
                  <button type="button" className="checkout-btn" onClick={handleBillingPortal} disabled={checkoutLoading}>
                    {checkoutLoading ? 'Opening billing...' : 'Manage billing'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="checkout-btn"
                    onClick={() => { setAccountModalOpen(false); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) }}
                  >
                    View plans
                  </button>
                )}
                <button type="button" className="text-link account-refresh" onClick={handleRefreshSubscription} disabled={accountLoading}>
                  Refresh plan status
                </button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">Premium AI experience</span>
            <h1>Think clearly. Work calmly. Learn with less friction.</h1>
            <p className="hero-text">
              LORA AI brings together thinking support, practical guidance, and a living interface that feels intuitive across work, study, and everyday life.
            </p>

            <div className="hero-actions">
              <button type="button" className="primary-btn" onClick={() => openAuthModal('signup')}>
                Create an account
              </button>
              <a href="#features" className="secondary-btn">
                See what LORA offers
              </a>
            </div>

            <ul className="hero-meta" aria-label="LORA benefits">
              <li>Responsive by design</li>
              <li>Built for everyday people</li>
              <li>Professional, clear, and calming</li>
            </ul>
          </div>

          <div className="hero-visual">
            <div className="welcome-shell">
              <span className="welcome-wordmark">Lora</span>
              <h2>Hi, I&apos;m Lora. I&apos;m here to assist you.</h2>
              <p>Ask me anything or choose something below to get started.</p>
              <div className="welcome-topics">
                <a href="#learn">Learn</a>
                <a href="#features">Write</a>
                <a href="#pricing">Plan</a>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="features">
          <div className="section-heading">
            <span className="eyebrow">What makes LORA different</span>
            <h2>A premium assistant with presence, clarity, and utility.</h2>
          </div>

          <div className="feature-grid">
            {featureCards.map((feature) => (
              <article key={feature.title} className="feature-card">
                <span className="feature-badge">{feature.badge}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section learn-section" id="learn">
          <div className="section-heading compact">
            <span className="eyebrow">Learn LORA</span>
            <h2>Friendly, practical learning for real life and real work.</h2>
          </div>

          <div className="learn-grid">
            {learningPaths.map((item) => (
              <article key={item.title} className="learning-card">
                <div className="learning-header">
                  <span className="mini-tag">{item.level}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section prompt-section">
          <div className="section-heading compact">
            <span className="eyebrow">Prompt formula</span>
            <h2>Better prompts lead to clearer support.</h2>
          </div>

          <div className="prompt-box">
            <div className="formula">
              <span>Goal</span>
              <span>Context</span>
              <span>Details</span>
              <span>Desired output</span>
            </div>

            <div className="prompt-list">
              {promptExamples.map((prompt) => (
                <div key={prompt} className="prompt-item">
                  <p>{prompt}</p>
                  <button type="button" onClick={() => handleCopy(prompt)} className="copy-btn">
                    {copiedPrompt === prompt ? 'Copied' : 'Copy prompt'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section founder-section" id="founder">
          <div className="founder-card">
            <div className="founder-monogram" aria-hidden="true">LRB</div>

            <div className="founder-copy">
              <span className="eyebrow">Created by Larry Rimamsikwe Bulus</span>
              <h2>Built to make AI useful, accessible, and calm for everyday life.</h2>
              <p>
                LORA AI was created by Larry Rimamsikwe Bulus and developed under Larry Technologies. The goal is simple: create an assistant that feels helpful without becoming overwhelming, and useful without requiring technical expertise.
              </p>
              <p>
                The product is shaped around everyday clarity—study support, work planning, better communication, and a digital experience that feels focused rather than noisy.
              </p>
            </div>
          </div>
        </section>

        <section className="section download-section" id="download">
          <div className="section-heading compact">
            <span className="eyebrow">Download LORA</span>
            <h2>Desktop and mobile installers are not available yet.</h2>
          </div>

          <div className="download-grid">
            {downloadOptions.map((item) => (
              <article key={item.platform} className="download-card">
                <div className="download-topline">
                  <span className="platform-tag">{item.platform}</span>
                  <span className="platform-note">{item.note}</span>
                </div>
                <h3>{item.platform}</h3>
                <p className="download-unavailable">LORA has not published an installer for this platform yet.</p>
                <button type="button" className="download-btn" disabled>
                  {item.action}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="section pricing-section" id="pricing">
          <div className="section-heading compact">
            <span className="eyebrow">Simple plans</span>
            <h2>Choose the level that matches your pace.</h2>
          </div>

          <div className="billing-wrap">
            <div className="pricing-grid">
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`pricing-card ${plan.highlight ? 'featured' : ''} ${selectedPlan === plan.name ? 'selected' : ''}`}
                >
                  <h3>{plan.name}</h3>
                  <div className="price-row">
                    <span className="price">{getPlanPrice(plan).price}</span>
                    <span className="billing">
                      {getPlanPrice(plan).period}
                    </span>
                  </div>
                  <p>{plan.description}</p>
                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <button type="button" className="plan-btn" onClick={() => setSelectedPlan(plan.name)}>
                    {selectedPlan === plan.name ? 'Selected' : `Choose ${plan.name}`}
                  </button>
                </article>
              ))}
            </div>

            <aside className="billing-panel">
              <div className="billing-header">
                <span className="eyebrow small-eyebrow">Your selection</span>
                <h3>Review your plan</h3>
                <p>Everything is clear before you continue.</p>
              </div>

              <div className="order-plan">
                <div>
                  <span className="order-label">Selected plan</span>
                  <strong>{activePlan.name}</strong>
                </div>
                <div className="order-price">
                  <strong>{getPlanPrice(activePlan).price}</strong>
                  <span>{getPlanPrice(activePlan).period}</span>
                </div>
              </div>

              <ul className="order-features">
                {activePlan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="checkout-note">
                <span className="checkout-lock" aria-hidden="true">✦</span>
                <p>Payment details should be entered only on LORA&apos;s secure payment-provider checkout. We never store your card number or security code.</p>
              </div>

              <button type="button" className="checkout-btn" onClick={handleCheckout} disabled={checkoutLoading}>
                {checkoutLoading
                  ? 'Please wait...'
                  : !isLoggedIn
                    ? activePlan.id === 'free' ? 'Create account to activate free plan' : 'Create account to continue'
                    : activePlan.id === 'free' ? 'Activate free plan' : 'Continue to secure checkout'}
              </button>

              <p className="billing-terms">
                {activePlan.id === 'free'
                  ? 'The free plan requires an account but does not require payment.'
                  : 'Stripe Checkout will show the configured billing period and amount before payment.'}
              </p>

              {checkoutMessage ? (
                <p className={`checkout-message ${checkoutMessageType}`} role={checkoutMessageType === 'error' ? 'alert' : 'status'}>
                  {checkoutMessage}
                </p>
              ) : null}
            </aside>
          </div>
        </section>

        <section className="section faq-section">
          <div className="section-heading compact">
            <span className="eyebrow">Frequently asked questions</span>
            <h2>Clear answers without confusing technical detail.</h2>
          </div>

          <div className="faq-list">
            {faqs.map((item) => (
              <details key={item.question} className="faq-item" open={item.question === 'What is LORA AI?'}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <div className="brand-mark small" aria-hidden="true">
            <span className="brand-core" />
          </div>
          <div>
            <div className="brand-name">LORA AI</div>
            <div className="brand-tag">A product by Larry Technologies</div>
          </div>
        </div>

        <div className="footer-meta">
          <span>Created by Larry Rimamsikwe Bulus</span>
          <a href="#learn">Learn LORA</a>
          <a href="#download">Download</a>
          <a href="#pricing">Pricing</a>
        </div>
      </footer>

      {helpOpen ? (
        <section className={`help-panel${authModalOpen ? ' help-panel-on-auth' : ''}`} role="dialog" aria-modal="false" aria-labelledby="help-title">
          <header className="help-header">
            <div>
              <span className="eyebrow">Website guide</span>
              <h2 id="help-title">Ask Lora</h2>
            </div>
            <button type="button" className="help-close" aria-label="Close help" onClick={() => setHelpOpen(false)}>
              ×
            </button>
          </header>
          <p className="help-context">
            {helpContext === 'billing' ? 'Here on Pricing' : helpContext === 'account' ? 'In account settings' : 'Around LORA'}
          </p>
          <div className="help-messages" role="log" aria-live="polite" aria-relevant="additions">
            {helpMessages.map((message, index) => (
              <p key={`${message.role}-${index}`} className={`help-message ${message.role}`}>
                {message.text}
              </p>
            ))}
          </div>
          <div className="help-suggestions" aria-label="Suggested questions">
            <button type="button" onClick={() => sendHelpMessage('How do I create an account?')}>Create an account</button>
            <button type="button" onClick={() => sendHelpMessage('How do I manage billing?')}>Manage billing</button>
          </div>
          <form className="help-form" onSubmit={(event) => { event.preventDefault(); sendHelpMessage() }}>
            <label className="visually-hidden" htmlFor="help-question">Ask a question about this website</label>
            <input
              id="help-question"
              type="text"
              value={helpInput}
              onChange={(event) => setHelpInput(event.target.value)}
              placeholder="Ask about accounts or plans"
              autoComplete="off"
            />
            <button type="submit" disabled={!helpInput.trim()}>Send</button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="help-trigger"
        aria-expanded={helpOpen}
        aria-controls="help-title"
        onClick={() => setHelpOpen((open) => !open)}
      >
        {helpOpen ? 'Close help' : 'Need help?'}
      </button>
    </div>
  )
}

export default App
