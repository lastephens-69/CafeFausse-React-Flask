import React, { useState } from "react";
import { subscribeNewsletter } from "../services/api";
import "./home.css";

// swap this for your favorite interior/hero photo
import heroImg from "/src/assets/cafe/Location/interior1.jpg"; // or dining-room.jpg / salmon.jpg

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null); setStatus(null);
    try {
      await subscribeNewsletter({ name, email, phone });
      setStatus("Merci! You're on the list.");
      setName(""); setEmail(""); setPhone("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="hero-overlay" />
        <div className="hero-inner">
          <h1 className="hero-title">Bienvenue à <span>Café Fausse</span></h1>
          <p className="hero-sub">Modern French cuisine in an intimate, candlelit setting.</p>
          <a href="/reservations" className="btn-hero">Reserve a Table</a>
        </div>
      </section>

      {/* 3-UP VALUE CARDS */}
      <section className="cards">
        <div className="card-elegant">
          <h3>Seasonal Menus</h3>
          <p>Locally sourced ingredients crafted into refined, contemporary dishes.</p>
        </div>
        <div className="card-elegant">
          <h3>Curated Cellar</h3>
          <p>French and Old World wines chosen to pair beautifully with every course.</p>
        </div>
        <div className="card-elegant">
          <h3>Impeccable Service</h3>
          <p>Warm hospitality in a polished, relaxed dining room.</p>
        </div>
      </section>

      {/* QUOTE */}
      <section className="pullquote">
        <p>“An elegant escape—glowing light, exquisite plates, unforgettable evening.”</p>
        <span className="source">— Gourmet Review</span>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter">
        <h2>Join Our Newsletter</h2>
        <p>New menus, exclusive tastings, and special events—delivered occasionally.</p>
        <form onSubmit={onSubmit} className="nl-form">
          <input
            placeholder="Full name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            required
          />
          <input
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />
          <input
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e)=>setPhone(e.target.value)}
          />
          <button className="btn-gold" type="submit">Subscribe</button>
        </form>
        {status && <p className="ok">{status}</p>}
        {error &&  <p className="err">{error}</p>}
      </section>

      {/* INFO STRIP */}
      <section className="info">
        <div><strong>Hours</strong><br/> Mon–Sat: 5:00PM – 11:00 PM<br/>Sun: 5:00 PM – 9:00 PM </div>
        <div><strong>Address</strong><br/>1234 Culinary Ave<br/>Suite 100<br/>Washington, DC 20002</div>
        <div><strong>Phone</strong><br/>(555) 123-4567</div>
      </section>
    </div>
  );
}
