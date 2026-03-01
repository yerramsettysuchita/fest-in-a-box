import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/globals.css'

// Apply saved theme before first render (default is light/white)
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111110',
            color: '#f5f0e8',
            border: '1px solid #1e1e1a',
            fontFamily: 'DM Mono, monospace',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#8fb87a', secondary: '#111110' } },
          error:   { iconTheme: { primary: '#c4602a', secondary: '#111110' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
