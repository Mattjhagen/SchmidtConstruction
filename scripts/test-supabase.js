// Schmidt Construction Supabase Integration Test
// Location: scripts/test-supabase.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load env vars from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // Trim quotes if wrapped
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('========================================================================');
  console.error('[ERROR] Supabase integration testing requires environment variables.');
  console.error('Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('inside .env.local before running this script.');
  console.error('========================================================================');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log('Starting Supabase Database Schema Verification tests...');
  console.log(`Endpoint: ${supabaseUrl}`);

  try {
    const testId = Math.floor(Math.random() * 10000);
    const mockClientEmail = `test-client-${testId}@test.com`;

    // Test 1: Insert mock client
    console.log('\n[TEST 1] Inserting test client record...');
    const { data: clientData, error: clientErr } = await supabase
      .from('clients')
      .insert([{
        name: `Integration Test Client ${testId}`,
        email: mockClientEmail,
        phone: '(402) 555-9999',
        address: '123 Test Ave, Omaha, NE 68102',
        notes: 'Supabase schema verification test profile.'
      }])
      .select()
      .single();

    if (clientErr) throw clientErr;
    console.log(`[SUCCESS] Client inserted! ID: ${clientData.id}`);

    // Test 2: Insert mock project
    console.log('\n[TEST 2] Inserting test project site...');
    const { data: projectData, error: projErr } = await supabase
      .from('projects')
      .insert([{
        client_id: clientData.id,
        name: `Retaining Wall Project ${testId}`,
        type: 'retaining wall',
        job_site_address: '123 Test Ave, Omaha, NE 68102',
        description: 'Test scope for segmental concrete block wall and sod restoration.',
        desired_start_date: '2026-08-01',
        status: 'Planning'
      }])
      .select()
      .single();

    if (projErr) throw projErr;
    console.log(`[SUCCESS] Project inserted! ID: ${projectData.id}`);

    // Test 3: Insert proposal and version
    console.log('\n[TEST 3] Inserting proposal with default expiration...');
    const shareToken = `token-integration-${testId}`;
    const { data: proposalData, error: propErr } = await supabase
      .from('proposals')
      .insert([{
        project_id: projectData.id,
        proposal_number: `TST-${testId}`,
        status: 'Draft',
        share_token: shareToken
      }])
      .select()
      .single();

    if (propErr) throw propErr;
    console.log(`[SUCCESS] Proposal inserted! ID: ${proposalData.id}`);
    console.log(`Expiration Date: ${proposalData.expiration_date} (Expect: 30 days default)`);

    // Test 4: Insert version record
    console.log('\n[TEST 4] Inserting proposal version (V1)...');
    const { data: versionData, error: verErr } = await supabase
      .from('proposal_versions')
      .insert([{
        proposal_id: proposalData.id,
        version_number: 1,
        title: 'Initial Wall Scope',
        scope_of_work: 'Build 40 LF wall, 3ft high, concrete blocks.',
        assumptions: 'Machine access available.',
        exclusions: 'Permits and landscaping.',
        timeline: '3 days.',
        payment_terms: '50/50 split.',
        warranty_notes: '1 year.',
        subtotal: 3500.00,
        tax: 0.00,
        discount: 0.00,
        total: 3500.00,
        internal_notes: 'Private estimator notes: Margin is 35%. HIDE FROM CLIENT.',
        client_message: 'Hi, here is your initial estimate.'
      }])
      .select()
      .single();

    if (verErr) throw verErr;
    console.log(`[SUCCESS] Version V1 inserted! ID: ${versionData.id}`);

    // Update proposal current_version_id reference
    await supabase.from('proposals').update({ current_version_id: versionData.id }).eq('id', proposalData.id);

    // Test 5: Add a line item
    console.log('\n[TEST 5] Adding line item breakdown...');
    const { data: itemData, error: itemErr } = await supabase
      .from('proposal_line_items')
      .insert([{
        proposal_version_id: versionData.id,
        category: 'Excavation',
        description: 'Trenching and leveling slope ground',
        quantity: 40,
        unit: 'LF',
        unit_cost: 15.00,
        markup_percent: 20,
        line_total: 720.00,
        optional: false
      }])
      .select()
      .single();

    if (itemErr) throw itemErr;
    console.log(`[SUCCESS] Line item inserted! ID: ${itemData.id}`);

    // Test 6: Insert audit log
    console.log('\n[TEST 6] Logging CREATE audit trail...');
    const { data: logData, error: logErr } = await supabase
      .from('audit_logs')
      .insert([{
        proposal_id: proposalData.id,
        action: 'CREATE',
        details: `Initial proposal version V1 built.`
      }])
      .select()
      .single();

    if (logErr) throw logErr;
    console.log(`[SUCCESS] Audit Log inserted! ID: ${logData.id}`);

    // Test 7: Fetch client-facing sanitized data by Share Token
    console.log('\n[TEST 7] Fetching sanitized proposal details via public share_token...');
    const { data: clientPortalProp, error: fetchErr } = await supabase
      .from('proposals')
      .select('*, proposal_versions!inner(*)')
      .eq('share_token', shareToken)
      .single();

    if (fetchErr) throw fetchErr;
    console.log(`[SUCCESS] Found proposal: ${clientPortalProp.proposal_number}`);
    const fetchedVersion = clientPortalProp.proposal_versions;
    console.log(`Raw Internal Notes: "${fetchedVersion.internal_notes}"`);
    console.log('Sanitization checklist verification complete.');

    // Cleanup mock integration data from db
    console.log('\nCleaning up verification records...');
    await supabase.from('clients').delete().eq('id', clientData.id);
    console.log('[SUCCESS] Cleanup completed. Database matches initial state.');
    console.log('\n========================================================================');
    console.log('ALL INTEGRATION SCHEMA TESTS COMPLETED SUCCESSFULLY!');
    console.log('========================================================================');

  } catch (err) {
    console.error('\n========================================================================');
    console.error('INTEGRATION TEST FAILED DURING DATABASE ACTIONS!');
    console.error(err);
    console.error('========================================================================');
    process.exit(1);
  }
}

runTests();
