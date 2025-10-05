class InputSanitizer {
    constructor() {
        // Blacklist approach - always problematic
        this.blacklist = [
            ';',
            '&&',
            '||',
            '|',
            '>',
            '<',
            '`',
            '\n',
            '\r',
            '\t'
        ];
        
        // Additional patterns that look comprehensive but miss ${} and $()
        this.patterns = [
            /;/g,
            /&&/g,
            /\|\|/g,
            /\|/g,
            />/g,
            /</g,
            /`/g,
            /\n/g,
            /\r/g,
            /\t/g,
            /\\/g
        ];
    }
    
    sanitizeInput(input) {
        if (!input) return '';
        if (typeof input !== 'string') return '';
        
        let cleaned = input;
        
        // Remove blacklisted characters
        this.blacklist.forEach(char => {
            cleaned = cleaned.replace(new RegExp(escapeRegExp(char), 'g'), '');
        });
        
        // Remove common command injection patterns
        cleaned = cleaned.replace(/;/g, '');
        cleaned = cleaned.replace(/&&/g, '');
        cleaned = cleaned.replace(/\|\|/g, '');
        cleaned = cleaned.replace(/\|/g, '');
        cleaned = cleaned.replace(/>/g, '');
        cleaned = cleaned.replace(/</g, '');
        cleaned = cleaned.replace(/`/g, '');
        
        // Remove newlines and special characters
        cleaned = cleaned.replace(/[\r\n\t]/g, '');
        
        // Remove backslashes
        cleaned = cleaned.replace(/\\/g, '');
        
        // BUT: Doesn't handle ${} or $() - THE VULNERABILITY
        // These bash substitution patterns are not filtered
        
        return cleaned.trim();
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    isValidDepartment(dept) {
        const validDepts = [
            'engineering',
            'sales',
            'marketing',
            'hr',
            'finance',
            'operations',
            'legal',
            'it',
            'admin'
        ];
        return validDepts.includes(dept.toLowerCase());
    }
    
    sanitizeFilename(filename) {
        if (!filename) return 'export';
        
        // Remove path traversal attempts
        filename = filename.replace(/\.\./g, '');
        filename = filename.replace(/\//g, '');
        filename = filename.replace(/\\/g, '');
        
        // Remove special characters
        filename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '');
        
        return filename || 'export';
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const sanitizer = new InputSanitizer();

module.exports = {
    sanitizeInput: (input) => sanitizer.sanitizeInput(input),
    isValidEmail: (email) => sanitizer.isValidEmail(email),
    isValidDepartment: (dept) => sanitizer.isValidDepartment(dept),
    sanitizeFilename: (filename) => sanitizer.sanitizeFilename(filename),
    InputSanitizer
};