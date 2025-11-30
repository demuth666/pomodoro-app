import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SettingsProvider } from './context/SettingsContext'
import { AuthProvider } from './context/AuthContext'
import { TimerProvider } from './context/TimerContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>

      <BrowserRouter>
        <AuthProvider>
             <SettingsProvider>
               <TimerProvider>
                  <App />
               </TimerProvider>
             </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
  </StrictMode>,
)
