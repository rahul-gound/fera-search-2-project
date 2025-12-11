# Fera-Search Setup Guide

This guide will help you quickly set up and run Fera-Search with Apache Solr.

## Quick Start (5 Minutes)

### Step 1: Test the Interface Locally

1. Open a terminal in the project directory
2. Start a simple HTTP server:
   ```bash
   python3 -m http.server 8000
   # OR
   python -m http.server 8000
   # OR
   npx http-server
   ```
3. Open your browser to: `http://localhost:8000`
4. You should see the Fera-Search interface with placeholder results

### Step 2: Set Up Apache Solr (Development)

#### Option A: Docker (Recommended for Quick Testing)

```bash
# Pull and run Solr
docker run -d -p 8983:8983 --name solr solr:9

# Create a core named 'nutch'
docker exec -it solr solr create_core -c nutch

# Verify Solr is running
curl http://localhost:8983/solr/nutch/admin/ping
```

#### Option B: Manual Installation

```bash
# Download Solr
wget https://dlcdn.apache.org/solr/solr-9.4.0/solr-9.4.0.tgz
tar xzf solr-9.4.0.tgz
cd solr-9.4.0

# Start Solr
bin/solr start

# Create a core
bin/solr create -c nutch

# Verify
curl http://localhost:8983/solr/nutch/admin/ping
```

### Step 3: Add Sample Data to Solr

Create a file `sample_data.json`:

```json
[
  {
    "id": "1",
    "title": "Introduction to Apache Solr",
    "url": "https://example.com/solr-intro",
    "content": "Apache Solr is a powerful open-source search platform built on Apache Lucene. It provides full-text search capabilities."
  },
  {
    "id": "2",
    "title": "Getting Started with Search Engines",
    "url": "https://example.com/search-engines",
    "content": "Search engines use advanced algorithms to index and retrieve information quickly and accurately."
  },
  {
    "id": "3",
    "title": "Web Crawling with Apache Nutch",
    "url": "https://example.com/nutch-crawling",
    "content": "Apache Nutch is a highly extensible and scalable web crawler that works perfectly with Apache Solr."
  }
]
```

Upload the data to Solr:

```bash
curl -X POST -H 'Content-Type: application/json' \
  'http://localhost:8983/solr/nutch/update?commit=true' \
  --data-binary @sample_data.json
```

### Step 4: Enable CORS (Required for Local Development)

If you're running Fera-Search and Solr on different ports, enable CORS:

#### For Docker Solr:

Stop the container and restart with CORS enabled:
```bash
docker stop solr
docker rm solr
docker run -d -p 8983:8983 --name solr \
  -e SOLR_OPTS="-Dsolr.jetty.cors.enabled=true" \
  solr:9
docker exec -it solr solr create_core -c nutch
```

#### For Manual Solr Installation:

Edit `bin/solr.in.sh` (Linux/Mac) or `bin/solr.in.cmd` (Windows):

```bash
# Add this line
SOLR_OPTS="$SOLR_OPTS -Dsolr.jetty.cors.enabled=true"
```

Restart Solr:
```bash
bin/solr restart
```

### Step 5: Test the Search

1. Go to `http://localhost:8000`
2. Type a search query (e.g., "Apache", "search", "crawler")
3. Click "Search" or press Enter
4. You should see results from your Solr index!

## Using with Apache Nutch

### Step 1: Install Nutch

```bash
wget https://dlcdn.apache.org/nutch/1.19/apache-nutch-1.19-bin.tar.gz
tar xzf apache-nutch-1.19-bin.tar.gz
cd apache-nutch-1.19
```

### Step 2: Configure Nutch for Solr

Edit `conf/nutch-site.xml`:

```xml
<configuration>
  <property>
    <name>http.agent.name</name>
    <value>Fera-Search-Bot</value>
  </property>
  
  <property>
    <name>plugin.includes</name>
    <value>protocol-http|urlfilter-regex|parse-(html|tika)|index-(basic|anchor)|indexer-solr|scoring-opic|urlnormalizer-(pass|regex|basic)</value>
  </property>
</configuration>
```

### Step 3: Create Seed URLs

Create `urls/seed.txt`:
```
https://example.com
https://en.wikipedia.org/wiki/Apache_Solr
```

### Step 4: Crawl and Index

```bash
# Inject seed URLs
bin/nutch inject crawl/crawldb urls

# Generate, fetch, parse, and update
bin/nutch generate crawl/crawldb crawl/segments
bin/nutch fetch crawl/segments/[segment-name]
bin/nutch parse crawl/segments/[segment-name]
bin/nutch updatedb crawl/crawldb crawl/segments/[segment-name]

# Index to Solr
bin/nutch solrindex http://localhost:8983/solr/nutch \
  crawl/crawldb crawl/segments/[segment-name] -filter -normalize
```

## Production Deployment

### Using Nginx as Reverse Proxy

Create `/etc/nginx/sites-available/fera-search`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve the frontend
    location / {
        root /var/www/fera-search;
        index index.html;
        try_files $uri $uri/ =404;
    }

    # Proxy Solr requests
    location /solr/ {
        proxy_pass http://localhost:8983/solr/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Update `search.js`:
```javascript
const SOLR_CONFIG = {
    baseUrl: '/solr',  // Use relative path
    core: 'nutch',
    rows: 10
};
```

## Troubleshooting

### Problem: "Failed to fetch" error

**Solution:**
1. Verify Solr is running: `curl http://localhost:8983/solr/admin/cores`
2. Check CORS is enabled
3. Verify the core name matches in both Solr and `search.js`

### Problem: No results returned

**Solution:**
1. Check if data is indexed: `curl http://localhost:8983/solr/nutch/select?q=*:*`
2. Verify field names in your schema match the search.js configuration
3. Check Solr logs for errors

### Problem: CORS errors in browser console

**Solution:**
1. Enable CORS in Solr (see Step 4 above)
2. Or use a reverse proxy (see Production Deployment)
3. Or run Fera-Search and Solr on the same domain/port

## Advanced Configuration

### Custom Field Mapping

Edit `search.js` → `buildSolrUrl()` function:

```javascript
'fl': 'id,title,url,content,tstamp,author,description'  // Add more fields
```

### Search Field Weights

Modify the `qf` parameter to prioritize certain fields:

```javascript
'qf': 'title^5 content^1 description^2'  // Title is 5x more important
```

### Enable Highlighting

Add to `buildSolrUrl()`:

```javascript
'hl': 'true',
'hl.fl': 'content',
'hl.simple.pre': '<mark>',
'hl.simple.post': '</mark>'
```

## Need Help?

- Apache Solr Docs: https://solr.apache.org/guide/
- Apache Nutch Docs: https://nutch.apache.org/
- GitHub Issues: [Create an issue](https://github.com/rahul-gound/fera-search-2-project/issues)

Happy Searching! 🔍
