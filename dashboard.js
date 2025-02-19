document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const addPasswordBtn = document.getElementById('addPasswordBtn');
    const addPasswordModal = document.getElementById('addPasswordModal');
    const addPasswordForm = document.getElementById('addPasswordForm');
    const cancelAddBtn = document.getElementById('cancelAdd');
    const searchInput = document.getElementById('searchPasswords');
    const generateBtn = document.querySelector('.generate-btn');
    const navLinks = document.querySelectorAll('.nav-links li');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Password Generator Elements
    const passwordLength = document.getElementById('passwordLength');
    const includeUppercase = document.getElementById('includeUppercase');
    const includeLowercase = document.getElementById('includeLowercase');
    const includeNumbers = document.getElementById('includeNumbers');
    const includeSpecial = document.getElementById('includeSpecial');
    const generatedPassword = document.getElementById('generatedPassword');
    const copyGenerated = document.getElementById('copyGenerated');
    const generateNew = document.getElementById('generateNew');

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show corresponding section
            contentSections.forEach(s => {
                s.classList.remove('active');
                if (s.id === `${section}-section`) {
                    s.classList.add('active');
                }
            });
        });
    });
    
    // Modal handling
    addPasswordBtn.addEventListener('click', () => {
        addPasswordModal.classList.add('active');
    });
    
    cancelAddBtn.addEventListener('click', () => {
        addPasswordModal.classList.remove('active');
        addPasswordForm.reset();
    });
    
    // Close modal when clicking outside
    addPasswordModal.addEventListener('click', (e) => {
        if (e.target === addPasswordModal) {
            addPasswordModal.classList.remove('active');
            addPasswordForm.reset();
        }
    });
    
    // Password Generator Function
    function generatePassword() {
        const length = parseInt(passwordLength.value);
        const charSets = {
            upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lower: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        
        // Create character pool based on selected options
        let charPool = '';
        if (includeUppercase.checked) charPool += charSets.upper;
        if (includeLowercase.checked) charPool += charSets.lower;
        if (includeNumbers.checked) charPool += charSets.numbers;
        if (includeSpecial.checked) charPool += charSets.special;
        
        // Ensure at least one option is selected
        if (!charPool) {
            alert('Please select at least one character type');
            return '';
        }
        
        // Generate password using Web Crypto API
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charPool[array[i] % charPool.length];
        }
        
        return password;
    }
    
    // Generate button in modal
    generateBtn.addEventListener('click', () => {
        const password = generatePassword();
        if (password) {
            addPasswordForm.querySelector('[name="password"]').value = password;
        }
    });
    
    // Generate New button in generator section
    generateNew.addEventListener('click', () => {
        const password = generatePassword();
        if (password) {
            generatedPassword.value = password;
        }
    });
    
    // Copy generated password
    copyGenerated.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(generatedPassword.value);
            copyGenerated.textContent = 'Copied!';
            setTimeout(() => {
                copyGenerated.textContent = 'Copy';
            }, 2000);
        } catch (error) {
            alert('Failed to copy to clipboard');
        }
    });
    
    // Add new password
    addPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addPasswordForm);
        
        try {
            const response = await fetch('/add_password', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                location.reload();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to add password');
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    });
    
    // Copy functionality
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const textToCopy = btn.dataset.copy;
            
            try {
                await navigator.clipboard.writeText(textToCopy);
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            } catch (error) {
                alert('Failed to copy to clipboard');
            }
        });
    });
    
    // Delete password
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to delete this password?')) {
                return;
            }
            
            const passwordCard = btn.closest('.password-card');
            const passwordId = passwordCard.dataset.id;
            
            try {
                const response = await fetch(`/delete_password/${passwordId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    passwordCard.remove();
                } else {
                    const data = await response.json();
                    alert(data.message || 'Failed to delete password');
                }
            } catch (error) {
                alert('An error occurred. Please try again.');
            }
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const passwordCards = document.querySelectorAll('.password-card');
        
        if (!searchTerm) {
            // If search is empty, show all cards
            passwordCards.forEach(card => card.style.display = '');
            return;
        }
        
        passwordCards.forEach(card => {
            const website = card.querySelector('.website-info h3').textContent.toLowerCase();
            const username = card.querySelector('.username span').textContent.toLowerCase();
            
            // Check if either website or username contains the search term
            const matches = website.includes(searchTerm) || username.includes(searchTerm);
            card.style.display = matches ? '' : 'none';
        });
    });
    
    // Generate initial password in generator section
    generateNew.click();
});
