// Account page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const tabContent = document.getElementById(tabName + 'Tab');
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });

    // Load user data
    loadUserData();
    loadUserStats();

    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const updates = {
                username: document.getElementById('editUsername').value.trim(),
                email: document.getElementById('editEmail').value.trim(),
                bio: document.getElementById('editBio').value.trim()
            };

            const user = getCurrentUser();
            const result = await updateUser(user.id, updates);

            if (result.success) {
                alert('Profile updated successfully!');
                loadUserData();
            } else {
                alert('Error: ' + result.message);
            }
        });
    }

    // Security form
    const securityForm = document.getElementById('securityForm');
    if (securityForm) {
        securityForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            if (newPassword !== confirmNewPassword) {
                alert('New passwords do not match');
                return;
            }

            if (newPassword.length < 8) {
                alert('Password must be at least 8 characters');
                return;
            }

            // Password strength validation
            const hasUpper = /[A-Z]/.test(newPassword);
            const hasLower = /[a-z]/.test(newPassword);
            const hasDigit = /[0-9]/.test(newPassword);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

            if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
                alert('Password must contain uppercase, lowercase, number, and special character');
                return;
            }

            const user = getCurrentUser();
            const result = await changePassword(user.id, currentPassword, newPassword);

            if (result.success) {
                alert('Password changed successfully!');
                securityForm.reset();
            } else {
                alert('Error: ' + result.message);
            }
        });
    }

    // Preferences form
    const preferencesForm = document.getElementById('preferencesForm');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const preferences = {
                emailNotifications: document.getElementById('emailNotifications').checked,
                contestReminders: document.getElementById('contestReminders').checked,
                socialUpdates: document.getElementById('socialUpdates').checked
            };

            const user = getCurrentUser();
            const result = await updateUser(user.id, { preferences });

            if (result.success) {
                alert('Preferences saved successfully!');
            } else {
                alert('Error: ' + result.message);
            }
        });
    }
});

// Load user data
function loadUserData() {
    const user = getCurrentUser();
    if (!user) return;

    // Populate profile form
    const editUsername = document.getElementById('editUsername');
    const editEmail = document.getElementById('editEmail');
    const editBio = document.getElementById('editBio');

    if (editUsername) editUsername.value = user.username || '';
    if (editEmail) editEmail.value = user.email || '';
    if (editBio) editBio.value = user.bio || '';

    // Populate preferences
    if (user.preferences) {
        const emailNotifications = document.getElementById('emailNotifications');
        const contestReminders = document.getElementById('contestReminders');
        const socialUpdates = document.getElementById('socialUpdates');

        if (emailNotifications) emailNotifications.checked = user.preferences.emailNotifications !== false;
        if (contestReminders) contestReminders.checked = user.preferences.contestReminders !== false;
        if (socialUpdates) socialUpdates.checked = user.preferences.socialUpdates === true;
    }
}

// Load user statistics
async function loadUserStats() {
    const user = getCurrentUser();
    if (!user) return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/users/${user.id}/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const stats = await response.json();
            
            const profileContests = document.getElementById('profileContests');
            const profilePosts = document.getElementById('profilePosts');
            const profileLikes = document.getElementById('profileLikes');
            
            if (profileContests) profileContests.textContent = stats.contests || 0;
            if (profilePosts) profilePosts.textContent = stats.posts || 0;
            if (profileLikes) profileLikes.textContent = stats.likes || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Admin functions
function manageUsers() {
    alert('User management feature coming soon!');
}

function manageContests() {
    window.location.href = 'contest.html';
}

function viewReports() {
    alert('Reports feature coming soon!');
}

