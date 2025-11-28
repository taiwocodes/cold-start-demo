// host the frontend.html file for web preview on port 8080
const http = require('http');
const fs = require('fs');
// 1. We require the 'url' module to correctly parse the path
const url = require('url'); 
const port = 8080;

const server = http.createServer((req, res) => {
    
    // 2. Parse the URL to get only the pathname, ignoring query parameters (like ?authuser=0)
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;

    // 3. We check against the clean pathname, which should be '/'
    if (pathname === '/') {
        fs.readFile('frontend.html', (err, data) => {
            if (err) {
                // Diagnostic logging
                console.error('SERVER ERROR: Failed to read frontend.html. Check file name and path.', err.message); 
                
                res.writeHead(500);
                res.end('Internal Server Error: Could not load frontend.html.');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else {
        // 404 for all other paths
        res.writeHead(404);
        res.end('Not Found: Only the root path (/) is served.');
    }
});

server.listen(port, () => {
    console.log(`Server is running! Access the UI at http://localhost:${port}.`);
});
