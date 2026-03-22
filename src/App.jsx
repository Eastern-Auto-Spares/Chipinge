import React from 'react';
import './index.css';

const Header = () => (
  <header className="navbar">
    <div className="container flex-row">
      <div className="brand">
        <h1 className="logo-text">EASTERN AUTO SPARES</h1>
        <span className="slogan">Affordable & Reliable Auto Parts</span>
      </div>
      <nav>
        <ul className="nav-links">
          <li><a href="#inventory">Inventory</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>
);

const Hero = () => (
  <section className="hero">
    <div className="container">
      <h2>Your Trusted Partner in Manicaland</h2>
      <p>Premium spare parts for Toyota, Honda, Mazda, and Nissan. Imported quality, local prices.</p>
      <div className="hero-btns">
        <a href="https://wa.me/16038170479" className="btn-primary">Order via WhatsApp</a>
        <a href="#inventory" className="btn-secondary">View Models</a>
      </div>
    </div>
  </section>
);

const Inventory = () => {
  const models = [
    { name: "Toyota Corolla", icon: "🚗" },
    { name: "Honda Fit", icon: "🚙" },
    { name: "Mazda Demio", icon: "🚘" },
    { name: "Nissan AD Van", icon: "🚐" },
    { name: "Toyota Wish", icon: "🏎️" },
    { name: "Toyota Hiace", icon: "🚌" }
  ];
  return (
    <section id="inventory" className="container section">
      <h3 className="section-title">Vehicle Specializations</h3>
      <div className="model-grid">
        {models.map(model => (
          <div key={model.name} className="model-card">
            <span className="model-icon">{model.icon}</span>
            <h4>{model.name}</h4>
          </div>
        ))}
      </div>
    </section>
  );
};

const Footer = () => (
  <footer id="contact" className="footer">
    <div className="container">
      <div className="footer-grid">
        <div>
          <h4>Eastern Auto Spares</h4>
          <p>Chipinge Town, Zimbabwe</p>
        </div>
        <div>
          <h4>Contact Information</h4>
          <p>Director: Samuel Takwirira</p>
          <p>WhatsApp: +1 603 817 0479</p>
          <p>Email: info@easternautoparts.com</p>
        </div>
      </div>
      <div className="copyright">
        © 2026 Eastern Auto Spares. All Rights Reserved.
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="app-wrapper">
      <Header />
      <Hero />
      <Inventory />
      <Footer />
    </div>
  );
}
