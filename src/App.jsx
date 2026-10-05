import { useEffect, useState } from 'react'
import './App.css'
import { authService } from './lib/auth'

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
    name: 'Free Trial',
    price: '₦0',
    monthly: 0,
    description: 'Explore the learning center and get comfortable with the product.',
    features: ['Basic assistant access', 'Learning path previews', 'Helpful onboarding'],
  },
  {
    name: 'Basic',
    price: '₦3,950',
    monthly: 3950,
    description: 'Built for focused day-to-day work and deeper personal productivity.',
    features: ['Full assistant access', 'Voice-ready workflows', 'Priority learning resources'],
    highlight: true,
  },
  {
    name: 'Pro',
    price: '₦50,090',
    monthly: 50090,
    description: 'Ideal for founders, teams, and professionals who need structure and speed.',
    features: ['Shared workflows', 'Business templates', 'Advanced planning support'],
  },
]

const downloadOptions = [
  {
    platform: 'Windows',
    note: 'Installer .exe',
    packages: ['LORA AI Setup.exe', '.msi', '.zip'],
    action: 'Download for Windows',
  },
  {
    platform: 'Mac',
    note: 'Apple Silicon + Intel',
    packages: ['LORA AI.dmg', '.pkg', '.zip'],
    action: 'Download for Mac',
  },
  {
    platform: 'iPhone',
    note: 'iOS app',
    packages: ['App Store', 'TestFlight'],
    action: 'Install on iPhone',
  },
  {
    platform: 'Android',
    note: 'Android app',
    packages: ['APK', 'AAB'],
    action: 'Download for Android',
  },
  {
    platform: 'Linux',
    note: 'Debian / RPM',
    packages: ['.deb', '.rpm', '.AppImage'],
    action: 'Download for Linux',
  },
]

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Learn', href: '#learn' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Download', href: '#download' },
]

const socialProviders = [
  { id: 'google', name: 'Google', mark: 'G' },
  { id: 'apple', name: 'Apple', mark: 'A' },
  { id: 'microsoft', name: 'Microsoft', mark: 'M' },
  { id: 'github', name: 'GitHub', mark: 'GH' },
]

function App() {
  const [copiedPrompt, setCopiedPrompt] = useState('')
  const [pointer, setPointer] = useState({ x: 50, y: 32 })
  const [selectedPlan, setSelectedPlan] = useState('Basic')
  const [checkoutMessage, setCheckoutMessage] = useState('')
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

  useEffect(() => {
    const handleMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 100
      const y = (event.clientY / window.innerHeight) * 100
      setPointer({ x, y })
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setAuthModalOpen(false)
        setAccountMenuOpen(false)
      }
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const activePlan = plans.find((plan) => plan.name === selectedPlan) ?? plans[1]

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode)
    setAuthMessage('')
    setAuthForm({ name: '', email: '', password: '', confirmPassword: '' })
    setShowPassword(false)
    setShowConfirmPassword(false)
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

  const handleCheckout = () => {
    if (!isLoggedIn) {
      openAuthModal('signup')
      return
    }

    setCheckoutMessage('Secure checkout is not connected yet. No payment has been taken and your plan has not changed.')
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthMessage('')

    const email = authForm.email.trim()
    const password = authForm.password.trim()

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

      const nextUser = response?.user ?? {
        name: authForm.name.trim() || email.split('@')[0],
        email,
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

  const handleSocialAuth = (provider) => {
    setAuthMessage('')
    setOauthLoading(provider)

    try {
      window.location.assign(authService.getOAuthUrl(provider))
    } catch (error) {
      setAuthMessage(error.message || 'Unable to start sign in. Please try again.')
      setOauthLoading('')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setAccountMenuOpen(false)
    setAuthModalOpen(false)
    setAuthMessage('')
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
                  <button type="button">My Account</button>
                  <button type="button">Billing</button>
                  <button type="button">Downloads</button>
                  <button type="button">Settings</button>
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
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          aria-label="Open mobile menu"
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
          <button type="button" className="mobile-auth-button" onClick={() => openAuthModal('login')}>
            Log In
          </button>
          <button type="button" className="mobile-auth-button primary" onClick={() => openAuthModal('signup')}>
            Sign Up
          </button>
        </nav>
      ) : null}

      {authModalOpen ? (
        <div className="auth-modal-backdrop" onClick={() => setAuthModalOpen(false)}>
          <div className="auth-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="auth-close" aria-label="Close auth form" onClick={() => setAuthModalOpen(false)}>
              ×
            </button>

            <div className="auth-header">
              <span className="eyebrow">LORA account</span>
              <h2>{authMode === 'login' ? 'Welcome back' : 'Create your LORA account'}</h2>
            </div>

            <div className="auth-toggle" aria-label="Account mode switcher">
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
            </div>

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

              <label>
                Email
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>

              <label>
                Password
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
              </label>

              {authMode === 'signup' ? (
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
                  <label className="checkbox-row">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <button type="button" className="text-link" onClick={() => setAuthMessage('Password reset is configured in the auth backend.')}>
                    Forgot password?
                  </button>
                </div>
              ) : null}

              <button type="submit" className="checkout-btn" disabled={authLoading || Boolean(oauthLoading)}>
                {authLoading
                  ? 'Please wait...'
                  : authMode === 'login'
                    ? 'Log In'
                    : 'Create Account'}
              </button>
            </form>

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
                  <span className={`provider-mark provider-mark-${provider.id}`} aria-hidden="true">
                    {provider.mark}
                  </span>
                  <span>{oauthLoading === provider.id ? 'Connecting...' : provider.name}</span>
                </button>
              ))}
            </div>

            {authMessage ? <p className="checkout-message">{authMessage}</p> : null}

            <p className="auth-switch">
              {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button type="button" className="text-link" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
                {authMode === 'login' ? 'Create one' : 'Log In'}
              </button>
            </p>
          </div>
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
                Try LORA AI
              </button>
              <a href="#features" className="secondary-btn">
                Explore LORA
              </a>
            </div>

            <ul className="hero-meta" aria-label="LORA benefits">
              <li>Responsive by design</li>
              <li>Built for everyday people</li>
              <li>Professional, clear, and calming</li>
            </ul>
          </div>

          <div className="hero-visual" aria-label="LORA AI animated interface preview">
            <div className="visual-shell">
              <div className="orb-wrap">
                <div className="orb-glow" aria-hidden="true" />
                <div className="orb-core" aria-hidden="true" />
                <div className="orb-ring ring-one" aria-hidden="true" />
                <div className="orb-ring ring-two" aria-hidden="true" />
              </div>

              <div className="status-panel">
                <div>
                  <span className="status-label">LORA status</span>
                  <strong>Listening calmly</strong>
                </div>
                <span className="status-dot" aria-hidden="true" />
              </div>

              <div className="wave-panel" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
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
            <div className="founder-portrait" aria-label="Founder portrait placeholder">
              <div className="portrait-ring" />
              <div className="portrait-core" />
            </div>

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
            <h2>Install LORA AI on the devices you use most.</h2>
          </div>

          <div className="download-grid">
            {downloadOptions.map((item) => (
              <article key={item.platform} className="download-card">
                <div className="download-topline">
                  <span className="platform-tag">{item.platform}</span>
                  <span className="platform-note">{item.note}</span>
                </div>
                <h3>{item.platform}</h3>
                <div className="package-list">
                  {item.packages.map((packageName) => (
                    <span key={packageName} className="package-badge">{packageName}</span>
                  ))}
                </div>
                <button type="button" className="download-btn">
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
                    <span className="price">{plan.price}</span>
                    <span className="billing">
                      {plan.monthly === 0 ? '2-day trial' : 'Billing interval to be confirmed'}
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
                  <strong>{activePlan.price}</strong>
                  <span>{activePlan.monthly === 0 ? 'No charge' : 'Billing period to be confirmed'}</span>
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

              <button type="button" className="checkout-btn" onClick={handleCheckout}>
                {isLoggedIn ? 'Continue to secure checkout' : 'Create account to continue'}
              </button>

              <p className="billing-terms">
                {activePlan.monthly === 0
                  ? 'The free trial does not automatically become a paid plan.'
                  : 'You will see the billing interval and final amount before authorizing payment.'}
              </p>

              {checkoutMessage ? <p className="checkout-message" role="status">{checkoutMessage}</p> : null}
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
    </div>
  )
}

export default App
