// FILE 3: Update to pages/_app.js
import '../styles/globals.css'
import { useEffect } from 'react'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SAYER: Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.log('SAYER: Service Worker registration failed:', error);
        });
    }

    // Request notification permission
    if ('Notification' in window && navigator.serviceWorker) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          console.log('SAYER: Notification permission:', permission);
        });
      }
    }
  }, []);

  return <Component {...pageProps} />
}