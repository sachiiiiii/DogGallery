import { getDogImages } from './api.js';
import { displayImages, clearImages, getDOMElements, showLoading, hideLoading, showMessage } from './ui.js';

const { dogImagesContainer, breedInput, searchButton, clearButton, prevPageButton, nextPageButton, favoriteImagesContainer } = getDOMElements();
//^Call getDOMElements() once at the top and destructure the returned object to easily access DOM elements.

let currentPage = 0;
const IMAGES_PER_PAGE = 10; // Define how many images to fetch per page

// Function to load and display dog images
async function loadDogImages(breedId = '', page = 0) {
    showLoading(dogImagesContainer); // Show loading indicator
    try {
        const images = await getDogImages({ breed_id: breedId, limit: IMAGES_PER_PAGE, page: page });
        console.log('Loaded images:', images); // For debugging

        const favoriteButtonConfig = {
            text: 'Favorite',
            className: 'favorite-btn',
            onClick: (imageId) => {
                // Implemented in POST/DELETE requests
                console.log(`Attempting to favorite image with ID: ${imageId}`);
                showMessage(`Feature: Favorite image ${imageId} (coming soon!)`, 'info');
            }
        };
        displayImages(images, dogImagesContainer, favoriteButtonConfig);
        // Update pagination buttons here based on total results,
        // which requires knowing the total count from the API response (not directly available in /images/search).
    } catch (error) {
        console.error('Failed to load dog images:', error);
        showMessage('Failed to load dog images. Please try again later.', 'error');
        clearImages(dogImagesContainer); // Clear loading or previous failed state
    } finally {
        hideLoading(); // Hide loading indicator
    }
}

// Event Listeners
searchButton.addEventListener('click', () => {
    const breedName = getBreedInput();
    // For search, get the breed ID first. This will be handled in the search feature.
    showMessage(`Searching for breed: "${breedName}" (feature coming soon!)`, 'info');
    loadDogImages();
});

clearButton.addEventListener('click', () => {
    breedInput.value = ''; // Clear the input field
    loadDogImages(); // Reload default random images
    showMessage('Search cleared.', 'info');
});

// Initial load of dog images only after the entire HTML document has been fully loaded and parsed
document.addEventListener('DOMContentLoaded', () => {
    loadDogImages(); // Load initial images
});

// Favorites display
async function loadFavoriteImages() {
    console.log('Loading favorite images (coming soon!)');
    showMessage('Feature: Loading favorites (coming soon!)', 'info');
    clearImages(favoriteImagesContainer);
}

// Call favorites load when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadFavoriteImages();
});