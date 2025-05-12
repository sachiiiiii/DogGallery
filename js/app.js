import { getDogImages, getBreeds, API_KEY } from './api.js'; // Ensure API_KEY is imported for later use
import {
    displayImages,
    getDOMElements,
    showLoading,
    hideLoading,
    showMessage,
    getBreedInput,
    updatePaginationButtons, // Import for pagination
    clearImages
} from './ui.js';

const {
    dogImagesContainer,
    favoriteImagesContainer,
    breedInput,
    searchButton,
    clearButton,
    prevPageButton,
    nextPageButton
} = getDOMElements();
//^Call getDOMElements() once at the top and destructure the returned object to easily access DOM elements.

let currentBreedId = ''; // Stores the ID of the currently searched breed
let currentPage = 0;
const IMAGES_PER_PAGE = 10; // Define how many images to fetch per page

// Function to load and display dog images
async function loadDogImages(breedId = '', page = 0) {
    currentBreedId = breedId; // Update global currentBreedId
    currentPage = page; // Update global currentPage

    showLoading(dogImagesContainer); // Show loading indicator
    clearImages(dogImagesContainer); // Ensure container is clear before loading

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

        // Basic Pagination
        updatePaginationButtons(currentPage > 0, images.length === IMAGES_PER_PAGE); // Enable next button only if the full limit of images was retrieved
    } catch (error) {
        console.error('Failed to load dog images:', error);
        showMessage('Failed to load dog images. Please try again later.', 'error');
        clearImages(dogImagesContainer); // Clear dog gallery container
    } finally {
        hideLoading(); // Hide loading indicator
    }
}

// EVENT LISTENERS
searchButton.addEventListener('click', async () => {
    const breedName = getBreedInput();
    // For search, get the breed ID first.
    if (!breedName) {
        showMessage('Please enter a breed name to search.', 'info');
        loadDogImages(); // Reload random images if search input is empty
        return;
    }
    showLoading(dogImagesContainer);

    try {
        const breeds = await getBreeds(); // Fetch all available breeds
        
        // Log all breeds fetched to verify breed names
        console.log('All available breeds:', breeds.map(b => b.name));

        const foundBreed = breeds.find(breed =>
            breed.name.toLowerCase().includes(breedName.toLowerCase())
        );

        // Log foundBreed array
        console.log('Breed found: ',foundBreed);

        if (foundBreed) {
            showMessage(`Searching for "${foundBreed.name}"...`, 'info');
            loadDogImages(foundBreed.id, 0); // Load images for the found breed, reset page to 0
        } else {
            showMessage(`Breed "${breedName}" not found. Be more specific or try another name.`, 'error');
            clearImages(dogImagesContainer); // Clear previous results
            // Load random images again if breed entered is not found
            loadDogImages();
        }
    } catch (error) {
        console.error('Error during breed search:', error);
        showMessage('Failed to search for breeds. Please try again later.', 'error');
    } finally {
        hideLoading();
    }
});

clearButton.addEventListener('click', () => {
    breedInput.value = ''; // Clear the input field
    clearImages(dogImagesContainer);
    showMessage('Search cleared.', 'info');
});

// Pagination Event Listeners (Basic implementation)
prevPageButton.addEventListener('click', () => {
    if (currentPage > 0) {
        loadDogImages(currentBreedId, currentPage - 1);
    }
});
nextPageButton.addEventListener('click', () => {
    loadDogImages(currentBreedId, currentPage + 1);
});

// Initial load of dog images only after the entire HTML document has been fully loaded and parsed
document.addEventListener('DOMContentLoaded', () => {
    loadDogImages(); // Load initial images
    loadFavoriteImages(); // Load favorites
});

// Favorites display
async function loadFavoriteImages() {
    console.log('Loading favorite images (coming soon!)');
    clearImages(favoriteImagesContainer);
}