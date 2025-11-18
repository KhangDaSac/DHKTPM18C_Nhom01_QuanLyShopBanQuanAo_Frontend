import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './contexts/authContext.tsx'
import { ProductProvider } from './contexts/productContext.tsx'
import { FavoritesProvider } from './contexts/favoritesContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <FavoritesProvider>
        <ProductProvider>
          <App />
        </ProductProvider>
      </FavoritesProvider>
    </AuthProvider>
  </StrictMode>,
)
