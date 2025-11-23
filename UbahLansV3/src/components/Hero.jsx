import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero({ onStart }) {
    return (
        <section className="hero">
            <div className="container hero-content">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hero-text"
                >
                    <div className="badge">
                        <Sparkles size={16} />
                        <span>AI-Powered Landscape Design</span>
                    </div>
                    <h1 className="hero-title">
                        Transform Your <span className="gradient-text">Outdoor Space</span> In Seconds
                    </h1>
                    <p className="hero-subtitle">
                        UbahLans helps landscapers and homeowners visualize stunning property transformations.
                        Upload photos, describe your vision, and let AI generate realistic plans.
                    </p>
                    <div className="hero-actions">
                        <button onClick={onStart} className="btn btn-primary btn-lg">
                            Start Designing <ArrowRight size={20} />
                        </button>
                        <button className="btn btn-outline btn-lg">View Gallery</button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="hero-visual"
                >
                    <div className="visual-card glass-panel">
                        <img
                            src="https://images.unsplash.com/photo-1558905540-2128470e1e96?q=80&w=2070&auto=format&fit=crop"
                            alt="Beautiful Garden"
                            className="hero-image"
                        />
                        <div className="floating-card card-1 glass-panel">
                            <span>🌿 Native Plants</span>
                        </div>
                        <div className="floating-card card-2 glass-panel">
                            <span>✨ Modern Patio</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding-top: 80px;
          background: radial-gradient(circle at top right, rgba(46, 204, 113, 0.1), transparent 40%);
          overflow: hidden;
        }
        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(46, 204, 113, 0.1);
          color: var(--primary);
          border-radius: 2rem;
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }
        .hero-title {
          font-size: 3.5rem;
          line-height: 1.1;
          font-weight: 800;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }
        .gradient-text {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-muted);
          margin-bottom: 2.5rem;
          max-width: 540px;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
        }
        .btn-lg {
          padding: 1rem 2rem;
          font-size: 1.125rem;
        }
        .hero-visual {
          position: relative;
        }
        .visual-card {
          padding: 1rem;
          position: relative;
          transform: rotate(-2deg);
          transition: transform 0.3s ease;
        }
        .visual-card:hover {
          transform: rotate(0deg);
        }
        .hero-image {
          border-radius: calc(var(--radius) - 4px);
          width: 100%;
          height: auto;
          box-shadow: var(--shadow-lg);
        }
        .floating-card {
          position: absolute;
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          box-shadow: var(--shadow);
          animation: float 6s ease-in-out infinite;
        }
        .card-1 {
          top: 20%;
          left: -20px;
          animation-delay: 0s;
        }
        .card-2 {
          bottom: 20%;
          right: -20px;
          animation-delay: 3s;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @media (max-width: 968px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 3rem;
          }
          .hero-title {
            font-size: 2.5rem;
          }
          .hero-subtitle {
            margin: 0 auto 2rem;
          }
          .hero-actions {
            justify-content: center;
          }
          .badge {
            margin: 0 auto 1.5rem;
          }
        }
      `}</style>
        </section>
    );
}
