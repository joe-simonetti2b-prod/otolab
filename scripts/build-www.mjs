// Assemble www/index.html (document complet, polices embarquées, fonctionne hors ligne)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
const W = 'web/', O = 'www/';
mkdirSync(O + 'fonts', { recursive: true });
const fonts = [
  ['@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2', 'archivo-latin.woff2'],
  ['@fontsource-variable/archivo/files/archivo-latin-ext-wdth-normal.woff2', 'archivo-latin-ext.woff2'],
  ...['400', '500', '600', '700'].map(w => [`@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-${w}-normal.woff2`, `plex-sans-${w}.woff2`]),
  ...['400', '500', '600'].map(w => [`@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-${w}-normal.woff2`, `plex-mono-${w}.woff2`])
];
fonts.forEach(([src, dst]) => copyFileSync('node_modules/' + src, O + 'fonts/' + dst));
const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const ff = [
  `@font-face{font-family:'Archivo';font-style:normal;font-display:swap;font-weight:100 900;font-stretch:62% 125%;src:url(fonts/archivo-latin.woff2) format('woff2');unicode-range:${LATIN}}`,
  `@font-face{font-family:'Archivo';font-style:normal;font-display:swap;font-weight:100 900;font-stretch:62% 125%;src:url(fonts/archivo-latin-ext.woff2) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1E00-1E9F,U+A720-A7FF}`,
  ...['400', '500', '600', '700'].map(w => `@font-face{font-family:'IBM Plex Sans';font-style:normal;font-display:swap;font-weight:${w};src:url(fonts/plex-sans-${w}.woff2) format('woff2')}`),
  ...['400', '500', '600'].map(w => `@font-face{font-family:'IBM Plex Mono';font-style:normal;font-display:swap;font-weight:${w};src:url(fonts/plex-mono-${w}.woff2) format('woff2')}`)
].join('\n');
const base = `:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body{margin:0}[hidden]{display:none!important}img{max-width:100%}
body::before{content:'';position:fixed;top:0;left:0;right:0;height:env(safe-area-inset-top,0px);background:var(--bg);z-index:60}
html.native{-webkit-user-select:none;user-select:none}html.native input{-webkit-user-select:text;user-select:text}`;
const js = ['core', 'patho', 'fit', 'sim', 'learn', 'pedia', 'clinic', 'stats', 'native'].map(f => readFileSync(W + f + '.js', 'utf8')).join('\n');
const html = `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#EEF0EC">
<title>OtoLab</title>
<style>${ff}\n${base}\n${readFileSync(W + 'styles.css', 'utf8')}</style>
</head><body>
${readFileSync(W + 'shell.html', 'utf8')}
<script>${js}</script>
</body></html>`;
writeFileSync(O + 'index.html', html);
console.log('www/index.html', html.length, 'octets');
