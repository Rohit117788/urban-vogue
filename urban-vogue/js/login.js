// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const signupModal = document.getElementById('signupModal');
    const signupBtn = document.getElementById('signupBtn');
    const closeSignupModal = document.getElementById('closeSignupModal');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('loginMessage');
    const signupMessage = document.getElementById('signupMessage');

    // Toggle password visibility
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = togglePassword.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }

    // Open signup modal
    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            if (signupModal) {
                signupModal.style.display = 'block';
            }
        });
    }

    // Close signup modal
    if (closeSignupModal) {
        closeSignupModal.addEventListener('click', function() {
            if (signupModal) {
                signupModal.style.display = 'none';
                if (signupMessage) {
                    signupMessage.textContent = '';
                    signupMessage.className = 'message';
                }
            }
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === signupModal) {
            signupModal.style.display = 'none';
            if (signupMessage) {
                signupMessage.textContent = '';
                signupMessage.className = 'message';
            }
        }
    });

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            if (!username || !password) {
                showMessage(loginMessage, 'Please fill in all fields', 'error');
                return;
            }

            // Disable form during submission
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

            const result = await login(username, password);

            if (result.success) {
                showMessage(loginMessage, 'Login successful! Redirecting...', 'success');
                
                // Store remember me preference
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showMessage(loginMessage, result.message, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // Handle signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('signupUsername').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            const role = document.getElementById('userRole').value;

            // Validation
            if (!username || !email || !password || !confirmPassword) {
                showMessage(signupMessage, 'Please fill in all fields', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showMessage(signupMessage, 'Passwords do not match', 'error');
                return;
            }

            if (password.length < 8) {
                showMessage(signupMessage, 'Password must be at least 8 characters', 'error');
                return;
            }

            // Password strength validation
            const hasUpper = /[A-Z]/.test(password);
            const hasLower = /[a-z]/.test(password);
            const hasDigit = /[0-9]/.test(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
                showMessage(signupMessage, 'Password must contain uppercase, lowercase, number, and special character', 'error');
                return;
            }

            // Disable form during submission
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

            const result = await signup({
                username,
                email,
                password,
                role: role === 'admin' ? 'member' // For security, new signups are always members
            });

            if (result.success) {
                showMessage(signupMessage, 'Account created successfully! Redirecting...', 'success');
                
                // Close modal and redirect
                setTimeout(() => {
                    signupModal.style.display = 'none';
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showMessage(signupMessage, result.message, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // Forgot password handler
    const forgotPasswordLink = document.getElementById('forgotPassword');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Password reset feature coming soon! Please contact an administrator.');
        });
    }
});

// Helper function to show messages
function showMessage(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `message ${type}`;
    
    // Clear message after 5 seconds
    setTimeout(() => {
        element.textContent = '';
        element.className = 'message';
    }, 5000);
}

