# SecurePass Manager

A secure and modern password manager built with Flask and modern web technologies. This application allows you to safely store and manage your passwords with encryption.

## Features

- Secure password encryption using Fernet (symmetric encryption)
- User authentication and authorization
- Beautiful and responsive UI
- Password generator
- Search functionality
- Copy passwords to clipboard
- Favicon display for websites

## Installation

1. Clone the repository
2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
python app.py
```

The application will be available at `http://localhost:5000`

## Security Features

- Passwords are encrypted using Fernet symmetric encryption
- User passwords are hashed before storage
- Session management with Flask-Login
- CSRF protection
- Secure password generation

## Usage

1. Register a new account
2. Login with your credentials
3. Add new passwords using the "Add Password" button
4. Use the search bar to find specific passwords
5. Copy usernames and passwords to clipboard with one click
6. Generate secure passwords using the built-in generator

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License
