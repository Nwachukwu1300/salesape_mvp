import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Global test configuration
process.env.DATABASE_URL = 'file:./test.db';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-not-for-production';
process.env.ENCRYPTION_KEY = '00aabbccddeeffaabbccddeeffaabbcc';

// Global test timeout
jest.setTimeout(10000);

// Mock external services
if (jest && jest.mock) {
  try {
    jest.mock('nodemailer');
    jest.mock('twilio');
    jest.mock('googleapis');
  } catch (e) {
    // Mocks might already be set up
  }
}
