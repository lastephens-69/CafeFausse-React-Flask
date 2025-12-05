import React, { useMemo, useState } from "react";
import "./gallery.css";

/**
 * Load images from /src/assets/cafe/<Category>/<file>
 * IMPORTANT:
 * - We read the GLOB KEY (original path) to derive the category
 * - We use the GLOB VALUE (hashed URL) to render <img src="...">
 */
const RAW = import.meta.glob(
  "/src/assets/cafe/*/*.{jpg,jpeg,png,webp}",
  { eager: true, query: "?url", import: "default" }
);

// Preferred order for tabs/sections
const ORDER = ["Location", "Dishes", "Catering", "Behind the Scenes"];

// Helpers
function displayLabel(raw) {
  return decodeURIComponent(raw).replace(/[_-]+/g, " ").trim();
}

export default function Gallery() {
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState("All");

  // Normalize into { path, url, category, name }
  const items = useMemo(() => {
    return Object.entries(RAW).map(([path, url]) => {
      // Example path: /src/assets/cafe/Behind%20the%20Scenes/photo.jpg
      const parts = path.split("/");
      const idx = parts.indexOf("cafe");
      const category = decodeURIComponent(parts[idx + 1] || "Other");
      const file = parts[idx + 2] || "";
      const name = decodeURIComponent(file.replace(/\.[^.]+$/, ""));
      return { path, url, category, name };
    });
  }, []);

  // Categories from folder names (stable in dev & prod)
  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    const existing = Array.from(set);
    const inOrder = ORDER.filter((c) => existing.includes(c));
    const remaining = existing
      .filter((c) => !ORDER.includes(c))
      .sort((a, b) => displayLabel(a).localeCompare(displayLabel(b)));
    return ["All", ...inOrder, ...remaining];
  }, [items]);

  // Section data for rendering (All = every category in our order)
  const sections = useMemo(() => {
    const byCat = items.reduce((acc, it) => {
      (acc[it.category] ??= []).push(it);
      return acc;
    }, {});

    if (filter !== "All") {
      return [[filter, byCat[filter] || []]];
    }

    const existing = Object.keys(byCat);
    const inOrder = ORDER.filter((c) => existing.includes(c)).map((c) => [c, byCat[c]]);
    const remaining = existing
      .filter((c) => !ORDER.includes(c))
      .sort((a, b) => displayLabel(a).localeCompare(displayLabel(b)))
      .map((c) => [c, byCat[c]]);
    return [...inOrder, ...remaining];
  }, [items, filter]);

  return (
    <div className="card">
      <h1>Gallery</h1>

      {/* Filter chips */}
      <div className="chips" role="tablist" aria-label="Filter gallery">
        {categories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={filter === c}
            className={`chip ${filter === c ? "active" : ""}`}
            onClick={() => setFilter(c)}
          >
            {c === "All" ? "All" : displayLabel(c)}
          </button>
        ))}
      </div>

      {/* Sections */}
      {sections.map(([cat, rows]) => (
        <section key={cat} className="gallery-section">
          {filter === "All" && <h3 className="gallery-heading">{displayLabel(cat)}</h3>}
          <div className="grid-gallery">
            {rows.length ? (
              rows
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((it, i) => (
                  <img
                    key={it.url + i}
                    className="gallery-img"
                    src={it.url}
                    alt={`${displayLabel(cat)} — ${it.name}`}
                    loading="lazy"
                    onClick={() => setActive(it.url)}
                  />
                ))
            ) : (
              <p className="empty">No images yet.</p>
            )}
          </div>
        </section>
      ))}

      {/* Lightbox */}
      {active && (
        <div className="lightbox" onClick={() => setActive(null)} aria-modal="true" role="dialog">
          <img src={active} alt="Large view" />
        </div>
      )}
    </div>
  );
}
