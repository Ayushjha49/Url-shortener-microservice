require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url');
const bodyParser = require('body-parser');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory storage for urls
let urls = [];
let id = 1;

// POST endpoint to create short url
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;
  const parsedUrl = urlParser.parse(original_url);

  // Validate URL structure
  if (!/^https?:\/\//i.test(original_url) || !parsedUrl.hostname) {
    return res.json({ error: 'invalid url' });
  }

  // Check if hostname is real
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      // Store and return
      const short_url = id++;
      urls.push({ original_url, short_url });

      res.json({
        original_url,
        short_url
      });
    }
  });
});

// GET endpoint to redirect short url
app.get('/api/shorturl/:id', (req, res) => {
  const short_url = parseInt(req.params.id);
  const entry = urls.find(u => u.short_url === short_url);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
