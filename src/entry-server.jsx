import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { initI18n } from './i18n'
import App from './App.jsx'

/** Renders a route to HTML at build time (see scripts/prerender.mjs). */
export async function render(url) {
  await initI18n()
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  )
}
