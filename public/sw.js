if(!self.define){let e,s={};const c=(c,a)=>(c=new URL(c+".js",a).href,s[c]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=c,e.onload=s,document.head.appendChild(e)}else e=c,importScripts(c),s()})).then((()=>{let e=s[c];if(!e)throw new Error(`Module ${c} didn’t register its module`);return e})));self.define=(a,n)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(s[i])return;let t={};const r=e=>c(e,i),d={module:{uri:i},exports:t,require:r};s[i]=Promise.all(a.map((e=>d[e]||r(e)))).then((e=>(n(...e),t)))}}define(["./workbox-588899ac"],(function(e){"use strict";importScripts("worker-pAMjdoO074NUDW7905Q65.js"),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/chunks/0c428ae2-5f69f8a1c91e1ff7.js",revision:"5f69f8a1c91e1ff7"},{url:"/_next/static/chunks/17007de1-babd912c8b22c9ae.js",revision:"babd912c8b22c9ae"},{url:"/_next/static/chunks/186-04269d6c3b82254b.js",revision:"04269d6c3b82254b"},{url:"/_next/static/chunks/193-b81fa63146c10737.js",revision:"b81fa63146c10737"},{url:"/_next/static/chunks/1a48c3c1-ab5b04a706ee662f.js",revision:"ab5b04a706ee662f"},{url:"/_next/static/chunks/1bfc9850-506284d86379ae47.js",revision:"506284d86379ae47"},{url:"/_next/static/chunks/203-8ef0fffa9724cc0b.js",revision:"8ef0fffa9724cc0b"},{url:"/_next/static/chunks/211-0f9f20a18ab3b93d.js",revision:"0f9f20a18ab3b93d"},{url:"/_next/static/chunks/252f366e-f330ec829a60f41d.js",revision:"f330ec829a60f41d"},{url:"/_next/static/chunks/367-13d8cdb4873df12c.js",revision:"13d8cdb4873df12c"},{url:"/_next/static/chunks/664-8af8765c6fed5950.js",revision:"8af8765c6fed5950"},{url:"/_next/static/chunks/675-776579f876d79137.js",revision:"776579f876d79137"},{url:"/_next/static/chunks/75fc9c18-36f994258e23e278.js",revision:"36f994258e23e278"},{url:"/_next/static/chunks/78e521c3-3b8c62cc6fd98ab8.js",revision:"3b8c62cc6fd98ab8"},{url:"/_next/static/chunks/7f0c75c1-52bf2c4b9d66fa45.js",revision:"52bf2c4b9d66fa45"},{url:"/_next/static/chunks/837-cdbce2dfb7e34de4.js",revision:"cdbce2dfb7e34de4"},{url:"/_next/static/chunks/893-4da87073d589307c.js",revision:"4da87073d589307c"},{url:"/_next/static/chunks/d0c16330-e5c6342fde1244f6.js",revision:"e5c6342fde1244f6"},{url:"/_next/static/chunks/d64684d8-78124f2dbd842cc7.js",revision:"78124f2dbd842cc7"},{url:"/_next/static/chunks/d7eeaac4-a89bafc95fbc39f2.js",revision:"a89bafc95fbc39f2"},{url:"/_next/static/chunks/de71a805-39b6855ea254348a.js",revision:"39b6855ea254348a"},{url:"/_next/static/chunks/framework-2c79e2a64abdb08b.js",revision:"2c79e2a64abdb08b"},{url:"/_next/static/chunks/main-41c7a067006caf69.js",revision:"41c7a067006caf69"},{url:"/_next/static/chunks/pages/%5Busername%5D-5a67a45e72babd19.js",revision:"5a67a45e72babd19"},{url:"/_next/static/chunks/pages/404-c923d63fb19ada7c.js",revision:"c923d63fb19ada7c"},{url:"/_next/static/chunks/pages/_app-d817bb743b5237f8.js",revision:"d817bb743b5237f8"},{url:"/_next/static/chunks/pages/_error-54de1933a164a1ff.js",revision:"54de1933a164a1ff"},{url:"/_next/static/chunks/pages/friends-34f153d5513df9a5.js",revision:"34f153d5513df9a5"},{url:"/_next/static/chunks/pages/index-cd39071d33111341.js",revision:"cd39071d33111341"},{url:"/_next/static/chunks/pages/login-355ee8aed4a18755.js",revision:"355ee8aed4a18755"},{url:"/_next/static/chunks/pages/messenger-07337c6574c091ce.js",revision:"07337c6574c091ce"},{url:"/_next/static/chunks/pages/notification-e8a7747b234c9b87.js",revision:"e8a7747b234c9b87"},{url:"/_next/static/chunks/pages/posts/bookmarked-1ef21f31801b28b4.js",revision:"1ef21f31801b28b4"},{url:"/_next/static/chunks/pages/register-9c55bd279a3293ad.js",revision:"9c55bd279a3293ad"},{url:"/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"837c0df77fd5009c9e46d446188ecfd0"},{url:"/_next/static/chunks/webpack-36d12a75f0098f30.js",revision:"36d12a75f0098f30"},{url:"/_next/static/css/775c4e8e19fe6075.css",revision:"775c4e8e19fe6075"},{url:"/_next/static/css/7e9ff974f95363ac.css",revision:"7e9ff974f95363ac"},{url:"/_next/static/css/e51a7c10aeacf3cb.css",revision:"e51a7c10aeacf3cb"},{url:"/_next/static/pAMjdoO074NUDW7905Q65/_buildManifest.js",revision:"1b4be19ac022de77936e18a949fb0326"},{url:"/_next/static/pAMjdoO074NUDW7905Q65/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/android-chrome-192x192.png",revision:"f7df784d917680a8eb60e1f2b0c333ea"},{url:"/android-chrome-512x512.png",revision:"e731b54e19ba1ae8ba5ed80bf8ed3dd2"},{url:"/apple-touch-icon.png",revision:"3cc1cc3d6b0990d6fe3c15675c533330"},{url:"/favicon-16x16.png",revision:"c2058debc0f3e164a7cf260c15e54f83"},{url:"/favicon-32x32.png",revision:"88fa49ad452adbeb421def9b9311a282"},{url:"/favicon.ico",revision:"c30c7d42707a47a3f4591831641e50dc"},{url:"/images/facebook-reactions.gif",revision:"8e756e848825818d50bd123f8a6bddfd"},{url:"/images/facebook-reactions.png",revision:"bd72eb93f3238add18697d62d1bc9deb"},{url:"/manifest.json",revision:"de9ded7379a660688aa69964eff4a1bd"},{url:"/robots.txt",revision:"fc0006d5049c6b5aa2652ff191c332d2"},{url:"/sitemap-0.xml",revision:"e45eeb12cd7b7dadee3348e19a823938"},{url:"/sitemap.xml",revision:"534a189d7c9d8ca3f7258b08383b5259"},{url:"/vercel.svg",revision:"26bf2d0adaf1028a4d4c6ee77005e819"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:c,state:a})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
