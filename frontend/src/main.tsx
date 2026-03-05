import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { ListsProvider } from './context/ListsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ListsProvider>
        <App />
      </ListsProvider>
    </ThemeProvider>
  </StrictMode>,
)
