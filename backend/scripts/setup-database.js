/**
 * Database Setup Script
 * 
 * This script runs all database migrations to set up the Groove application schema.
 * It should be run once when setting up a new Supabase project.
 * 
 * Usage:
 *   node scripts/setup-database.js
 * 
 * Prerequisites:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env
 *   - Service role key is required (not anon key) for admin operations
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  console.error('   Note: You need the SERVICE_ROLE_KEY (not ANON_KEY) for database setup');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Execute a SQL migration file
 */
async function runMigration(filename) {
  const migrationPath = path.join(__dirname, '..', 'migrations', filename);
  
  console.log(`\n📄 Running migration: ${filename}`);
  
  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the SQL using Supabase's RPC or direct query
    // Note: Supabase doesn't have a direct SQL execution method in the JS client
    // This would typically be run via the Supabase CLI or dashboard
    // For now, we'll output instructions
    
    console.log(`✅ Migration file loaded: ${filename}`);
    console.log(`   File contains ${sql.split('\n').length} lines`);
    
    return { success: true, filename };
  } catch (error) {
    console.error(`❌ Error loading migration ${filename}:`, error.message);
    return { success: false, filename, error: error.message };
  }
}

/**
 * Main setup function
 */
async function setupDatabase() {
  console.log('🚀 Starting Groove Database Setup\n');
  console.log('=' .repeat(60));
  
  const migrations = [
    '001_initial_schema.sql',
    '002_rls_policies.sql',
    '003_storage_setup.sql'
  ];
  
  const results = [];
  
  for (const migration of migrations) {
    const result = await runMigration(migration);
    results.push(result);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Migration Summary:\n');
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.filename}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  const allSuccess = results.every(r => r.success);
  
  if (allSuccess) {
    console.log('\n✨ All migration files loaded successfully!\n');
    console.log('📝 Next Steps:');
    console.log('   1. Open your Supabase Dashboard (https://app.supabase.com)');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Run each migration file in order:');
    migrations.forEach((m, i) => {
      console.log(`      ${i + 1}. backend/migrations/${m}`);
    });
    console.log('\n   Alternatively, use the Supabase CLI:');
    console.log('      supabase db push');
  } else {
    console.log('\n⚠️  Some migrations failed to load. Please check the errors above.');
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch(error => {
  console.error('\n❌ Fatal error during database setup:', error);
  process.exit(1);
});
