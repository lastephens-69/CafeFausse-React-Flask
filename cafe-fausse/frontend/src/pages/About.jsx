import React from "react";
import "./about.css";
import mariaImg from "/src/assets/cafe/Founders/maria.jpg";
import rossiImg from "/src/assets/cafe/Founders/rossi.jpg";

export default function About() {
  return (
    <div className="about-page">
      <h1 className="about-title">About Café Fausse</h1>

      {/* FR-10: required history & mission */}
      <section className="about-intro">
        <p>
          <strong>Founded in 2010</strong> by <em>Chef Antonio Rossi</em> and
          <em> restaurateur Maria Lopez</em>, Café Fausse blends traditional
          Italian flavors with modern culinary innovation. Our mission is to
          provide an unforgettable dining experience that reflects both
          <strong> quality</strong> and <strong>creativity</strong>.
        </p>
      </section>

      {/* FR-11: biographies of the founders */}
      <section className="founders">
        <div className="founder-card">
          <img src={rossiImg} alt="Chef Antonio Rossi" loading="lazy" />
          <div className="founder-text">
            <h2>Chef Antonio Rossi</h2>
            <p>
              Trained in classic Italian kitchens and inspired by contemporary technique,
              Chef Rossi’s cooking honors regional traditions while embracing seasonal
              creativity. His menus showcase handcrafted pastas, pristine seafood, and elegant
              plating—balancing comfort and refinement in every course.
            </p>
          </div>
        </div>

        <div className="founder-card reverse">
          <img src={mariaImg} alt="Restaurateur Maria Lopez" loading="lazy" />
          <div className="founder-text">
            <h2>Maria Lopez</h2>
            <p>
              A lifelong hospitality professional, Maria leads the dining room experience with
              warmth and precision. She curates the wine list and guides service standards,
              ensuring guests feel welcomed, cared for, and delighted from the first greeting
              to the final course.
            </p>
          </div>
        </div>
      </section>

      {/* FR-11: commitment statement */}
      <section className="about-commitment">
        <h3>Our Commitment</h3>
        <ul>
          <li>Deliver exceptional, memorable dining rooted in Italian culinary tradition.</li>
          <li>Champion seasonal, high-quality ingredients and responsible sourcing.</li>
          <li>Offer gracious, attentive service in an elegant, welcoming atmosphere.</li>
          <li>Continuously innovate while honoring timeless techniques and flavors.</li>
        </ul>
      </section>

      {/* Location (optional reinforcement) */}
      <section className="about-location">
        <h3>Visit Us</h3>
        <p>
          1234 Culinary Ave, Suite 100, Washington, DC 20002
        </p>
      </section>
    </div>
  );
}
