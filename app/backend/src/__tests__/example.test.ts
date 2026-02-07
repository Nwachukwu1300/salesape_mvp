describe('Example Backend Test', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });

  it('should verify JWT_SECRET is set', () => {
    const secret = process.env.JWT_SECRET;
    expect(secret).toBeDefined();
    expect(secret?.length).toBeGreaterThan(0);
  });

  it('should verify DATABASE_URL is set', () => {
    const dbUrl = process.env.DATABASE_URL;
    expect(dbUrl).toBeDefined();
  });
});
