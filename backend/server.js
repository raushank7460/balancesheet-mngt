const app = require('./app');

const PORT = process.env.PORT || 5000;

// Connect to database and start server
if (app.connectDB) {
  app.connectDB();
}

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` EquiBalance Backend running on port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

