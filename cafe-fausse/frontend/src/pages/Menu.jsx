// frontend/src/pages/Menu.jsx
import React from "react";
import "./menu.css";

// images
import imgBruschetta from "/src/assets/cafe/Dishes/bruschetta.jpg";
import imgSalad from "/src/assets/cafe/Dishes/salad.jpg";
import imgSalmon from "/src/assets/cafe/Dishes/salmon.jpg";
import imgRibeye from "/src/assets/cafe/Dishes/ribeye.jpg";
import imgRisotto from "/src/assets/cafe/Dishes/risotto.jpg";
import imgTiramisu from "/src/assets/cafe/Dishes/tiramisu.jpg";
import imgCheesecake from "/src/assets/cafe/Dishes/cheesecake.jpg";
import imgBeverages from "/src/assets/cafe/Dishes/beverages.jpg";

function Item({ img, name, desc, price }) {
  return (
    <div className="menu-item">
      <img src={img} alt={name} loading="lazy" />
      <div className="menu-text">
        <div className="menu-head">
          <h4 className="menu-name">{name}</h4>
          <span className="menu-price">{price ? `$${price}` : "—"}</span>
        </div>
        <p className="menu-desc">{desc}</p>
      </div>
    </div>
  );
}

export default function Menu() {
  return (
    <div className="menu-page">
      <h1 className="menu-title">Menu</h1>

      <section className="menu-section">
        <h2>Starters</h2>
        <div className="menu-list">
          <Item
            img={imgBruschetta}
            name="Bruschetta"
            desc="Fresh tomatoes, basil, and olive oil on toasted baguette."
            price="8.50"
          />
          <Item
            img={imgSalad}
            name="Caesar Salad"
            desc="Crisp romaine with house Caesar and shaved parmesan."
            price="9.00"
          />
        </div>
      </section>

      <section className="menu-section">
        <h2>Main Courses</h2>
        <div className="menu-list">
          <Item
            img={imgSalmon}
            name="Grilled Salmon"
            desc="Lemon butter sauce with seasonal vegetables."
            price="22.00"
          />
          <Item
            img={imgRibeye}
            name="Ribeye Steak"
            desc="12 oz prime cut with garlic mashed potatoes."
            price="28.00"
          />
          <Item
            img={imgRisotto}
            name="Vegetable Risotto"
            desc="Creamy Arborio rice with wild mushrooms."
            price="18.00"
          />
        </div>
      </section>

      <section className="menu-section">
        <h2>Desserts</h2>
        <div className="menu-list">
          <Item
            img={imgTiramisu}
            name="Tiramisu"
            desc="Classic layered espresso-soaked ladyfingers with mascarpone."
            price="7.50"
          />
          <Item
            img={imgCheesecake}
            name="Cheesecake"
            desc="Vanilla bean cheesecake with berry compote."
            price="7.00"
          />
        </div>
      </section>

      <section className="menu-section">
        <h2>Beverages</h2>
        <div className="menu-list">
          <Item
            img={imgBeverages}
            name="Wine, Beer & Espresso"
            desc="Curated red & white wines by the glass, craft beer, and espresso."
            price=""
          />
        </div>
      </section>
    </div>
  );
}
