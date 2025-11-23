import React from 'react';
import { Leaf } from 'lucide-react';

export default function Header() {
  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo">
          <Leaf className="logo-icon" size={24} color="var(--primary)" />
          <span className="logo-text">UbahLans</span>
        </div>
        <nav className="nav">
          <a href="#features">Features</a>
          <a href="#tool" className="btn btn-primary btn-sm">Try Now</a>
        </nav>
      </div>
      <style>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1rem 0;
        }
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 1.5rem;
          color: var(--text);
        }
        .nav {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .nav a {
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav a:hover {
          color: var(--primary);
        }
        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }
      `}</style>
    </header>
  );
}
