import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ImageUploader from './components/ImageUploader';
import TransformationControls from './components/TransformationControls';
import ComparisonView from './components/ComparisonView';
import Inventory from './components/Inventory';
import Footer from './components/Footer';
import { generateAutofill, generateInventory, generateTransformation } from './services/ai';

function App() {
  const [view, setView] = useState('hero'); // 'hero' or 'tool'
  const [originalImage, setOriginalImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [inventory, setInventory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);

  const handleStart = () => {
    setView('tool');
    // Smooth scroll to tool section if we were on the same page, 
    // but since we are switching views, we might just want to scroll to top
    window.scrollTo(0, 0);
  };

  const handleImageUpload = (imageData) => {
    setOriginalImage(imageData);
    setGeneratedImage(null);
    setInventory([]);
  };

  const handleAutofill = async () => {
    if (!originalImage) return;

    setIsAutofilling(true);
    try {
      const description = await generateAutofill(originalImage);
      setPrompt(description);
    } catch (error) {
      console.error("Failed to autofill", error);
      alert("Could not analyze image. Please try again.");
    } finally {
      setIsAutofilling(false);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !prompt) return;

    setIsGenerating(true);
    try {
      // Run both generation tasks in parallel
      const [imageResult, inventoryResult] = await Promise.all([
        generateTransformation(originalImage, prompt),
        generateInventory(prompt)
      ]);

      setGeneratedImage(imageResult);
      setInventory(inventoryResult);
    } catch (error) {
      console.error("Generation failed", error);
      alert("Something went wrong during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app">
      <Header />

      {view === 'hero' ? (
        <Hero onStart={handleStart} />
      ) : (
        <main className="tool-section section">
          <div className="container">
            <div className="tool-header">
              <h2>Design Studio</h2>
              <p>Upload your photo and let AI do the magic</p>
            </div>

            <div className="tool-grid">
              <div className="left-panel">
                <ImageUploader
                  image={originalImage}
                  onImageUpload={handleImageUpload}
                  onClear={() => setOriginalImage(null)}
                />

                {originalImage && (
                  <TransformationControls
                    prompt={prompt}
                    setPrompt={setPrompt}
                    isGenerating={isGenerating}
                    onGenerate={handleGenerate}
                    onAutofill={handleAutofill}
                    isAutofilling={isAutofilling}
                  />
                )}
              </div>

              <div className="right-panel">
                {generatedImage ? (
                  <>
                    <ComparisonView
                      original={originalImage}
                      generated={generatedImage}
                    />
                    <Inventory items={inventory} />
                  </>
                ) : (
                  <div className="placeholder-panel glass-panel">
                    <div className="placeholder-content">
                      <h3>Ready to Transform?</h3>
                      <p>Upload a photo and describe your vision to see the results here.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      <style>{`
        .app {
          min-height: 100vh;
          background-color: var(--background);
        }
        .tool-header {
          text-align: center;
          margin-bottom: 3rem;
          margin-top: 2rem;
        }
        .tool-header h2 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        .tool-header p {
          color: var(--text-muted);
        }
        .tool-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
          align-items: start;
        }
        .placeholder-panel {
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          border: 2px dashed var(--border);
        }
        .placeholder-content {
          max-width: 300px;
          color: var(--text-muted);
        }
        @media (max-width: 1024px) {
          .tool-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <Footer />
    </div>
  );
}

export default App;
