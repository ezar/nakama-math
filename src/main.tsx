import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App'

registerSW({
  onNeedRefresh() {
    // Silent auto-update — the SW uses 'autoUpdate' strategy
  },
  onOfflineReady() {
    console.log('Nakama Math listo para usar sin conexión')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
