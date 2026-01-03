// Profanity and inappropriate words filter
// List of inappropriate words that should be blocked
const INAPPROPRIATE_WORDS = [
    // Profanity (common words)
    'damn', 'hell', 'crap', 'piss', 'ass', 'bitch', 'bastard',
    // Offensive terms
    'idiot', 'stupid', 'dumb', 'retard', 'moron',
    // Hate speech indicators
    'hate', 'kill', 'die',
    // Sexual content
    'sex', 'porn', 'xxx',
    // Violence
    'violence', 'murder', 'weapon',
    // Add more as needed - this is a basic list
];

// Additional patterns to check
const INAPPROPRIATE_PATTERNS = [
    /f+u+c+k+/i,
    /s+h+i+t+/i,
    /a+s+s+h+o+l+e+/i,
    /b+i+t+c+h+/i,
    /n+i+g+g+e+r+/i,
    /f+a+g+/i,
];

/**
 * Check if a username contains inappropriate words
 * @param {string} username - The username to check
 * @returns {object} - { isInappropriate: boolean, reason: string }
 */
function checkInappropriateWords(username) {
    if (!username) {
        return { isInappropriate: false, reason: '' };
    }

    const lowerUsername = username.toLowerCase();
    const words = lowerUsername.split(/[\s\-_\.]+/);

    // Check against word list
    for (const word of INAPPROPRIATE_WORDS) {
        if (lowerUsername.includes(word)) {
            return {
                isInappropriate: true,
                reason: `Username contains inappropriate content. Please choose a different username.`
            };
        }
    }

    // Check against patterns
    for (const pattern of INAPPROPRIATE_PATTERNS) {
        if (pattern.test(username)) {
            return {
                isInappropriate: true,
                reason: `Username contains inappropriate content. Please choose a different username.`
            };
        }
    }

    // Check for repeated characters that might be trying to bypass filters
    if (/(.)\1{4,}/.test(username)) {
        return {
            isInappropriate: true,
            reason: `Username contains too many repeated characters.`
        };
    }

    return { isInappropriate: false, reason: '' };
}

/**
 * Validate username format
 * @param {string} username - The username to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
function validateUsernameFormat(username) {
    if (!username) {
        return { isValid: false, message: 'Username is required' };
    }

    const trimmed = username.trim();

    // Length validation
    if (trimmed.length < 3) {
        return { isValid: false, message: 'Username must be at least 3 characters long' };
    }

    if (trimmed.length > 20) {
        return { isValid: false, message: 'Username must be no more than 20 characters long' };
    }

    // Character validation - allow letters, numbers, underscores, hyphens, and dots
    if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
        return {
            isValid: false,
            message: 'Username can only contain letters, numbers, underscores, hyphens, and dots'
        };
    }

    // Must start with a letter or number
    if (!/^[a-zA-Z0-9]/.test(trimmed)) {
        return { isValid: false, message: 'Username must start with a letter or number' };
    }

    // Cannot be only numbers
    if (/^\d+$/.test(trimmed)) {
        return { isValid: false, message: 'Username cannot be only numbers' };
    }

    // Check for inappropriate words
    const profanityCheck = checkInappropriateWords(trimmed);
    if (profanityCheck.isInappropriate) {
        return { isValid: false, message: profanityCheck.reason };
    }

    return { isValid: true, message: '' };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateUsernameFormat, checkInappropriateWords };
}

