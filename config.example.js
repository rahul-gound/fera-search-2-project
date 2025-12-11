/**
 * Fera-Search Configuration Example
 * 
 * This file provides example configurations for different Solr setups.
 * Copy the appropriate configuration to search.js SOLR_CONFIG object.
 */

// Local Development Configuration
const LOCAL_CONFIG = {
    baseUrl: 'http://localhost:8983/solr',
    core: 'nutch',
    rows: 10
};

// Production Configuration Example
const PRODUCTION_CONFIG = {
    baseUrl: 'https://your-domain.com/solr',
    core: 'nutch',
    rows: 20
};

// Cloud Solr Configuration Example
const CLOUD_CONFIG = {
    baseUrl: 'https://your-solr-cloud.com:8983/solr',
    core: 'nutch',
    rows: 15
};

// Custom Port Configuration
const CUSTOM_PORT_CONFIG = {
    baseUrl: 'http://localhost:8080/solr',
    core: 'my-search-core',
    rows: 10
};

/**
 * Instructions:
 * 1. Choose the configuration that matches your setup
 * 2. Copy the config object to search.js
 * 3. Update the SOLR_CONFIG constant in search.js
 * 4. Modify values as needed for your specific setup
 */
