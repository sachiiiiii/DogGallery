/**
 * DOM MANIPULATION
 */
// Get DOM elements (export them if needed elsewhere, but generally better to pass them)
const dogImagesContainer = document.getElementById('dog-images-container');
const favoriteImagesContainer = document.getElementById('favorite-images-container');
const breedInput = document.getElementById('breed-input');
const searchButton = document.getElementById('search-button');
const clearButton = document.getElementById('clear-button');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');

// Helper function to show messages to the user (e.g., errors, loading)
export function showMessage(message, type = 'info') {
    // log to console or add a basic temporary div
    let messageDiv = document.getElementById('app-message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'app-message';
        messageDiv.style.cssText = `
            padding: 10px;
            margin-bottom: 20px;
            text-align: center;
            border-radius: 5px;
            font-weight: bold;
        `;
        document.querySelector('main').prepend(messageDiv); // Add error message box before <main> section
    }

    messageDiv.textContent = message;
    messageDiv.style.backgroundColor = type === 'error' ? '#f8d7da' :
                                       type === 'success' ? '#d4edda' :
                                       '#e2e3e5';
    messageDiv.style.color = type === 'error' ? '#721c24' :
                             type === 'success' ? '#155724' :
                             '#383d41';
    messageDiv.style.borderColor = type === 'error' ? '#f5c6cb' :
                                   type === 'success' ? '#c3e6cb' :
                                   '#d6d8db';
    messageDiv.style.display = 'block'; // Ensure err msg box is visible

    // Hide after a few seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 8000);
}


// Helper function to create 1 dog image card
/**
 * @param {Object} image - from API response body
 * @param {Object} butonConfig 
 * @returns {HTMLElement} card with dog image
 */
export function createDogImageCard(image, buttonConfig = {}) {
    const card = document.createElement('div');
    card.className = 'dog-image-card';
    card.dataset.imageId = image.id; // Store the image's ID on the card for easy access
    if (image.favorite_id) { // If the image has been favorited, store its favorite_id
        card.dataset.favoriteId = image.favorite_id;
    }

    const img = document.createElement('img');
    img.src = image.url;
    // Use the breed name as alt text for accessibility
    img.alt = image.breeds && image.breeds.length > 0 ? image.breeds[0].name : 'Dog image';
    img.loading = 'lazy'; // Improve performance by lazy loading images

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'actions';

    // Add a button based on the buttonConfig object
    if (buttonConfig.text && buttonConfig.className && buttonConfig.onClick) {
        const actionButton = document.createElement('button');
        actionButton.textContent = buttonConfig.text;
        actionButton.className = buttonConfig.className;
        // Pass image.id and image.favorite_id to the onClick handler
        // The handler will use each one as appropriate
        actionButton.addEventListener('click', () => buttonConfig.onClick(image.id, image.favorite_id || null));
        actionsDiv.appendChild(actionButton);
    }

    card.appendChild(img);
    card.appendChild(actionsDiv);

    return card;
}

/**
 * Displays an array of dog images in a specified container.
 * Clears previous images before displaying new ones.
 * @param {Array<object>} images - An array of dog image objects.
 * @param {HTMLElement} containerElement - DOM element to append images to.
 * @param {object} buttonConfig - Configuration for the button on each card {text, className, onClick}.
 */
export function displayImages(images, containerElement, buttonConfig = {}) {
    clearImages(containerElement); // Clear existing images first

    if (!images || images.length === 0) {
        showMessage('No images to display.', 'info');
        return;
    }

    images.forEach(image => {
        const card = createDogImageCard(image, buttonConfig);
        containerElement.appendChild(card);
    });
}

/**
 * Clears all image cards from a specified container.
 * @param {HTMLElement} containerElement - The container element to remove child elements from
 */
export function clearImages(containerElement) {
    containerElement.innerHTML = ''; // Remove all child elements
}

/**
 * Enables or disables pagination buttons.
 * @param {boolean} canGoPrev - True if the previous button should be enabled.
 * @param {boolean} canGoNext - True if the next button should be enabled.
 */
export function updatePaginationButtons(canGoPrev, canGoNext) {
    prevPageButton.disabled = !canGoPrev;
    nextPageButton.disabled = !canGoNext;
}

/**
 * Returns the value from the breed input field.
 * @returns {string} The trimmed value of the breed input.
 */
export function getBreedInput() {
    return breedInput.value.trim();
}

/**
 * Retrives references to core DOM elements for use in app.js
 * @returns {object} An object containing references to key DOM elements.
 */
export function getDOMElements() {
    return {
        dogImagesContainer,
        favoriteImagesContainer,
        breedInput,
        searchButton,
        clearButton,
        prevPageButton,
        nextPageButton
    };
}

// Loading indicator functions to improve user experience
export function showLoading(container = dogImagesContainer) {
    clearImages(container); // Clear container content while loading
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-indicator';
    loadingDiv.textContent = 'Loading dog images...';
    loadingDiv.style.cssText = `
        
        text-align: center;
        padding: 20px;
        font-size: 1.2em;
        color: #555;
    `;
    container.appendChild(loadingDiv);
}

export function hideLoading() {
    const loadingDiv = document.getElementById('loading-indicator');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}