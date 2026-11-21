/*
  Build step: renders the home page to static HTML and injects it into dist/index.html.
  Browsers paint the header and the hero before any JavaScript runs (faster first paint and LCP),
  and crawlers get real content. The client then renders the app over it with createRoot.
*/
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const htmlPath = path.join(root, 'dist', 'index.html')
const entry = path.join(root, 'dist-ssr', 'entry-server.js')

const { render } = await import(pathToFileURL(entry).href)
const appHtml = await render('/')

// The static markup only matches the French home page: hide it elsewhere until the app renders
const guard = `<script>(function(){try{var l=localStorage.getItem('i18nextLng')||'';var n=(navigator.language||'').toLowerCase();if(location.pathname!=='/'||(l&&l.slice(0,2)!=='fr')||(!l&&n.indexOf('ar')===0))document.documentElement.classList.add('no-prerender')}catch(e){}})()</script><style>.no-prerender #root{visibility:hidden}</style>`

let html = fs.readFileSync(htmlPath, 'utf8')
if (!html.includes('<div id="root"></div>')) throw new Error('index.html: empty #root not found')
html = html.replace('</head>', `    ${guard}\n  </head>`).replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
fs.writeFileSync(htmlPath, html)
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`prerendered / (${(appHtml.length / 1024).toFixed(1)} KB of HTML)`)
