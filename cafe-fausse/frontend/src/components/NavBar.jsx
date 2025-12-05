// frontend/src/components/NavBar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="navbar">
      <h1 className="nav-title">Café Fausse</h1>
      <ul className="nav-links">
        <li><NavLink to="/" end>Home</NavLink></li>
        <li><NavLink to="/menu">Menu</NavLink></li>
        <li><NavLink to="/reservations">Reservations</NavLink></li>
        <li><NavLink to="/about">About</NavLink></li>
        <li><NavLink to="/gallery">Gallery</NavLink></li>
      </ul>
    </nav>
  );
}
