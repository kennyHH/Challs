// MongoDB seed data
db = db.getSiblingDB('securevault_prod');

// Helper function to generate TOTP secret (same as backend logic)
function generateDeterministicSecret(email) {
    // This mimics the backend's deterministic generation
    // For demo purposes, using a simple hash
    const hash = email.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    
    // Convert to base32-like string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    let tempHash = Math.abs(hash);
    
    for (let i = 0; i < 32; i++) {
        secret += chars[tempHash % 32];
        tempHash = Math.floor(tempHash / 32) + i * 1337;
    }
    
    return secret;
}

// Seed admin user
const adminEmail = 'admin@securevault.local';
const adminSecret = generateDeterministicSecret(adminEmail);

db.users.insertOne({
    email: adminEmail,
    password: '$2a$10$X6H8M9N5K3L2J1H0G9F8E7D6C5B4A3Z2Y1X0W9V8U7T6S5R4Q3P2O1N0',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    accountType: 'enterprise',
    department: 'it',
    twoFactorEnabled: true,
    totpSecret: adminSecret,
    metadata: {
        created: new Date('2024-01-01'),
        lastLogin: new Date('2024-12-01'),
        loginCount: 42,
        ipAddress: '10.0.0.1',
        userAgent: 'SecureVault-Admin/2.0',
        secretNote: '2fa_byp4ss_'  // Flag piece 2
    },
    active: true,
    deleted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
});

// Seed regular users
const users = [
    {
        email: 'john.doe@securevault.local',
        password: '$2a$10$A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        accountType: 'standard',
        department: 'sales',
        twoFactorEnabled: true,
        totpSecret: generateDeterministicSecret('john.doe@securevault.local'),
        active: true,
        deleted: false
    },
    {
        email: 'jane.smith@securevault.local',
        password: '$2a$10$B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'manager',
        accountType: 'premium',
        department: 'engineering',
        twoFactorEnabled: true,
        totpSecret: generateDeterministicSecret('jane.smith@securevault.local'),
        active: true,
        deleted: false
    }
];

users.forEach(user => {
    db.users.insertOne({
        ...user,
        metadata: {
            created: new Date('2024-02-01'),
            lastLogin: new Date('2024-11-15'),
            loginCount: Math.floor(Math.random() * 100)
        },
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
    });
});

// Seed employees
const employees = [
    {
        employeeId: 'EMP001',
        name: 'Alice Johnson',
        email: 'alice.johnson@securevault.local',
        department: 'engineering',
        position: 'Senior Developer',
        salary: 120000,
        ssn: '123-45-6789',
        joinDate: new Date('2022-03-15'),
        status: 'active',
        manager: 'jane.smith@securevault.local',
        location: 'headquarters',
        clearanceLevel: 3
    },
    {
        employeeId: 'EMP002',
        name: 'Bob Williams',
        email: 'bob.williams@securevault.local',
        department: 'sales',
        position: 'Account Executive',
        salary: 85000,
        ssn: '234-56-7890',
        joinDate: new Date('2023-01-10'),
        status: 'active',
        manager: 'john.doe@securevault.local',
        location: 'branch-west',
        clearanceLevel: 2
    },
    {
        employeeId: 'EMP003',
        name: 'Carol Davis',
        email: 'carol.davis@securevault.local',
        department: 'hr',
        position: 'HR Manager',
        salary: 95000,
        ssn: '345-67-8901',
        joinDate: new Date('2021-06-01'),
        status: 'active',
        manager: 'admin@securevault.local',
        location: 'headquarters',
        clearanceLevel: 4
    },
    {
        employeeId: 'EMP004',
        name: 'David Brown',
        email: 'david.brown@securevault.local',
        department: 'finance',
        position: 'Financial Analyst',
        salary: 78000,
        ssn: '456-78-9012',
        joinDate: new Date('2023-09-20'),
        status: 'active',
        manager: 'admin@securevault.local',
        location: 'headquarters',
        clearanceLevel: 2
    },
    {
        employeeId: 'EMP005',
        name: 'Eva Martinez',
        email: 'eva.martinez@securevault.local',
        department: 'marketing',
        position: 'Marketing Director',
        salary: 110000,
        ssn: '567-89-0123',
        joinDate: new Date('2020-11-30'),
        status: 'active',
        manager: 'admin@securevault.local',
        location: 'branch-east',
        clearanceLevel: 3
    }
];

employees.forEach(emp => {
    db.employees.insertOne({
        ...emp,
        createdAt: new Date(),
        updatedAt: new Date()
    });
});

print('Seed data inserted successfully');
print('Admin user: admin@securevault.local');
print('Admin TOTP secret (for testing): ' + adminSecret);