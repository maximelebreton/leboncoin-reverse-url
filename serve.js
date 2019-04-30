const http = require('http');
const Url = require('url');
const ReverseUrl = require('./index.js');
const testUrls = require('./src/testUrls.json');

let html = ``;
html += `<link rel="stylesheet"
href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.6/styles/default.min.css">`;
html += `<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.6/highlight.min.js"></script>`;
html += `<script>hljs.initHighlightingOnLoad();</script>`;

testUrls.forEach(url => {
  let json = JSON.stringify(ReverseUrl(url));
  html += `<b><small>${Url.parse(url).query}</small></b><br>`;
  html += `<pre><code class="json">${json}</code></pre>`;

  html += '<br><br>';
});

//create a server object:
http
  .createServer(function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    res.write(
      //JSON.stringify(getUrlParams(testUrl)),
      html
    ); //write a response to the client
    res.end(); //end the response
  })
  .listen(8080); //the server object listens on port 8080
