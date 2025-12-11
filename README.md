# Fera-Search

A minimalist, modern search engine interface powered by Apache Solr and Apache Nutch.

## Features

- **Modern UI**: Clean, minimalist design with responsive layout
- **Deep Orange Theme**: Distinctive #FF4500 color scheme for branding and accents
- **Apache Solr Integration**: Real-time search powered by Apache Solr
- **Fast & Efficient**: Asynchronous JavaScript with Fetch API
- **Error Handling**: Graceful error handling with user-friendly messages
- **Mobile Responsive**: Works seamlessly on all devices

## Files

- `index.html` - Main HTML5 document with search interface
- `styles.css` - Complete styling with modern, minimalist aesthetic
- `search.js` - JavaScript with Solr integration and search functionality

## Setup Instructions

### Prerequisites

1. **Apache Solr** - Running instance of Apache Solr
2. **Apache Nutch** (Optional) - For web crawling and indexing

### Configuration

1. **Update Solr Configuration** in `search.js`:
   ```javascript
   const SOLR_CONFIG = {
       baseUrl: 'http://localhost:8983/solr',  // Your Solr server URL
       core: 'nutch',                          // Your Solr core name
       rows: 10                                 // Results per page
   };
   ```

2. **Enable CORS** on your Solr server if running locally:
   - Edit `solr.in.sh` (Linux/Mac) or `solr.in.cmd` (Windows)
   - Add: `SOLR_OPTS="$SOLR_OPTS -Dsolr.jetty.cors.enabled=true"`

### Running the Application

1. **Simple HTTP Server**:
   ```bash
   python -m http.server 8000
   ```
   Then visit: `http://localhost:8000`

2. **Node.js HTTP Server**:
   ```bash
   npx http-server
   ```

3. **Direct File Access**: Open `index.html` in a web browser
   - Note: You may need to run from a server for fetch API to work properly

## Apache Solr Setup

### Quick Start with Solr

1. **Download and Install Solr**:
   ```bash
   wget https://dlcdn.apache.org/solr/solr-9.4.0/solr-9.4.0.tgz
   tar xzf solr-9.4.0.tgz
   cd solr-9.4.0
   ```

2. **Start Solr**:
   ```bash
   bin/solr start
   ```

3. **Create a Core**:
   ```bash
   bin/solr create -c nutch
   ```

4. **Index Sample Data** (for testing):
   ```bash
   bin/post -c nutch example/exampledocs/*.xml
   ```

## Apache Nutch Integration

### Using with Apache Nutch

1. **Download Nutch**:
   ```bash
   wget https://dlcdn.apache.org/nutch/2.4/apache-nutch-2.4-bin.tar.gz
   tar xzf apache-nutch-2.4-bin.tar.gz
   ```

2. **Configure Nutch** to use Solr:
   - Edit `conf/nutch-site.xml`
   - Configure Solr indexer plugin

3. **Crawl and Index**:
   ```bash
   bin/nutch inject
   bin/nutch generate
   bin/nutch fetch
   bin/nutch parse
   bin/nutch index
   ```

## Usage

1. Open the Fera-Search interface in your browser
2. Enter your search query in the search bar
3. Click "Search" or press Enter
4. View results with titles, URLs, and snippets
5. Click on any result to visit the page

## Customization

### Color Theme
To change the orange theme, update the color values in `styles.css`:
```css
.logo { color: #FF4500; }
.search-button { background-color: #FF4500; }
```

### Solr Query Parameters
Modify query parameters in `search.js` → `buildSolrUrl()` function:
```javascript
q: query,           // Main query
qf: 'content title', // Query fields
defType: 'edismax', // Query parser
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Enable CORS in Solr configuration
2. Or use a proxy server
3. Or run both on the same domain/port

### Solr Connection Failed
- Verify Solr is running: `http://localhost:8983/solr`
- Check the Solr URL in `search.js` matches your setup
- Verify the core name exists

### No Results
- Ensure your Solr core has indexed data
- Check Solr query in browser console
- Verify field names match your schema

## License

This project is open source and available for educational purposes.

## Credits

- Powered by Apache Solr
- Web crawling with Apache Nutch
- Modern HTML5, CSS3, and JavaScript