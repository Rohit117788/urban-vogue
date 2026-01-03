// Setup script to create the first admin user
// Run with: node setup-admin.js

const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setupAdmin() {
    try {
        console.log('=== Urban Vogue Admin Setup ===\n');

        // Ensure data directory exists
        await fs.mkdir(DATA_DIR, { recursive: true });

        // Check if users file exists
        let users = [];
        try {
            const data = await fs.readFile(USERS_FILE, 'utf8');
            users = JSON.parse(data);
        } catch {
            // File doesn't exist, will create new one
        }

        // Check if admin already exists
        const adminExists = users.some(u => u.role === 'admin');
        if (adminExists) {
            console.log('An admin user already exists. Use the signup page to create regular users.');
            rl.close();
            return;
        }

        // Get admin details
        const username = await question('Enter admin username: ');
        const email = await question('Enter admin email: ');
        const password = await question('Enter admin password: ');

        // Validate password
        if (password.length < 8) {
            console.error('Password must be at least 8 characters');
            rl.close();
            return;
        }

        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasDigit = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
            console.error('Password must contain uppercase, lowercase, number, and special character');
            rl.close();
            return;
        }

        // Check if username or email already exists
        if (users.some(u => u.username === username)) {
            console.error('Username already exists');
            rl.close();
            return;
        }

        if (users.some(u => u.email === email)) {
            console.error('Email already exists');
            rl.close();
            return;
        }

        // Create admin user
        const passwordHash = await bcrypt.hash(password, 10);
        const adminUser = {
            id: Date.now().toString(),
            username,
            email,
            passwordHash,
            role: 'admin',
            bio: '',
            preferences: {
                emailNotifications: true,
                contestReminders: true,
                socialUpdates: false
            },
            createdAt: new Date().toISOString()
        };

        users.push(adminUser);
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));

        console.log('\n✓ Admin user created successfully!');
        console.log(`  Username: ${username}`);
        console.log(`  Email: ${email}`);
        console.log('\nYou can now login at http://localhost:3000/login.html');
        rl.close();
    } catch (error) {
        console.error('Error setting up admin:', error);
        rl.close();
    }
}

setupAdmin();

