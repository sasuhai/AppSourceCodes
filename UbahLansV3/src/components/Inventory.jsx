import React from 'react';
import { CheckCircle2, TreeDeciduous, DollarSign } from 'lucide-react';

export default function Inventory({ items }) {
    if (!items || items.length === 0) return null;

    return (
        <div className="inventory-section glass-panel">
            <div className="inventory-header">
                <h3>Smart Inventory</h3>
                <span className="badge-outline">Estimated Cost: $2,500 - $3,200</span>
            </div>

            <div className="inventory-grid">
                {items.map((item, index) => (
                    <div key={index} className="inventory-item">
                        <div className="item-icon">
                            <TreeDeciduous size={20} />
                        </div>
                        <div className="item-details">
                            <h4>{item.name}</h4>
                            <p>{item.quantity} units • {item.type}</p>
                        </div>
                        <div className="item-check">
                            <CheckCircle2 size={20} className="text-primary" />
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        .inventory-section {
          padding: 1.5rem;
          margin-bottom: 3rem;
        }
        .inventory-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .badge-outline {
          padding: 0.25rem 0.75rem;
          border: 1px solid var(--primary);
          color: var(--primary);
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }
        .inventory-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius);
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .inventory-item:hover {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
        }
        .item-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(46, 204, 113, 0.1);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .item-details {
          flex: 1;
        }
        .item-details h4 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }
        .item-details p {
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .text-primary {
          color: var(--primary);
        }
      `}</style>
        </div>
    );
}
