import React from 'react'
import ReactDOM from 'react-dom/client'
import { bridge } from './app/bridge'
import { AppProviders } from './app/providers'
import App from './App'

bridge.send('VKWebAppInit').catch(() => {
  // Running outside VK (browser dev) — ignore.
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
)
