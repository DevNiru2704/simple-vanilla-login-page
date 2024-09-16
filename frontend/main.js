const API_BASE_URL = 'http://localhost:5000/api/v1'; // Backend URL

// Selectors
const registerForm = document.getElementById('register-form');
const authForms = document.getElementById('auth-forms');
const dashboard = document.getElementById('dashboard');
const toggleLogin = document.getElementById('toggle-login');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const logoutBtn = document.querySelector('.logout-btn');

let isLoginForm = false;

// Toggle between login and register form
toggleLogin.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginForm = !isLoginForm;
    if (isLoginForm) {
        registerForm.innerHTML = `
            <div class="input-group">
                <i class="fas fa-user"></i>
                <input type="text" id="login-username" placeholder="Username or Email" required>
            </div>
            <div class="input-group">
                <i class="fas fa-lock"></i>
                <input type="password" id="login-password" placeholder="Password" required>
            </div>
            <button type="submit">Login</button>
        `;
        toggleLogin.textContent = "Don't have an account? Register";
    } else {
        registerForm.innerHTML = `
            <div class="input-group">
                <i class="fas fa-user"></i>
                <input type="text" id="register-firstname" placeholder="First Name" required>
            </div>
            <div class="input-group">
                <i class="fas fa-user"></i>
                <input type="text" id="register-lastname" placeholder="Last Name" required>
            </div>
            <div class="input-group">
                <i class="fas fa-user"></i>
                <input type="text" id="register-username" placeholder="Username" required>
            </div>
            <div class="input-group">
                <i class="fas fa-envelope"></i>
                <input type="email" id="register-email" placeholder="Email" required>
            </div>
            <div class="input-group">
                <i class="fas fa-lock"></i>
                <input type="password" id="register-password" placeholder="Password" required>
            </div>
            <button type="submit">Register</button>
        `;
        toggleLogin.textContent = "Already have an account? Login";
    }
});

// Helper function to make API requests
async function makeRequest(url, method, data = null) {
    try {
        console.log(data)
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            
            body: JSON.stringify(data),
            credentials: 'include', // To handle cookies for authentication
        });
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Form submission for login or registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        if (isLoginForm) {
            const loginIdentifier = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const response = await makeRequest(`${API_BASE_URL}/users/login`, 'POST', { loginIdentifier, password });
            
            if (response.success) {
                userName.textContent = response.data.firstName + ' ' + response.data.lastName;
                userEmail.textContent = response.data.email;
                authForms.style.display = 'none';
                dashboard.style.display = 'block';
            } else {
                console.error(response.message || 'Login failed');
            }
        } else {
            const firstName = document.getElementById('register-firstname').value;
            const lastName = document.getElementById('register-lastname').value;
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const response = await makeRequest(`${API_BASE_URL}/users/register`, 'POST', { firstName, lastName, username, email, password });
            
            if (response.success) {
                console.log('Registration successful! Please log in.');
                toggleLogin.click(); // Switch to login form after registration
            } else {
                console.error(response.message || 'Registration failed');
            }
        }
    } catch (error) {
        console.error('An error occurred. Please try again.');
    }
});

// Logout functionality
logoutBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/logout`, {
            method: 'POST',
            credentials: 'include'  // Include credentials to handle cookies
        });
        const data = await response.json();

        if (data.success) {
            authForms.style.display = 'block';
            dashboard.style.display = 'none';
            registerForm.reset();
        } else {
            console.error(data.message || 'Logout failed');
        }
    } catch (error) {
        console.error('An error occurred during logout. Please try again.');
    }
});
