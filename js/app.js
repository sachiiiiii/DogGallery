import { getDogImages, getBreeds, addFavorite, getFavorites, removeFavorite } from './api.js';
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

let currentBreedId = ''; // Stores the ID of the recently searched breed
let currentPage = 0;
const IMAGES_PER_PAGE = 10; // Define how many images to fetch per page

// Function to load and display dog images in Dog Gallery
async function loadDogImages(breedId = '', page = 0) {
    currentBreedId = breedId; // Update currentBreedId
    currentPage = page; // Update currentPage

    showLoading(dogImagesContainer); // Show loading indicator
    clearImages(dogImagesContainer); // Ensure container is clear before loading images

    try {
        const images = await getDogImages({ breed_id: breedId, limit: IMAGES_PER_PAGE, page: page });
        console.log('Loaded images:', images); // For debugging

        const favoriteButtonConfig = {
            text: 'Favorite',
            className: 'favorite-btn',
            onClick: async (imageId) => {
                // Implement favoriting logic
                try {
                    const result = await addFavorite(imageId);
                    console.log('Favorite added:', result);
                    showMessage('Image added to favorites!', 'success');
                    loadFavoriteImages(); // Reload favorites section after adding
                } catch (error) {
                    console.error('Failed to add favorite:', error);
                    showMessage('Failed to add image to favorites. Please try again.', 'error');
                }
            }
        };
        displayImages(images, dogImagesContainer, favoriteButtonConfig);

        // Basic Pagination
        updatePaginationButtons(currentPage > 0, images.length === IMAGES_PER_PAGE); // Enable next button only if the IMAGES_PER_PAGE limit was reached
    } catch (error) {
        console.error('Failed to load dog images:', error);
        showMessage('Failed to load dog images. Please try again later.', 'error');
        clearImages(dogImagesContainer); // Clear dog gallery container
    } finally {
        hideLoading(); // Hide loading indicator
    }
}

// Function to load and display favorited images
async function loadFavoriteImages() {
    showLoading(favoriteImagesContainer);
    clearImages(favoriteImagesContainer);

    try {
        const favorites = await getFavorites();
        console.log('Loaded favorites:', favorites);

        // Favorites API returns an array of objects:
        // { "id": 123, "user_id": "user_id", "image_id": "abc", "image": { "id": "abc", "url": "..." } }
        // Extract image object from each favorite entry.
        const favoriteImages = favorites.map(fav => fav.image);

        if (favoriteImages.length === 0) {
            showMessage('You have no favorites yet!', 'info');
            // Display a message in the favorites container
            favoriteImagesContainer.innerHTML = '<p style="text-align: center;">Add some images to your favorites!</p>';
            hideLoading();
            return;
        }

        const removeFavoriteButtonConfig = {
            text: 'Remove Favorite',
            className: 'remove-favorite-btn',
            onClick: async (imageId, favoriteId) => {// favoriteId is passed from createDogImageCard's dataset.
                try {
                    const result = await removeFavorite(favoriteId);
                    console.log('Favorite removed:', result);
                    showMessage('Image removed from favorites!', 'success');
                    loadFavoriteImages(); // Reload favorites section after removal
                } catch (error) {
                    console.error('Failed to remove favorited image:',error);
                    showMessage('Failed to remove image from favorites. Please try again.', 'error');
                }
            }
        };
        // Pass the favorite.id (the ID of the favorite entry) to the onClick handler
        // This needs a slight modification to how createDogImageCard handles button onClick
        // The image object passed to createDogImageCard for favorites also needs the 'id' property for the favorite entry itself.
        // The fav.image object has 'id' and 'url', but the `removeFavorite` needs `fav.id`.
        // Ensure the `favoriteId` is passed to the `onClick` handler.

        // Re-mapping for display with favoriteId:
        const imagesToDisplay = favorites.map(fav => ({
            ...fav.image, // Spread the image properties (id, url)
            favorite_id: fav.id // Add favorite ID to image object for easy access
        }));

        displayImages(imagesToDisplay, favoriteImagesContainer, removeFavoriteButtonConfig);


    } catch (error) {
        console.error('Failed to load favorite images:', error);
        showMessage('Failed to load favorites. Please try again later.', 'error');
        clearImages(favoriteImagesContainer);
    } finally {
        hideLoading();
    }
}

// EVENT LISTENERS
// Search Button Event Listener
searchButton.addEventListener('click', async () => {
    const breedName = getBreedInput();
    // Get the breed ID first
    if (!breedName) {
        showMessage('Please enter a breed name to search.', 'info');
        return;
    }
    showLoading(dogImagesContainer);

    try {
        console.log('Attempting to search for breed:', breedName);
        const breeds = await getBreeds(); // Fetch all available breeds
        
        // Log all breeds fetched to verify breed names
        console.log('All available breeds:', breeds.map(b => b.name));

        const foundBreed = breeds.find(breed =>
            breed.name.toLowerCase().includes(breedName.toLowerCase())
        );

        if (foundBreed) {
            console.log('Breed found:', foundBreed.name, '|ID:',foundBreed.id);
            showMessage(`Searching for "${foundBreed.name}"...`, 'info');
            loadDogImages(foundBreed.id, 0); // Load images for the found breed, reset page to 0
        } else {
            console.log('Breed not found for input:', breedName);
            showMessage(`Breed "${breedName}" not found. Be more specific or try another name.`, 'error');
            clearImages(dogImagesContainer); // Clear previous results
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
    loadDogImages('', 0);
    showMessage('Search cleared. Displaying random images.', 'info');
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
    showMessage('Displaying random images.', 'info');
    loadFavoriteImages(); // Load favorites
    
});
