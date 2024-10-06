import { describe, it, expect } from 'vitest';
import { propertiesLoader } from './properties'; // Adjust the import path as needed

describe('propertiesLoader', () => {
  const loader = propertiesLoader();

  const sampleProperties = `
# General messages
welcome.message=Welcome to our application!
error.message=An error has occurred. Please try again later.

# User-related messages
user.login=Please enter your username and password.
user.username=Username
user.password=Password
  `.trim();

  it('should load properties correctly', async () => {
    const result = await loader.load(sampleProperties);
    expect(result).toEqual({
      'welcome.message': 'Welcome to our application!',
      'error.message': 'An error has occurred. Please try again later.',
      'user.login': 'Please enter your username and password.',
      'user.username': 'Username',
      'user.password': 'Password'
    });
  });

  it('should save properties correctly', async () => {
    const input = {
      'app.name': 'My App',
      'app.version': '1.0.0',
      'user.greeting': 'Hello, {0}!'
    };

    const result = await loader.save(input);
    expect(result).toContain('app.name=My App');
    expect(result).toContain('app.version=1.0.0');
    expect(result).toContain('user.greeting=Hello, {0}!');
  });

  it('should handle empty input when loading', async () => {
    const result = await loader.load('');
    expect(result).toEqual({});
  });
});
