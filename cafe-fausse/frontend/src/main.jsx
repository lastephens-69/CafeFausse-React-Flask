import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Menu from './pages/Menu.jsx'
import Reservations from './pages/Reservations.jsx'
import About from './pages/About.jsx'
import Gallery from './pages/Gallery.jsx'
import Admin from './pages/Admin.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'menu', element: <Menu /> },
      { path: 'reservations', element: <Reservations /> },
      { path: 'about', element: <About /> },
      { path: 'gallery', element: <Gallery /> },
      { path: 'admin', element: <Admin /> }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
