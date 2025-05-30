const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_URL = 'https://spa-locale-app-6j5f.vercel.app';

// Logging middleware
app.use(morgan('dev'));

// URL rewriting and proxy configuration
const proxyMiddleware = createProxyMiddleware({
  target: TARGET_URL,
  changeOrigin: true,
  pathRewrite: {
    // Base path rewrite
    '^/webstore/international': '/international',
    
    // Dynamic locale path rewrites
    '^/webstore/([-a-z]+)/green/pinetree/success': '/$1/pinetree/success',
    '^/webstore/([-a-z]+)/green/pinetree/fail': '/$1/pinetree/fail',
    '^/webstore/([-a-z]+)/green/pinetree': '/$1/pinetree',
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log the rewritten URL for debugging
    console.log('Proxying:', req.url, '→', proxyReq.path);
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(500).send('Proxy Error');
  }
});

// Apply proxy middleware to all /webstore routes
app.use('/webstore', proxyMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to ${TARGET_URL}`);
}); 