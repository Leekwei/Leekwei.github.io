document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const forms = document.querySelectorAll('.form-panel');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetForm = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show target form
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${targetForm}Form`) {
                    form.classList.add('active');
                }
            });
        });
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                window.location.href = '/dashboard';
            } else {
                const data = await response.json();
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    });

    // Register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        
        // Validate password match
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        try {
            const response = await fetch('/register', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                alert('Registration successful! Please login.');
                // Switch to login tab
                document.querySelector('[data-tab="login"]').click();
            } else {
                const data = await response.json();
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    });
});
