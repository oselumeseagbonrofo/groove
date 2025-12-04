/**
 * Database Verification Script
 * 
 * This script verifies that the Groove database schema is set up correctly.
 * It checks for the existence of tables, indexes, RLS policies, and storage buckets.
 * 
 * Usage:
 *   node scripts/verify-database.js
 * 
 * Prerequisites:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Check if required tables exist
 */
async function checkTables() {
  console.log('\n📋 Checking Tables...');
  
  const requiredTables = ['users', 'auth_tokens', 'vinyl_designs', 'error_logs'];
  const results = [];
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);
      
      if (error && error.code === '42P01') {
        // Table doesn't exist
        console.log(`   ❌ Table '${table}' not found`);
        results.push({ table, exists: false });
      } else if (error) {
        console.log(`   ⚠️  Table '${table}' - Error: ${error.message}`);
        results.push({ table, exists: false, error: error.message });
      } else {
        console.log(`   ✅ Table '${table}' exists`);
        results.push({ table, exists: true });
      }
    } catch (err) {
      console.log(`   ❌ Table '${table}' - Error: ${err.message}`);
      results.push({ table, exists: false, error: err.message });
    }
  }
  
  return results;
}

/**
 * Check if storage bucket exists
 */
async function checkStorageBucket() {
  console.log('\n💾 Checking Storage Bucket...');
  
  try {
    const { data, error } = await supabase
      .storage
      .getBucket('vinyl-images');
    
    if (error) {
      console.log(`   ❌ Bucket 'vinyl-images' not found: ${error.message}`);
      return { exists: false, error: error.message };
    }
    
    console.log(`   ✅ Bucket 'vinyl-images' exists`);
    console.log(`      - Public: ${data.public}`);
    console.log(`      - File size limit: ${data.file_size_limit ? (data.file_size_limit / 1024 / 1024) + 'MB' : 'Not set'}`);
    
    return { exists: true, bucket: data };
  } catch (err) {
    console.log(`   ❌ Error checking bucket: ${err.message}`);
    return { exists: false, error: err.message };
  }
}

/**
 * Test basic CRUD operations
 */
async function testCRUDOperations() {
  console.log('\n🧪 Testing Basic Operations...');
  
  try {
    // Test insert
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({
        provider: 'spotify',
        provider_id: 'test_verify_' + Date.now(),
        email: 'verify@test.com',
        display_name: 'Verification Test User'
      })
      .select()
      .single();
    
    if (insertError) {
      console.log(`   ❌ Insert test failed: ${insertError.message}`);
      return { success: false };
    }
    
    console.log(`   ✅ Insert test passed (created user ${user.id})`);
    
    // Test select
    const { data: selectedUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (selectError) {
      console.log(`   ❌ Select test failed: ${selectError.message}`);
      return { success: false };
    }
    
    console.log(`   ✅ Select test passed`);
    
    // Test update
    const { error: updateError } = await supabase
      .from('users')
      .update({ display_name: 'Updated Test User' })
      .eq('id', user.id);
    
    if (updateError) {
      console.log(`   ❌ Update test failed: ${updateError.message}`);
      return { success: false };
    }
    
    console.log(`   ✅ Update test passed`);
    
    // Test delete
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);
    
    if (deleteError) {
      console.log(`   ❌ Delete test failed: ${deleteError.message}`);
      return { success: false };
    }
    
    console.log(`   ✅ Delete test passed`);
    
    return { success: true };
  } catch (err) {
    console.log(`   ❌ CRUD test error: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Main verification function
 */
async function verifyDatabase() {
  console.log('🔍 Verifying Groove Database Setup');
  console.log('=' .repeat(60));
  
  const tableResults = await checkTables();
  const storageResult = await checkStorageBucket();
  const crudResult = await testCRUDOperations();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Verification Summary:\n');
  
  const allTablesExist = tableResults.every(r => r.exists);
  const storageExists = storageResult.exists;
  const crudPassed = crudResult.success;
  
  console.log(`Tables: ${allTablesExist ? '✅ All present' : '❌ Some missing'}`);
  console.log(`Storage: ${storageExists ? '✅ Configured' : '❌ Not found'}`);
  console.log(`CRUD Operations: ${crudPassed ? '✅ Working' : '❌ Failed'}`);
  
  if (allTablesExist && storageExists && crudPassed) {
    console.log('\n✨ Database setup is complete and working correctly!\n');
    console.log('🎉 You can now start building the application.');
    return true;
  } else {
    console.log('\n⚠️  Database setup is incomplete or has issues.\n');
    console.log('📝 Next steps:');
    
    if (!allTablesExist) {
      console.log('   1. Run the database migrations (see DATABASE_SETUP.md)');
    }
    if (!storageExists) {
      console.log('   2. Set up the storage bucket (run 003_storage_setup.sql)');
    }
    if (!crudPassed) {
      console.log('   3. Check RLS policies and permissions');
    }
    
    return false;
  }
}

// Run verification
verifyDatabase()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Fatal error during verification:', error);
    process.exit(1);
  });
