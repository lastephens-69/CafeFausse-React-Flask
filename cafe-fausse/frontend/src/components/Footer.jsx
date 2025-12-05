// frontend/src/components/Footer.jsx
import React from "react";
import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <h2 className="footer-title">Café Fausse</h2>
        <p className="footer-text">
          1234 Culinary Ave · Suite 100 · Washington, DC 20002 ·  (202) 555-4567
        </p>
        <p className="footer-text">
          Monday–Saturday: 5:00PM – 11:00 PM; Sunday: 5:00 PM – 9:00 PM
        </p>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Café Fausse · All Rights Reserved</p>
      </div>
    </footer>
  );
}
