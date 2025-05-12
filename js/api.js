/**
 * RESPONSIBLE FOR ALL COMMUNICATION WITH THE DOG API
 */
const API_KEY = 'YOUR_DOG_API_KEY';
const BASE_URL = 'https://api.thedogapi.com/v1'; // base URL of The Dog API
const SUB_ID = 'user_id_12345'; // unique identifier for the "user" or session.

/**
 * Helper function to make a generic API request (GET, POST, DELETE).
 * @param {string} endpoint - The API endpoint (e.g., '/images/search', '/favourites').
 * @param {object} options - Fetch options (method, headers, body).
 * @returns {Promise<object>} - A promise that resolves to the fetched data.
 */
async function makeApiRequest(endpoint, options = {}) {
    try {
        const url = `${BASE_URL}${endpoint}`;

        const response = await fetch(url, {
            ...options, // Spread existing options
            headers: {
                'x-api-key': API_KEY, // include API key in headers
                'Content-Type': 'application/json', // Default to JSON for POST/PUT/DELETE
                ...options.headers // Allow overriding or addingof more headers
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'No error message provided by API.' }));
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
        }

        // Check content type since some API calls may not return JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return data;
        } else {
            return { success: true, message: 'Operation successful', status: response.status };
        }

    } catch (error) {
        console.error('Error during API request:', error);
        throw error;
    }
}

/**
 * Helper function to make a GET request to The Dog API.
 * @param {string} endpoint - The API endpoint (e.g., '/images/search').
 * @param {object} params - Optional query parameters.
 * @returns {Promise<Array>} - A promise that resolves to the fetched data.
 */
async function fetchDogData(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const urlWithParams = queryString ? `${endpoint}?${queryString}` : endpoint;
    return makeApiRequest(urlWithParams, { method: 'GET' }); // use makeApiRequest for consistency
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
        order: 'Rand' // Randomize images displayed for the searched breed
    };
    if (breed_id) { // 'null' is not considered 'truthy' by this check, so params.breed_id is NOT set
        params.breed_id = breed_id;
    } else {
        params.has_breeds = 1;// Ensure breed info is included
    }
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

/**
 * Adds an image to favorites.
 * @param {string} image_id - The ID of the image to favorite.
 * @returns {Promise<object>} - A promise that resolves to the favorite object created by the API.
 */
export async function addFavorite(image_id) {
    const body = {
        image_id: image_id,
        sub_id: SUB_ID // Identify this as "user's" favorite
    };
    return makeApiRequest('/favourites', {
        method: 'POST',
        body: JSON.stringify(body)
    });
}

/**
 * Fetches all favorited images associated with the current user
 * @returns {Promise<Array>} - A promise that resolves to an array of favorite objects.
 */
export async function getFavorites() {
    // filter by sub_id
    return makeApiRequest(`/favourites?sub_id=${SUB_ID}`, { method: 'GET' });
}

/**
 * Removes an image from favorites.
 * @param {string} favorite_id - The ID of the favorite entry (obtained when fetching favorites).
 * @returns {Promise<object>} - A promise indicating success or failure.
 */
export async function removeFavorite(favorite_id) {
    return makeApiRequest(`/favourites/${favorite_id}`, {
        method: 'DELETE'
    });
}