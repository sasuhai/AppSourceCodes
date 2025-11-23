import React, { useState, useRef, useEffect } from 'react';
import { Download, Share2 } from 'lucide-react';

export default function ComparisonView({ original, generated }) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef(null);
    const isDragging = useRef(false);

    const handleMouseDown = () => {
        isDragging.current = true;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;

        setSliderPosition(percentage);
    };

    const handleTouchMove = (e) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;

        setSliderPosition(percentage);
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, []);

    if (!generated) return null;

    return (
        <div className="comparison-section">
            <div className="section-header">
                <h2>Transformation Result</h2>
                <div className="actions">
                    <button className="btn btn-outline btn-sm">
                        <Share2 size={16} /> Share
                    </button>
                    <button className="btn btn-primary btn-sm">
                        <Download size={16} /> Download
                    </button>
                </div>
            </div>

            <div
                className="comparison-container glass-panel"
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
            >
                <div className="image-wrapper original">
                    <img src={original} alt="Original" />
                    <div className="label">Before</div>
                </div>

                <div
                    className="image-wrapper generated"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                    <img src={generated} alt="Generated Design" />
                    <div className="label">After AI</div>
                </div>

                <div
                    className="slider-handle"
                    style={{ left: `${sliderPosition}%` }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                >
                    <div className="slider-line"></div>
                    <div className="slider-button">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8L22 12L18 16" />
                            <path d="M6 8L2 12L6 16" />
                        </svg>
                    </div>
                </div>
            </div>

            <style>{`
        .comparison-section {
          margin-bottom: 3rem;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .actions {
          display: flex;
          gap: 0.5rem;
        }
        .comparison-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          overflow: hidden;
          border-radius: var(--radius);
          cursor: col-resize;
          user-select: none;
        }
        .image-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .label {
          position: absolute;
          top: 1rem;
          padding: 0.25rem 0.75rem;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          z-index: 10;
        }
        .original .label {
          right: 1rem;
        }
        .generated .label {
          left: 1rem;
          background: rgba(46, 204, 113, 0.8);
        }
        .slider-handle {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 4px;
          background: white;
          z-index: 20;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .slider-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: white;
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(0,0,0,0.2);
        }
      `}</style>
        </div>
    );
}
