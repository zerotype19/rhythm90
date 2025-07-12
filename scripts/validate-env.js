#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';

// Required environment variables for production
const REQUIRED_ENV_VARS = [
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID_MONTHLY',
  'STRIPE_PRICE_ID_YEARLY',
  'API_RATE_LIMIT_PER_DAY'
];

// Optional but recommended environment variables
const RECOMMENDED_ENV_VARS = [
  'APP_URL',
  'DEMO_MODE',
  'PREMIUM_MODE',
  'STRIPE_CUSTOMER_PORTAL_URL',
  'SENTRY_DSN'
];

// OAuth environment variables (optional)
const OAUTH_ENV_VARS = [
  'SLACK_CLIENT_ID',
  'SLACK_CLIENT_SECRET',
  'SLACK_SIGNING_SECRET',
  'MICROSOFT_CLIENT_ID',
  'MICROSOFT_CLIENT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');

  const missing = [];
  const recommended = [];
  const oauth = [];

  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Check recommended variables
  for (const envVar of RECOMMENDED_ENV_VARS) {
    if (!process.env[envVar]) {
      recommended.push(envVar);
    }
  }

  // Check OAuth variables
  for (const envVar of OAUTH_ENV_VARS) {
    if (!process.env[envVar]) {
      oauth.push(envVar);
    }
  }

  // Display results
  if (missing.length === 0) {
    console.log('✅ All required environment variables are set!');
  } else {
    console.log('❌ Missing required environment variables:');
    missing.forEach(envVar => {
      console.log(`   - ${envVar}`);
    });
    console.log('\n💡 Add these to your .env file or environment configuration.');
  }

  if (recommended.length > 0) {
    console.log('\n⚠️  Recommended environment variables not set:');
    recommended.forEach(envVar => {
      console.log(`   - ${envVar}`);
    });
    console.log('\n💡 These are optional but recommended for production.');
  }

  if (oauth.length > 0) {
    console.log('\n🔐 OAuth environment variables not set:');
    oauth.forEach(envVar => {
      console.log(`   - ${envVar}`);
    });
    console.log('\n💡 These are optional and only needed for OAuth integrations.');
  }

  // Check for .env.example file
  try {
    const envExamplePath = join(process.cwd(), '.env.example');
    const envExample = readFileSync(envExamplePath, 'utf8');
    console.log('\n📋 .env.example file found with template variables.');
  } catch (error) {
    console.log('\n⚠️  .env.example file not found. Consider creating one for documentation.');
  }

  // Summary
  console.log('\n📊 Summary:');
  console.log(`   Required: ${REQUIRED_ENV_VARS.length - missing.length}/${REQUIRED_ENV_VARS.length} set`);
  console.log(`   Recommended: ${RECOMMENDED_ENV_VARS.length - recommended.length}/${RECOMMENDED_ENV_VARS.length} set`);
  console.log(`   OAuth: ${OAUTH_ENV_VARS.length - oauth.length}/${OAUTH_ENV_VARS.length} set`);

  if (missing.length > 0) {
    console.log('\n🚨 Environment validation failed!');
    process.exit(1);
  } else {
    console.log('\n🎉 Environment validation passed!');
  }
}

// Run validation
validateEnvironment(); 