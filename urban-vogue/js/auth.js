// Authentication Management
const API_BASE_URL = 'http://localhost:3000/api';

// Check if user is logged in (without redirecting)
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        return null;
    }
    
    return JSON.parse(user);
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Set authentication
function setAuth(token, user) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
}

// Clear authentication
function clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
}

// Login function
async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            setAuth(data.token, data.user);
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

// Signup function
async function signup(userData) {
    try {
        console.log('Signup function called with:', { ...userData, password: '***' }); // Debug log
        
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        console.log('Signup response status:', response.status); // Debug log

        const data = await response.json();
        console.log('Signup response data:', { ...data, token: data.token ? '***' : null }); // Debug log

        if (response.ok) {
            setAuth(data.token, data.user);
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message || 'Signup failed' };
        }
    } catch (error) {
        console.error('Signup error:', error);
        return { success: false, message: 'Network error. Please check if the server is running and try again.' };
    }
}

// Logout function
function logout() {
    clearAuth();
    window.location.href = 'login.html';
}

// Update user data
async function updateUser(userId, updates) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (response.ok) {
            // Update stored user data
            const currentUser = getCurrentUser();
            const updatedUser = { ...currentUser, ...data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message || 'Update failed' };
        }
    } catch (error) {
        console.error('Update error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

// Change password
async function changePassword(userId, currentPassword, newPassword) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, currentPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { success: false, message: data.message || 'Password change failed' };
        }
    } catch (error) {
        console.error('Password change error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && (user.role === 'admin' || user.role === 'member');
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', function() {
    // Don't check auth on login page
    if (window.location.pathname.includes('login.html')) {
        // If already logged in, redirect to dashboard
        const user = getCurrentUser();
        if (user) {
            window.location.href = 'index.html';
        }
        return;
    }

    // Check authentication for other pages
    const user = checkAuth();
    updateNavigationUI(user);
    if (user) {
        // Update UI with user info
        updateUserUI(user);
    }
});

// Update navigation based on auth status
function updateNavigationUI(user) {
    const loginRegisterLink = document.getElementById('loginRegisterLink');
    const loginRegisterText = document.getElementById('loginRegisterText');
    const userMenu = document.getElementById('userMenu');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const accountLink = document.getElementById('accountLink');
    
    if (user) {
        // User is logged in
        if (loginRegisterLink) {
            loginRegisterLink.style.display = 'none';
        }
        if (userMenu) {
            userMenu.style.display = 'flex';
        }
        if (userNameDisplay) {
            userNameDisplay.textContent = user.username;
        }
        if (accountLink) {
            accountLink.style.display = 'block';
        }
    } else {
        // User is not logged in
        if (loginRegisterLink) {
            loginRegisterLink.style.display = 'block';
        }
        if (loginRegisterText) {
            loginRegisterText.textContent = 'Login/Register';
        }
        if (userMenu) {
            userMenu.style.display = 'none';
        }
        if (accountLink) {
            accountLink.style.display = 'none';
        }
    }
}

// Update UI with user information
function updateUserUI(user) {
    // Update user name displays
    const userNameElements = document.querySelectorAll('#userName, #profileUsername');
    userNameElements.forEach(el => {
        if (el) el.textContent = user.username;
    });

    // Update user email
    const emailElements = document.querySelectorAll('#profileEmail');
    emailElements.forEach(el => {
        if (el) el.textContent = user.email;
    });

    // Update user role
    const roleElements = document.querySelectorAll('#userRole, .user-role, #profileRole');
    roleElements.forEach(el => {
        if (el) {
            const roleText = user.role === 'admin' ? 'Admin' : user.role === 'member' ? 'Member' : 'User';
            el.textContent = roleText;
            if (el.classList) {
                el.classList.add(user.role === 'admin' ? 'admin-role' : 'member-role');
            }
        }
    });

    // Show admin panel if user is admin or member
    if (isAdmin() || (user.role === 'member')) {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.style.display = 'block';
        }
    }

    // Update profile pictures
    updateProfilePictures(user);
}

// Update profile pictures throughout the site
function updateProfilePictures(user) {
    if (!user.profilePicture) return;

    // Update avatar in navigation
    const navAvatars = document.querySelectorAll('.user-avatar-small, .chat-avatar, .profile-avatar-large');
    navAvatars.forEach(avatar => {
        if (!avatar.querySelector('img')) {
            const img = document.createElement('img');
            img.src = user.profilePicture;
            img.alt = user.username;
            avatar.innerHTML = '';
            avatar.appendChild(img);
        }
    });
}

// Logout button handler
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                clearAuth();
                // Update navigation
                updateNavigationUI(null);
                // Redirect to dashboard
                if (window.location.pathname.includes('account.html')) {
                    window.location.href = 'index.html';
                } else {
                    // Reload page to update UI
                    window.location.reload();
                }
            }
        });
    }
});

