/**
 * RESPONSIBLE FOR ALL COMMUNICATION WITH THE DOG API
 */
const API_KEY = 'live_CKDaBwsUvLwsD8QOO5mzUqmgAQnf5rMhMIPb84FPTZMYKPfMvPqD6fi0taepTWRT';
const BASE_URL = 'https://api.thedogapi.com/v1'; // base URL of The Dog API

/**
 * Helper function to make a GET request to The Dog API.
 * @param {string} endpoint - The API endpoint (e.g., '/images/search').
 * @param {object} params - Optional query parameters.
 * @returns {Promise<Array>} - A promise that resolves to the fetched data.
 */
async function fetchDogData(endpoint, params = {}) {
    // try...catch handles errors that occur during GET operation
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `${BASE_URL}${endpoint}?${queryString}`;

        const response = await fetch(url, {
            headers: {
                'x-api-key': API_KEY // Include API key in the headers
            }
        });
        // If response is not OK (e.g., 404, 500),
        if (!response.ok) {
            const errorData = await response.json(); // Try to parse error message
            // throw an error
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json(); // parse the response body as JSON
        return data;
    } catch (error) {
        console.error('Error fetching dog data:', error);
        // Re-throw the error so that the functions that invoke fetchDogData can handle it or display an error message to the user
        throw error;
    }
}

/**
 * Fetch a list of dog breeds
 * @returns {Promise<Array>} - A promise that resolves to an array of breed objects.
 */
export async function getBreeds() {
    return fetchDogData('/breeds');
}

/**
 * Fetch dog images
 * @param {string} breed_id - ID of the breed being searched for
 * @param {number} limit - Number of images to return (default: 10).
 * @param {number} page - Page number for pagination (default: 0).
 * @returns {Promise<Array>} - A promise that resolves to an array of image objects.
 */
export async function getDogImages({ breed_id = '', limit = 10, page = 0 } = {}) {
    const params = {
        limit: limit,
        page: page,
        order: 'Rand', // Randomize images displayed for the searched breed
        breed_id: breed_id,
        has_breeds: 1 // Ensure breed info is include
    };

    return fetchDogData('/images/search', params);
}

/**
 * Fetch a specific dog image by its ID
 * @param {string} image_id - The image's ID
 * @returns {Promise<object>} - A promise that resolves to an image object.
 */
export async function getImageById(image_id) {
    return fetchDogData(`/images/${image_id}`);
}

// Export API_KEY, for use in other operations
export { API_KEY };