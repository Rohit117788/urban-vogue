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
        signupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const signupModal = document.getElementById('signupModal');
            if (signupModal) {
                signupModal.style.display = 'block';
                signupModal.classList.add('show');
                // Reset form
                if (signupForm) {
                    signupForm.reset();
                }
                // Clear any messages
                if (signupMessage) {
                    signupMessage.textContent = '';
                    signupMessage.className = 'message';
                }
            } else {
                console.error('Signup modal not found');
            }
        });
    }

    // Close signup modal
    if (closeSignupModal) {
        closeSignupModal.addEventListener('click', function() {
            const signupModal = document.getElementById('signupModal');
            if (signupModal) {
                signupModal.style.display = 'none';
                signupModal.classList.remove('show');
                if (signupMessage) {
                    signupMessage.textContent = '';
                    signupMessage.className = 'message';
                }
            }
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const signupModal = document.getElementById('signupModal');
        if (event.target === signupModal) {
            signupModal.style.display = 'none';
            signupModal.classList.remove('show');
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

    // Real-time username validation
    const signupUsernameInput = document.getElementById('signupUsername');
    const usernameFeedback = document.createElement('small');
    usernameFeedback.className = 'username-feedback';
    if (signupUsernameInput) {
        signupUsernameInput.parentElement.appendChild(usernameFeedback);
        
        signupUsernameInput.addEventListener('input', function() {
            const username = this.value.trim();
            if (username.length > 0) {
                const validation = validateUsernameFormat(username);
                if (validation.isValid) {
                    usernameFeedback.textContent = '✓ Username is available';
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

    // Handle signup form submission - use event delegation to ensure it works
    const signupFormElement = document.getElementById('signupForm');
    if (signupFormElement) {
        signupFormElement.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Signup form submitted'); // Debug log
            
            const username = document.getElementById('signupUsername').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            const role = document.getElementById('userRole').value;

            console.log('Form values:', { username, email, password: '***', confirmPassword: '***', role }); // Debug log

            // Validation
            if (!username || !email || !password || !confirmPassword) {
                showMessage(signupMessage, 'Please fill in all fields', 'error');
                return;
            }

            // Username validation
            if (typeof validateUsernameFormat === 'function') {
                const usernameValidation = validateUsernameFormat(username);
                if (!usernameValidation.isValid) {
                    showMessage(signupMessage, usernameValidation.message, 'error');
                    return;
                }
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
            const submitBtn = signupFormElement.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

            console.log('Calling signup function...'); // Debug log

            try {
                const result = await signup({
                    username,
                    email,
                    password,
                    role: role // Allow member role if selected
                });

                console.log('Signup result:', result); // Debug log

                if (result.success) {
                    showMessage(signupMessage, 'Account created successfully! Redirecting...', 'success');
                    
                    // Close modal and redirect
                    setTimeout(() => {
                        const modal = document.getElementById('signupModal');
                        if (modal) {
                            modal.style.display = 'none';
                            modal.classList.remove('show');
                        }
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    showMessage(signupMessage, result.message || 'Signup failed. Please try again.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            } catch (error) {
                console.error('Signup error:', error);
                showMessage(signupMessage, 'An error occurred. Please try again.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    } else {
        console.error('Signup form not found!');
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

