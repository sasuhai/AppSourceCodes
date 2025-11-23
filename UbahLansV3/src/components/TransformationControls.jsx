import React from 'react';
import { Wand2, Loader2 } from 'lucide-react';

export default function TransformationControls({
    prompt,
    setPrompt,
    isGenerating,
    onGenerate,
    onAutofill,
    isAutofilling
}) {
    return (
        <div className="controls-container glass-panel">
            <div className="controls-header">
                <h3>Describe Your Vision</h3>
                <button
                    onClick={onAutofill}
                    disabled={isAutofilling || isGenerating}
                    className="btn btn-outline btn-sm"
                >
                    {isAutofilling ? (
                        <Loader2 size={16} className="spin" />
                    ) : (
                        <Wand2 size={16} />
                    )}
                    Auto-fill with AI
                </button>
            </div>

            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Transform this backyard into a modern zen garden with a koi pond, bamboo fencing, and stone pathways..."
                className="prompt-input"
                rows={4}
            />

            <button
                onClick={onGenerate}
                disabled={!prompt || isGenerating}
                className="btn btn-primary btn-full"
            >
                {isGenerating ? (
                    <>
                        <Loader2 size={20} className="spin" />
                        Generating Design...
                    </>
                ) : (
                    <>
                        <SparklesIcon />
                        Generate Transformation
                    </>
                )}
            </button>

            <style>{`
        .controls-container {
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .controls-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .prompt-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1rem;
          color: var(--text);
          font-family: inherit;
          resize: vertical;
          margin-bottom: 1.5rem;
          transition: border-color 0.2s;
        }
        .prompt-input:focus {
          outline: none;
          border-color: var(--primary);
        }
        .btn-full {
          width: 100%;
          padding: 1rem;
          font-size: 1.125rem;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

const SparklesIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
);
