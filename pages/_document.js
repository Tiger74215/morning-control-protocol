// FILE 4: Update to pages/_document.js (NEW FILE)
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="application-name" content="SAYER Agent" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SAYER Agent" />
        <meta name="description" content="Your personal autonomous AI assistant" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#1a1a2e" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />

        <link rel="apple-touch-icon" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="32x32" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="16x16" href="/manifest.json" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/manifest.json" color="#3b82f6" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://yourapp.vercel.app" />
        <meta name="twitter:title" content="SAYER Agent" />
        <meta name="twitter:description" content="Your personal autonomous AI assistant" />
        <meta name="twitter:image" content="/manifest.json" />
        <meta name="twitter:creator" content="@your_handle" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="SAYER Agent" />
        <meta property="og:description" content="Your personal autonomous AI assistant" />
        <meta property="og:site_name" content="SAYER Agent" />
        <meta property="og:url" content="https://yourapp.vercel.app" />
        <meta property="og:image" content="/manifest.json" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}