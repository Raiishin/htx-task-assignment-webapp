// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-api-key';
// Use SQLite in-memory database for tests to avoid needing PostgreSQL running
process.env.DATABASE_URL = 'sqlite::memory:';
