import { sequelize } from './index';

async function syncDatabase() {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ force: true }); // Use { force: true } to drop and recreate tables
    console.log('Database synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
}

syncDatabase();
