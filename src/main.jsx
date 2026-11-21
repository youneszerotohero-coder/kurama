import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import i18n, { initI18n } from './i18n'
import './index.css'
import App from './App.jsx'

const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

initI18n().finally(() => {
  const container = document.getElementById('root')
  const prerendered = container.hasChildNodes() && !document.documentElement.classList.contains('no-prerender') && i18n.language === 'fr'
  if (prerendered) {
    // The home page was rendered at build time: reuse that DOM instead of rebuilding it
    hydrateRoot(container, app)
  } else {
    container.textContent = ''
    createRoot(container).render(app)
  }
  requestAnimationFrame(() => document.documentElement.classList.remove('no-prerender'))
})
