import React from 'react';
import { Leaf, Github, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="logo">
                            <Leaf className="logo-icon" size={20} color="var(--primary)" />
                            <span className="logo-text">UbahLans</span>
                        </div>
                        <p>Transforming outdoor spaces with the power of AI.</p>
                    </div>

                    <div className="footer-links">
                        <div className="link-group">
                            <h4>Product</h4>
                            <a href="#">Features</a>
                            <a href="#">Pricing</a>
                            <a href="#">Showcase</a>
                        </div>
                        <div className="link-group">
                            <h4>Company</h4>
                            <a href="#">About</a>
                            <a href="#">Blog</a>
                            <a href="#">Careers</a>
                        </div>
                        <div className="link-group">
                            <h4>Legal</h4>
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2025 UbahLans. All rights reserved.</p>
                    <div className="social-links">
                        <a href="#"><Twitter size={20} /></a>
                        <a href="#"><Instagram size={20} /></a>
                        <a href="#"><Github size={20} /></a>
                    </div>
                </div>
            </div>

            <style>{`
        .footer {
          background: var(--surface);
          border-top: 1px solid var(--border);
          padding: 4rem 0 2rem;
          margin-top: auto;
        }
        .footer-content {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 4rem;
          margin-bottom: 3rem;
        }
        .footer-brand p {
          color: var(--text-muted);
          margin-top: 1rem;
          max-width: 300px;
        }
        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .link-group h4 {
          margin-bottom: 1rem;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .link-group a {
          display: block;
          color: var(--text);
          text-decoration: none;
          margin-bottom: 0.5rem;
          transition: color 0.2s;
        }
        .link-group a:hover {
          color: var(--primary);
        }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
          color: var(--text-muted);
          font-size: 0.875rem;
        }
        .social-links {
          display: flex;
          gap: 1rem;
        }
        .social-links a {
          color: var(--text-muted);
          transition: color 0.2s;
        }
        .social-links a:hover {
          color: var(--primary);
        }
        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .footer-links {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
        </footer>
    );
}
