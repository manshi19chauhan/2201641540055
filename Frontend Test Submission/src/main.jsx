import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './pages/App'
import ShortenPage from './pages/ShortenPage'
import StatsPage from './pages/StatsPage'

const router = createBrowserRouter([
  { path: '/', element: <App />, children: [
    { index: true, element: <ShortenPage /> },
    { path: 'stats', element: <StatsPage /> },
  ] }
])

const theme = createTheme({
  palette: { mode: 'dark' }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
)
