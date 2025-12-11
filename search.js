/**
 * Fera-Search JavaScript
 * Handles search functionality with Apache Solr integration
 */

// Configuration for Solr
const SOLR_CONFIG = {
    // Default Solr server URL - Update this to your Solr instance
    // NOTE: Use HTTPS in production to secure search queries and results
    baseUrl: 'http://localhost:8983/solr',
    // Default core name - Update this to your core name
    core: 'nutch',
    // Number of results per page
    rows: 10
};

/**
 * Asynchronous function to fetch search results from Apache Solr
 * @param {string} query - The user's search query
 * @param {number} start - Starting position for pagination (default: 0)
 */
async function searchFera(query, start = 0) {
    // Validate query
    if (!query || query.trim() === '') {
        console.warn('Search query is empty');
        displayNoResults('Please enter a search query');
        return;
    }

    try {
        // Show loading state
        displayLoading();

        // Construct Solr query URL
        const solrUrl = buildSolrUrl(query, start);
        console.log('Fetching results from:', solrUrl);

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        // Make GET request to Solr using fetch API
        const response = await fetch(solrUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Check if request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse JSON response
        const data = await response.json();
        console.log('Solr response:', data);

        // Process and display results
        displayResults(data, query);

    } catch (error) {
        console.error('Error fetching search results:', error);
        
        // Handle timeout errors specifically
        if (error.name === 'AbortError') {
            displayError(new Error('Request timed out. The server is taking too long to respond.'));
        } else {
            displayError(error);
        }
    }
}

/**
 * Build the Solr query URL with parameters
 * @param {string} query - Search query
 * @param {number} start - Start position
 * @returns {string} Complete Solr URL
 */
function buildSolrUrl(query, start) {
    const params = new URLSearchParams({
        q: query,
        wt: 'json',
        start: start,
        rows: SOLR_CONFIG.rows,
        // Additional useful parameters
        'q.op': 'OR',
        'defType': 'edismax',
        'qf': 'title^5 content^1',
        'fl': 'id,title,url,content,tstamp'
    });

    return `${SOLR_CONFIG.baseUrl}/${SOLR_CONFIG.core}/select?${params.toString()}`;
}

/**
 * Display search results in the results container
 * @param {Object} data - Solr response data
 * @param {string} query - Original search query
 */
function displayResults(data, query) {
    const resultsContainer = document.getElementById('results-container');
    
    // Extract documents from response
    const docs = data.response?.docs || [];
    const numFound = data.response?.numFound || 0;

    // Clear previous results
    resultsContainer.innerHTML = '';

    // Show results count
    const countElement = document.createElement('div');
    countElement.className = 'results-count';
    countElement.style.cssText = 'padding: 10px 0; color: #666; font-size: 14px;';
    countElement.textContent = `About ${numFound.toLocaleString()} results`;
    resultsContainer.appendChild(countElement);

    // Check if there are results
    if (docs.length === 0) {
        displayNoResults(`No results found for "${query}"`);
        return;
    }

    // Create result items for each document
    docs.forEach((doc, index) => {
        const resultItem = createResultItem(doc, index);
        resultsContainer.appendChild(resultItem);
    });
}

/**
 * Create a single result item element
 * @param {Object} doc - Solr document
 * @param {number} index - Result index
 * @returns {HTMLElement} Result item element
 */
function createResultItem(doc, index) {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';

    // Extract fields with fallbacks
    const title = doc.title || doc.id || 'Untitled';
    const url = doc.url || '#';
    const snippet = extractSnippet(doc.content || doc.description || '');

    // Create title element
    const titleElement = document.createElement('h3');
    titleElement.className = 'result-title';
    
    const linkElement = document.createElement('a');
    linkElement.className = 'result-link';
    linkElement.href = url;
    linkElement.textContent = title;
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
    
    titleElement.appendChild(linkElement);

    // Create URL element
    const urlElement = document.createElement('p');
    urlElement.className = 'result-url';
    urlElement.textContent = url;

    // Create snippet element
    const snippetElement = document.createElement('p');
    snippetElement.className = 'result-snippet';
    snippetElement.textContent = snippet;

    // Append all elements
    resultItem.appendChild(titleElement);
    resultItem.appendChild(urlElement);
    resultItem.appendChild(snippetElement);

    return resultItem;
}

/**
 * Extract and truncate snippet from content
 * @param {string} content - Full content text
 * @returns {string} Truncated snippet
 */
function extractSnippet(content) {
    const maxLength = 200;
    
    if (!content) {
        return 'No description available.';
    }

    // Remove HTML tags if present
    const text = content.replace(/<[^>]*>/g, '');
    
    // Truncate and add ellipsis
    if (text.length > maxLength) {
        return text.substring(0, maxLength).trim() + '...';
    }
    
    return text.trim();
}

/**
 * Display loading state
 */
function displayLoading() {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = `
        <div class="loading">
            <p>Searching...</p>
        </div>
    `;
}

/**
 * Display error message
 * @param {Error} error - Error object
 */
function displayError(error) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = `
        <div class="error">
            <h2>Search Error</h2>
            <p>Unable to connect to the search server. Please try again later.</p>
            <p style="font-size: 12px; margin-top: 10px; color: #999;">Error: ${error.message}</p>
        </div>
    `;
}

/**
 * Display no results message
 * @param {string} message - Message to display
 */
function displayNoResults(message) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = `
        <div class="no-results">
            <h2>No Results Found</h2>
            <p>${message}</p>
            <p style="margin-top: 20px; font-size: 14px;">Try different keywords or check your spelling.</p>
        </div>
    `;
}

/**
 * Handle search button click
 */
function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    if (query) {
        searchFera(query);
    }
}

/**
 * Initialize event listeners when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    // Search button click event
    searchButton.addEventListener('click', handleSearch);

    // Enter key press event
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

    // Logo click - refresh page
    const logo = document.querySelector('.logo');
    logo.addEventListener('click', function() {
        window.location.reload();
    });

    console.log('Fera-Search initialized');
    console.log('Solr Configuration:', SOLR_CONFIG);
    console.log('Note: Update SOLR_CONFIG in search.js to match your Solr instance');
});
