import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './models';
import taskRoutes from './routes/tasks';
import developerRoutes from './routes/developers';
import skillRoutes from './routes/skills';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/skills', skillRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models (don't use force: true in production)
    await sequelize.sync({ alter: false });
    console.log('Database models synced.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();
