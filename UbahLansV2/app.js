// ===================================
// CONFIGURATION
// ===================================
const CONFIG = {
    GEMINI_API_KEY: 'AIzaSyDfL16p9fJ2Erf8Um3xpdP4OL0trfxx1pc',
    GEMINI_API_BASE: 'https://generativelanguage.googleapis.com/v1beta',
    DEFAULT_MODEL: 'gemini-2.0-flash-exp',
    MODELS: {
        'auto': 'gemini-2.0-flash-exp',
        'gemini-2.0-flash-exp': 'gemini-2.0-flash-exp',
        'gemini-1.5-pro': 'gemini-1.5-pro-latest',
        'gemini-1.5-flash': 'gemini-1.5-flash-latest'
    }
};

// ===================================
// STATE MANAGEMENT
// ===================================
const state = {
    uploadedImage: null,
    uploadedImageData: null,
    transformedImage: null,
    topViewImage: null,
    inventory: null,
    currentModel: 'auto'
};

// ===================================
// DOM ELEMENTS
// ===================================
const elements = {
    // Mobile menu
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileMenu: document.getElementById('mobileMenu'),

    // Hero
    heroImage: document.getElementById('heroImage'),

    // Upload
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    imagePreview: document.getElementById('imagePreview'),
    previewImage: document.getElementById('previewImage'),
    removeImageBtn: document.getElementById('removeImageBtn'),

    // Sections
    uploadSection: document.getElementById('uploadSection'),
    optionsSection: document.getElementById('optionsSection'),
    loadingSection: document.getElementById('loadingSection'),
    resultsSection: document.getElementById('resultsSection'),

    // Options
    promptInput: document.getElementById('promptInput'),
    autoFillBtn: document.getElementById('autoFillBtn'),
    modelSelect: document.getElementById('modelSelect'),
    generateTopView: document.getElementById('generateTopView'),
    generateInventory: document.getElementById('generateInventory'),
    generateBtn: document.getElementById('generateBtn'),

    // Loading
    loadingStatus: document.getElementById('loadingStatus'),
    progressBar: document.getElementById('progressBar'),

    // Results
    beforeImage: document.getElementById('beforeImage'),
    afterImage: document.getElementById('afterImage'),
    sliderContainer: document.getElementById('sliderContainer'),
    sliderHandle: document.getElementById('sliderHandle'),
    topViewSection: document.getElementById('topViewSection'),
    topViewImage: document.getElementById('topViewImage'),
    inventorySection: document.getElementById('inventorySection'),
    inventoryContent: document.getElementById('inventoryContent'),
    newDesignBtn: document.getElementById('newDesignBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    shareBtn: document.getElementById('shareBtn')
};

// ===================================
// INITIALIZATION
// ===================================
function init() {
    // Ensure correct initial visibility
    if (elements.uploadArea) elements.uploadArea.style.display = 'block';
    if (elements.imagePreview) elements.imagePreview.style.display = 'none';
    if (elements.optionsSection) elements.optionsSection.style.display = 'none';
    if (elements.loadingSection) elements.loadingSection.style.display = 'none';
    if (elements.resultsSection) elements.resultsSection.style.display = 'none';

    setupEventListeners();
    loadHeroImage();
    setupSmoothScroll();
}

function setupEventListeners() {
    // Mobile menu
    elements.mobileMenuBtn?.addEventListener('click', toggleMobileMenu);

    // Upload
    elements.uploadArea?.addEventListener('click', () => elements.fileInput?.click());
    elements.uploadArea?.addEventListener('dragover', handleDragOver);
    elements.uploadArea?.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea?.addEventListener('drop', handleDrop);
    elements.fileInput?.addEventListener('change', handleFileSelect);
    elements.removeImageBtn?.addEventListener('click', removeImage);

    // Options
    elements.autoFillBtn?.addEventListener('click', autoFillPrompt);
    elements.generateBtn?.addEventListener('click', generateTransformation);

    // Results
    elements.newDesignBtn?.addEventListener('click', resetApp);
    elements.downloadBtn?.addEventListener('click', downloadImages);
    elements.shareBtn?.addEventListener('click', shareResults);

    // Slider
    if (elements.sliderContainer) {
        elements.sliderContainer.addEventListener('mousedown', startSlider);
        elements.sliderContainer.addEventListener('touchstart', startSlider);
    }

    // Close mobile menu when clicking links
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            elements.mobileMenu?.classList.remove('active');
        });
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===================================
// MOBILE MENU
// ===================================
function toggleMobileMenu() {
    elements.mobileMenu?.classList.toggle('active');
}

// ===================================
// HERO IMAGE
// ===================================
function loadHeroImage() {
    // Load the hero image
    if (elements.heroImage) {
        elements.heroImage.src = 'hero-before.jpg';
    }
}

// ===================================
// FILE UPLOAD HANDLING
// ===================================
function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea?.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea?.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea?.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

async function handleFile(file) {
    console.log('handleFile called with:', file);

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }

    // Check for HEIC/HEIF format (not supported in browsers)
    if (file.type === 'image/heic' || file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        alert('HEIC/HEIF format is not supported in web browsers.\n\nPlease convert your image to JPG or PNG format first.\n\nOn iPhone: Go to Settings > Camera > Formats and select "Most Compatible" to save photos as JPG.\n\nOr use an online converter to convert HEIC to JPG.');
        return;
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }

    console.log('File validation passed');

    // Read file
    const reader = new FileReader();
    reader.onload = (e) => {
        const imageData = e.target.result;
        console.log('Image data loaded, length:', imageData.length);
        console.log('Preview image element:', elements.previewImage);

        // Store in state
        state.uploadedImage = file;
        state.uploadedImageData = imageData;

        // Show preview - set src first, then make visible
        if (elements.previewImage) {
            elements.previewImage.src = imageData;
            console.log('Image src set to:', imageData.substring(0, 50) + '...');

            // Wait for image to load before showing
            elements.previewImage.onload = () => {
                console.log('Image loaded successfully');
                elements.uploadArea.style.display = 'none';
                elements.imagePreview.style.display = 'block';
                elements.optionsSection.style.display = 'flex';
            };

            elements.previewImage.onerror = (err) => {
                console.error('Image failed to load:', err);
                alert('Failed to load image preview. Please try another image.');
            };
        } else {
            console.error('Preview image element not found!');
        }
    };

    reader.onerror = (err) => {
        console.error('FileReader error:', err);
        alert('Failed to read file. Please try again.');
    };

    reader.readAsDataURL(file);
    console.log('FileReader started');
}

function removeImage() {
    state.uploadedImage = null;
    state.uploadedImageData = null;
    elements.previewImage.src = '';
    elements.uploadArea.style.display = 'block';
    elements.imagePreview.style.display = 'none';
    elements.optionsSection.style.display = 'none';
    elements.fileInput.value = '';
}

// ===================================
// AI INTEGRATION - GEMINI API
// ===================================
async function callGeminiAPI(prompt, imageData, model = null) {
    const selectedModel = model || CONFIG.MODELS[elements.modelSelect?.value || 'auto'];

    try {
        // Convert base64 to proper format
        const base64Data = imageData.split(',')[1];
        const mimeType = imageData.split(',')[0].split(':')[1].split(';')[0];

        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: prompt
                    },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
            }
        };

        const response = await fetch(
            `${CONFIG.GEMINI_API_BASE}/models/${selectedModel}:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

async function generateImageWithGemini(prompt, referenceImageData) {
    // For image generation, we'll use a different approach
    // Since Gemini doesn't directly generate images, we'll create a detailed description
    // and then use a placeholder with that description

    const enhancedPrompt = `Based on this image, create a detailed description for a landscape transformation with the following requirements: ${prompt}. 
    
    Describe in detail:
    1. The exact plants, trees, and landscaping features to add
    2. Their specific placement and arrangement
    3. Colors, textures, and materials
    4. Any hardscaping elements (paths, patios, walls, etc.)
    5. Lighting and water features if applicable
    
    Be extremely specific and detailed so the transformation can be visualized.`;

    const description = await callGeminiAPI(enhancedPrompt, referenceImageData);

    // Generate a placeholder image based on the description
    return await generatePlaceholderImage(800, 600, description);
}

async function generateTopDownView(transformationDescription, originalImageData) {
    const prompt = `Based on this property image and the following landscape transformation: "${transformationDescription}", 
    create a detailed description of what a top-down architectural plan view would show. Include:
    1. Property boundaries and dimensions
    2. Placement of all plants, trees, and features
    3. Pathways, patios, and hardscaping
    4. Spatial relationships and measurements
    
    Be specific about layout and positioning.`;

    const description = await callGeminiAPI(prompt, originalImageData);

    // Generate a placeholder top-down view
    return await generatePlaceholderImage(800, 800, `Top-down architectural plan view: ${description}`);
}

async function generateInventoryList(transformationDescription) {
    const prompt = `Based on this landscape transformation description: "${transformationDescription}", 
    create a detailed inventory list in the following format:
    
    **Plants & Trees:**
    - List each plant/tree with quantity and size
    
    **Hardscaping Materials:**
    - List materials needed with estimated quantities
    
    **Features:**
    - List any special features (water features, lighting, etc.)
    
    **Estimated Costs:**
    - Provide rough cost estimates for each category
    
    Be specific and practical for a real landscaping project.`;

    // For inventory, we can use text-only API call
    const inventoryText = await callGeminiAPITextOnly(prompt);
    return inventoryText;
}

async function callGeminiAPITextOnly(prompt) {
    const selectedModel = CONFIG.MODELS[elements.modelSelect?.value || 'auto'];

    try {
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
            }
        };

        const response = await fetch(
            `${CONFIG.GEMINI_API_BASE}/models/${selectedModel}:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
}

// ===================================
// AUTO-FILL PROMPT
// ===================================
async function autoFillPrompt() {
    if (!state.uploadedImageData) {
        alert('Please upload an image first');
        return;
    }

    elements.autoFillBtn.disabled = true;
    elements.autoFillBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="spinning"><circle cx="8" cy="8" r="6" stroke="currentColor" fill="none" stroke-width="2"/></svg> Analyzing...';

    try {
        const prompt = `Analyze this property image and suggest 3 creative landscape transformation ideas. 
        For each idea, provide:
        1. A catchy name
        2. A brief description
        3. Key features
        
        Format as a simple list that a homeowner can choose from.`;

        const suggestions = await callGeminiAPI(prompt, state.uploadedImageData);
        elements.promptInput.value = suggestions;
    } catch (error) {
        console.error('Auto-fill error:', error);

        // Check if it's a quota error
        if (error.message.includes('quota') || error.message.includes('exceeded')) {
            alert('⚠️ API Quota Exceeded\n\nThe Gemini API has reached its usage limit.\n\nPlease:\n1. Wait a few minutes and try again\n2. Or manually describe your landscape vision in the text box below\n\nYou can still generate transformations by typing your own description!');
        } else {
            alert('Failed to generate AI suggestions.\n\nPlease manually describe your desired landscape transformation in the text box below.');
        }
    } finally {
        elements.autoFillBtn.disabled = false;
        elements.autoFillBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0L10 6H16L11 10L13 16L8 12L3 16L5 10L0 6H6L8 0Z"/></svg> Auto-fill with AI';
    }
}

// ===================================
// GENERATE TRANSFORMATION
// ===================================
async function generateTransformation() {
    if (!state.uploadedImageData) {
        alert('Please upload an image first');
        return;
    }

    const prompt = elements.promptInput.value.trim();
    if (!prompt) {
        alert('Please describe your desired transformation');
        return;
    }

    // Show loading
    elements.optionsSection.style.display = 'none';
    elements.loadingSection.style.display = 'block';

    try {
        // Step 1: Generate transformation (40%)
        updateProgress(10, 'Analyzing your property...');
        await sleep(500);

        updateProgress(40, 'Creating your dream landscape...');
        const transformedImageUrl = await generateImageWithGemini(prompt, state.uploadedImageData);
        state.transformedImage = transformedImageUrl;

        // Step 2: Generate top view if requested (70%)
        if (elements.generateTopView.checked) {
            updateProgress(70, 'Generating top-down plan view...');
            const topViewUrl = await generateTopDownView(prompt, state.uploadedImageData);
            state.topViewImage = topViewUrl;
        }

        // Step 3: Generate inventory if requested (90%)
        if (elements.generateInventory.checked) {
            updateProgress(90, 'Creating smart inventory...');
            const inventory = await generateInventoryList(prompt);
            state.inventory = inventory;
        }

        // Complete
        updateProgress(100, 'Finalizing your design...');
        await sleep(500);

        // Show results
        showResults();
    } catch (error) {
        console.error('Generation error:', error);

        // Provide user-friendly error messages
        let errorMessage = 'Failed to generate transformation.\n\n';

        if (error.message.includes('quota') || error.message.includes('exceeded')) {
            errorMessage += '⚠️ API Quota Exceeded\n\nThe Gemini API has reached its usage limit. This happens when:\n• Too many requests in a short time\n• Daily/monthly quota is reached\n\nSolutions:\n1. Wait 1-2 hours and try again\n2. Use a different API key\n3. Check your Google Cloud Console for quota limits\n\nNote: The free tier has limited requests per minute.';
        } else if (error.message.includes('API Error')) {
            errorMessage += `API Error: ${error.message}\n\nPlease check:\n• Your internet connection\n• API key is valid\n• Try again in a few moments`;
        } else {
            errorMessage += error.message;
        }

        alert(errorMessage);
        elements.loadingSection.style.display = 'none';
        elements.optionsSection.style.display = 'flex';
    }
}

function updateProgress(percent, status) {
    elements.progressBar.style.width = `${percent}%`;
    elements.loadingStatus.textContent = status;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===================================
// SHOW RESULTS
// ===================================
function showResults() {
    // Hide loading
    elements.loadingSection.style.display = 'none';

    // Set images
    elements.beforeImage.src = state.uploadedImageData;
    elements.afterImage.src = state.transformedImage;

    // Show top view if generated
    if (state.topViewImage) {
        elements.topViewImage.src = state.topViewImage;
        elements.topViewSection.style.display = 'flex';
    } else {
        elements.topViewSection.style.display = 'none';
    }

    // Show inventory if generated
    if (state.inventory) {
        elements.inventoryContent.innerHTML = formatInventory(state.inventory);
        elements.inventorySection.style.display = 'flex';
    } else {
        elements.inventorySection.style.display = 'none';
    }

    // Show results section
    elements.resultsSection.style.display = 'flex';

    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function formatInventory(inventoryText) {
    // Convert markdown-style text to HTML
    let html = inventoryText;

    // Convert **bold** to <strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<h5>$1</h5>');

    // Convert bullet points
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');

    // Wrap lists in <ul>
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Convert line breaks
    html = html.replace(/\n\n/g, '<br><br>');

    return html;
}

// ===================================
// BEFORE/AFTER SLIDER
// ===================================
let isSliding = false;

function startSlider(e) {
    isSliding = true;
    updateSlider(e);

    const moveEvent = e.type.includes('mouse') ? 'mousemove' : 'touchmove';
    const endEvent = e.type.includes('mouse') ? 'mouseup' : 'touchend';

    document.addEventListener(moveEvent, updateSlider);
    document.addEventListener(endEvent, stopSlider);
}

function updateSlider(e) {
    if (!isSliding && e.type !== 'mousedown' && e.type !== 'touchstart') return;

    const container = elements.sliderContainer;
    const rect = container.getBoundingClientRect();
    const x = (e.type.includes('mouse') ? e.clientX : e.touches[0].clientX) - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));

    elements.sliderHandle.style.left = `${percent}%`;
    elements.afterImage.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
}

function stopSlider() {
    isSliding = false;
    document.removeEventListener('mousemove', updateSlider);
    document.removeEventListener('touchmove', updateSlider);
    document.removeEventListener('mouseup', stopSlider);
    document.removeEventListener('touchend', stopSlider);
}

// ===================================
// RESET APP
// ===================================
function resetApp() {
    // Reset state
    state.uploadedImage = null;
    state.uploadedImageData = null;
    state.transformedImage = null;
    state.topViewImage = null;
    state.inventory = null;

    // Reset UI
    elements.previewImage.src = '';
    elements.promptInput.value = '';
    elements.fileInput.value = '';
    elements.uploadArea.style.display = 'block';
    elements.imagePreview.style.display = 'none';
    elements.optionsSection.style.display = 'none';
    elements.resultsSection.style.display = 'none';
    elements.progressBar.style.width = '0%';

    // Scroll to app section
    elements.uploadSection.scrollIntoView({ behavior: 'smooth' });
}

// ===================================
// DOWNLOAD IMAGES
// ===================================
async function downloadImages() {
    const images = [
        { url: state.uploadedImageData, name: 'original.jpg' },
        { url: state.transformedImage, name: 'transformed.jpg' }
    ];

    if (state.topViewImage) {
        images.push({ url: state.topViewImage, name: 'top-view.jpg' });
    }

    for (const img of images) {
        const link = document.createElement('a');
        link.href = img.url;
        link.download = img.name;
        link.click();
        await sleep(100);
    }
}

// ===================================
// SHARE RESULTS
// ===================================
async function shareResults() {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'UbahLans - My Landscape Transformation',
                text: 'Check out my AI-generated landscape transformation!',
                url: window.location.href
            });
        } catch (error) {
            console.log('Share cancelled or failed:', error);
        }
    } else {
        // Fallback: copy link
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}

// ===================================
// PLACEHOLDER IMAGE GENERATION
// ===================================
async function generatePlaceholderImage(width, height, description) {
    // Create a canvas with a gradient and text
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#10b981');
    gradient.addColorStop(0.5, '#059669');
    gradient.addColorStop(1, '#047857');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add overlay pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < width; i += 40) {
        for (let j = 0; j < height; j += 40) {
            ctx.fillRect(i, j, 20, 20);
        }
    }

    // Add text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = wrapText(ctx, description, width - 100);
    const lineHeight = 35;
    const startY = (height - (lines.length * lineHeight)) / 2;

    lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + (index * lineHeight));
    });

    // Add watermark
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('Generated by UbahLans AI', width / 2, height - 30);

    return canvas.toDataURL('image/jpeg', 0.9);
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines.slice(0, 5); // Limit to 5 lines
}

// ===================================
// START APP
// ===================================
document.addEventListener('DOMContentLoaded', init);
