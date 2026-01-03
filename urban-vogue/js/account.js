// Account page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }

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
    loadProfilePicture();

    // Profile picture upload
    const profilePictureInput = document.getElementById('profilePictureInput');
    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Image size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = async function(event) {
                const base64 = event.target.result;
                const user = getCurrentUser();
                
                const result = await updateProfilePicture(user.id, base64);
                if (result.success) {
                    alert('Profile picture updated successfully!');
                    loadProfilePicture();
                } else {
                    alert('Error: ' + result.message);
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // Real-time username validation for profile edit
    const editUsernameInput = document.getElementById('editUsername');
    if (editUsernameInput) {
        const usernameFeedback = document.createElement('small');
        usernameFeedback.className = 'username-feedback';
        editUsernameInput.parentElement.appendChild(usernameFeedback);
        
        editUsernameInput.addEventListener('input', function() {
            const username = this.value.trim();
            if (username.length > 0) {
                const validation = validateUsernameFormat(username);
                if (validation.isValid) {
                    usernameFeedback.textContent = '✓ Username is valid';
                    usernameFeedback.className = 'username-feedback valid';
                    this.style.borderColor = 'var(--success-color)';
                } else {
                    usernameFeedback.textContent = validation.message;
                    usernameFeedback.className = 'username-feedback invalid';
                    this.style.borderColor = 'var(--error-color)';
                }
            } else {
                usernameFeedback.textContent = '';
                usernameFeedback.className = 'username-feedback';
                this.style.borderColor = '';
            }
        });
    }

    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const newUsername = document.getElementById('editUsername').value.trim();
            const email = document.getElementById('editEmail').value.trim();
            const bio = document.getElementById('editBio').value.trim();

            // Username validation
            const usernameValidation = validateUsernameFormat(newUsername);
            if (!usernameValidation.isValid) {
                alert(usernameValidation.message);
                return;
            }

            const updates = {
                username: newUsername,
                email: email,
                bio: bio
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

// Member/Admin functions
function uploadSlideshowImages() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const images = [];
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} is too large (max 5MB)`);
                continue;
            }

            const reader = new FileReader();
            const base64 = await new Promise((resolve) => {
                reader.onload = (event) => resolve(event.target.result);
                reader.readAsDataURL(file);
            });

            images.push({ url: base64, alt: file.name });
        }

        if (images.length === 0) {
            alert('No valid images selected');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/slideshow/images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ images })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Slideshow images updated successfully!');
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error uploading slideshow images:', error);
            alert('Network error');
        }
    };
    input.click();
}

function uploadAnnouncement() {
    const announcement = prompt('Enter announcement text:');
    if (!announcement) return;

    // This would create a post or announcement
    alert('Announcement feature - would create a post/announcement');
}

function manageContests() {
    window.location.href = 'contest.html';
}

function viewReports() {
    alert('Reports feature - would show voting statistics and analytics');
}

async function deleteChatMessages() {
    if (!confirm('Are you sure you want to delete chat messages? This cannot be undone.')) {
        return;
    }

    const messageId = prompt('Enter message ID to delete (or leave empty to delete all):');
    if (messageId === null) return;

    try {
        const token = localStorage.getItem('authToken');
        if (messageId) {
            const response = await fetch(`${API_BASE_URL}/chat/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Message deleted successfully');
            } else {
                alert('Error deleting message');
            }
        } else {
            // Delete all messages (would need a new endpoint)
            alert('Bulk delete feature - would delete all messages');
        }
    } catch (error) {
        console.error('Error deleting messages:', error);
        alert('Network error');
    }
}

// Load profile picture
function loadProfilePicture() {
    const user = getCurrentUser();
    if (!user) return;

    const profileAvatar = document.getElementById('profileAvatarLarge');
    if (profileAvatar && user.profilePicture) {
        profileAvatar.innerHTML = `<img src="${user.profilePicture}" alt="${user.username}">`;
        const uvLogo = document.createElement('div');
        uvLogo.className = 'uv-logo';
        uvLogo.textContent = 'UV';
        profileAvatar.appendChild(uvLogo);
    }
}

// Update profile picture
async function updateProfilePicture(userId, profilePicture) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-picture`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profilePicture })
        });

        const data = await response.json();

        if (response.ok) {
            // Update stored user data
            const currentUser = getCurrentUser();
            const updatedUser = { ...currentUser, profilePicture: data.user.profilePicture };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Update profile picture error:', error);
        return { success: false, message: 'Network error' };
    }
}

