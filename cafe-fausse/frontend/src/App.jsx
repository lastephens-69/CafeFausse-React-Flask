import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <div>
      <header>
        <div className="container">
          <NavBar />
        </div>
      </header>

      <main>
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer>
        <div className="container">
          <Footer />
        </div>
      </footer>
    </div>
  )
}
