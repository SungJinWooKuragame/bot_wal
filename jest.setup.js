// Jest setup file
// Add any global test setup here

// Mock environment variables if not present
process.env.DATABASE_URL = process.env.DATABASE_URL || "mysql://root@localhost/test_db"
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "test-secret"
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"
