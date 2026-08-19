const app = require('./app');

const PORT = process.env.PORT || 5000;

// Start server (DB connection handled inside app.js middleware)
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` EquiBalance Backend running on port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

