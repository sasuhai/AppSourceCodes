import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

export default function ImageUploader({ image, onImageUpload, onClear }) {
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            onImageUpload(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="uploader-container">
            {!image ? (
                <div
                    className="dropzone glass-panel"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="file-input"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                    <label htmlFor="file-upload" className="upload-label">
                        <div className="icon-circle">
                            <Upload size={32} />
                        </div>
                        <h3>Upload Property Photo</h3>
                        <p>Drag & drop or click to browse</p>
                        <span className="file-hint">Supports JPG, PNG, WEBP</span>
                    </label>
                </div>
            ) : (
                <div className="preview-container glass-panel">
                    <img src={image} alt="Original Property" className="preview-image" />
                    <button onClick={onClear} className="remove-btn" title="Remove image">
                        <X size={20} />
                    </button>
                    <div className="preview-badge">Original Photo</div>
                </div>
            )}

            <style>{`
        .uploader-container {
          width: 100%;
          margin-bottom: 2rem;
        }
        .dropzone {
          border: 2px dashed var(--border);
          border-radius: var(--radius);
          padding: 4rem 2rem;
          text-align: center;
          transition: all 0.2s;
          cursor: pointer;
        }
        .dropzone:hover {
          border-color: var(--primary);
          background: rgba(46, 204, 113, 0.05);
        }
        .file-input {
          display: none;
        }
        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
        }
        .icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }
        .file-hint {
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .preview-container {
          position: relative;
          border-radius: var(--radius);
          overflow: hidden;
          aspect-ratio: 16/9;
        }
        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .remove-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
          transition: background 0.2s;
        }
        .remove-btn:hover {
          background: rgba(231, 76, 60, 0.8);
        }
        .preview-badge {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          padding: 0.25rem 0.75rem;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
      `}</style>
        </div>
    );
}
