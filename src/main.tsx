import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { AppRouter } from './routes/app-router.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
