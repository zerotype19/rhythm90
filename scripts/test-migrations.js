#!/usr/bin/env node

import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';

console.log('🧪 Testing migrations on fresh local database...\n');

try {
  // Create a fresh local database
  console.log('1. Creating fresh local database...');
  execSync('npx wrangler d1 create rhythm90-test --local', { stdio: 'inherit' });
  
  // Get the database ID from the output
  const dbOutput = execSync('npx wrangler d1 list --local', { encoding: 'utf8' });
  const dbMatch = dbOutput.match(/rhythm90-test\s+([a-f0-9-]+)/);
  
  if (!dbMatch) {
    throw new Error('Could not find test database ID');
  }
  
  const dbId = dbMatch[1];
  console.log(`   Database ID: ${dbId}`);
  
  // Apply migrations
  console.log('\n2. Applying migrations...');
  execSync(`npx wrangler d1 migrations apply rhythm90-test --local`, { stdio: 'inherit' });
  
  // Test basic queries
  console.log('\n3. Testing basic queries...');
  const testQueries = [
    'SELECT name FROM sqlite_master WHERE type="table"',
    'SELECT COUNT(*) as user_count FROM users',
    'SELECT COUNT(*) as team_count FROM teams',
    'SELECT COUNT(*) as play_count FROM plays'
  ];
  
  for (const query of testQueries) {
    try {
      const result = execSync(`npx wrangler d1 execute rhythm90-test --local --command="${query}"`, { encoding: 'utf8' });
      console.log(`   ✅ ${query}: ${result.trim()}`);
    } catch (error) {
      console.log(`   ❌ ${query}: ${error.message}`);
    }
  }
  
  // Clean up
  console.log('\n4. Cleaning up test database...');
  execSync(`npx wrangler d1 delete rhythm90-test --local`, { stdio: 'inherit' });
  
  console.log('\n🎉 Migration test completed successfully!');
  
} catch (error) {
  console.error('\n❌ Migration test failed:', error.message);
  process.exit(1);
} 