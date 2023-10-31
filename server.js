const express = require('express');
const app = express();

const PORT = 3000;

// Body-parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API routes
app.use('/api', require('./api'));

// Simple error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status ?? 500;
  const message = err.message ?? 'Internal server error.';
  res.status(status).json({ message });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});
