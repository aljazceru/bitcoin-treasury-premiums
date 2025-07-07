import { db } from '../src/models/database';

beforeAll(async () => {
  // Use in-memory database for tests
  process.env.DATABASE_PATH = ':memory:';
  await db.initialize();
});

afterAll(async () => {
  await db.close();
});

afterEach(async () => {
  // Clean up database between tests
  try {
    await db.run('DELETE FROM companies');
    await db.run('DELETE FROM stock_prices');
    await db.run('DELETE FROM bitcoin_prices');
  } catch (error) {
    // Ignore cleanup errors to prevent test failures
    console.warn('Database cleanup warning:', error);
  }
});