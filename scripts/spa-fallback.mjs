// GitHub Pages has no SPA rewrites: serving index.html as 404.html makes
// deep links (e.g. /cartly/products/iphone-5s) load the app, which then
// renders the right route.
import { copyFileSync } from 'node:fs'

copyFileSync('dist/index.html', 'dist/404.html')
console.log('dist/404.html created (SPA fallback for GitHub Pages)')
