const fetch = require('node-fetch');

async function testAPILogin() {
    const credentials = [
        { email: 'admin@econnecto.com', password: 'admin123' },
        { email: 'srybroiambusy@gmail.com', password: 'soulmad16092005' }
    ];

    console.log('🔍 Testing Login API Endpoint\n');
    console.log('Make sure your Next.js dev server is running on http://localhost:3000\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const creds of credentials) {
        console.log(`\nTesting: ${creds.email}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creds),
            });

            console.log('Status:', response.status);
            console.log('Status Text:', response.statusText);

            const data = await response.json();

            if (response.ok) {
                console.log('✅ LOGIN SUCCESSFUL!');
                console.log('User:', JSON.stringify(data.user, null, 2));
            } else {
                console.log('❌ LOGIN FAILED');
                console.log('Error:', data.detail || data.message);
            }
        } catch (error) {
            console.log('❌ ERROR:', error.message);
            console.log('\n⚠️  Is your Next.js dev server running?');
            console.log('   Run: npm run dev');
            break;
        }
    }
}

testAPILogin();
