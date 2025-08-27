// MongoDB initialization script
db = db.getSiblingDB('securevault_prod');

// Create collections
db.createCollection('users');
db.createCollection('employees');
db.createCollection('sessions');
db.createCollection('audit_logs');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ department: 1 });

db.employees.createIndex({ employeeId: 1 }, { unique: true });
db.employees.createIndex({ email: 1 }, { unique: true });
db.employees.createIndex({ department: 1 });
db.employees.createIndex({ status: 1 });

db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Set up database user
db.createUser({
    user: 'svapp',
    pwd: 'sv2024prod',
    roles: [
        {
            role: 'readWrite',
            db: 'securevault_prod'
        }
    ]
});

print('Database initialization complete');