from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///passwords.db'
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Generate encryption key
if not os.path.exists('key.key'):
    key = Fernet.generate_key()
    with open('key.key', 'wb') as key_file:
        key_file.write(key)

with open('key.key', 'rb') as key_file:
    key = key_file.read()
    cipher_suite = Fernet(key)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    passwords = db.relationship('Password', backref='user', lazy=True)

class Password(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    website = db.Column(db.String(120), nullable=False)
    username = db.Column(db.String(80), nullable=False)
    encrypted_password = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def decrypt_password(self):
        return cipher_suite.decrypt(self.encrypted_password.encode()).decode()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            return jsonify({'status': 'success'})
        
        return jsonify({'status': 'error', 'message': 'Invalid username or password'}), 401
    
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    username = request.form.get('username')
    password = request.form.get('password')
    
    if User.query.filter_by(username=username).first():
        return jsonify({'status': 'error', 'message': 'Username already exists'}), 400
    
    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'status': 'success'})

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    passwords = Password.query.filter_by(user_id=current_user.id).all()
    return render_template('dashboard.html', passwords=passwords)

@app.route('/add_password', methods=['POST'])
@login_required
def add_password():
    website = request.form.get('website')
    username = request.form.get('username')
    password = request.form.get('password')
    
    encrypted_password = cipher_suite.encrypt(password.encode()).decode()
    
    new_password = Password(
        website=website,
        username=username,
        encrypted_password=encrypted_password,
        user_id=current_user.id
    )
    
    db.session.add(new_password)
    db.session.commit()
    
    return jsonify({'status': 'success'})

@app.route('/delete_password/<int:id>', methods=['DELETE'])
@login_required
def delete_password(id):
    password = Password.query.get_or_404(id)
    if password.user_id != current_user.id:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403
    
    db.session.delete(password)
    db.session.commit()
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
