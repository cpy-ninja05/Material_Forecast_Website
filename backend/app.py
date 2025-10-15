from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd
import numpy as np
import joblib
import os
import secrets
from datetime import datetime, timedelta, timezone
import re
from pymongo import MongoClient, errors
from bson import ObjectId
import certifi
from dotenv import load_dotenv
import threading
import time
from collections import defaultdict

load_dotenv()  # load environment variables from .env if present
app = Flask(__name__)
# Config from environment
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'plangrid-secret-key-2025')
_jwt_expires_hours = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES_HOURS', '24'))
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=_jwt_expires_hours)

# Flask-Mail configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', '587'))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', '')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', '')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', '')
app.config['MAIL_MAX_EMAILS'] = int(os.getenv('MAIL_MAX_EMAILS', '100'))

jwt = JWTManager(app)
mail = Mail(app)
# Configure CORS for production deployment - more permissive for debugging
CORS(app, 
     origins=[
         "http://localhost:3000",  # Local development (React default)
         "http://localhost:5173",  # Local development (Vite default)
         "https://material-forecast-website.onrender.com",  # Production frontend
         "https://material-forecast-website-be.onrender.com"  # Production backend (if needed)
     ],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# Manual CORS handler as fallback
@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:5173",  # Added Vite default port
        "https://material-forecast-website.onrender.com",
        "https://material-forecast-website-be.onrender.com"
    ]
    
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    
    return response

# Initialize MongoDB
def init_db():
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/PLANGRID_DATA')
    db_name = os.getenv('MONGO_DB', 'material_forecast')

    # MongoDB connection with multiple fallback options
    try:
        # Try with TLS and CA bundle first
        ca = certifi.where()
        client = MongoClient(mongo_uri, tls=True, tlsCAFile=ca, tlsAllowInvalidCertificates=True)
        # Test connection
        client.admin.command('ping')
    except Exception as e1:
        try:
            # Fallback: TLS without CA verification
            client = MongoClient(mongo_uri, tls=True, tlsAllowInvalidCertificates=True)
            client.admin.command('ping')
        except Exception as e2:
            try:
                # Last resort: no TLS (for local development)
                client = MongoClient(mongo_uri)
                client.admin.command('ping')
            except Exception as e3:
                print(f"MongoDB connection failed. Errors: {e1}, {e2}, {e3}")
                raise e3
    db = client[db_name]

    users_collection = db['users']
    projects_collection = db['projects']
    forecasts_collection = db['forecasts']
    project_forecasts_collection = db['project_forecasts']  # new consolidated schema
    password_reset_tokens_collection = db['password_reset_tokens']
    inventory_collection = db['inventory']
    orders_collection = db['orders']
    material_actuals_collection = db['material_actuals']
    teams_collection = db['teams']
    team_invitations_collection = db['team_invitations']
    notifications_collection = db['notifications']
    # password reset collection removed

    # Ensure unique indexes for username and email
    try:
        users_collection.create_index('username', unique=True)
        users_collection.create_index('email', unique=True)
        users_collection.create_index('phone')
        # Only create project_id index if collection is empty or doesn't have null values
        if projects_collection.count_documents({'project_id': None}) == 0:
            projects_collection.create_index('project_id', unique=True)
        forecasts_collection.create_index([('project_id', 1), ('material', 1), ('created_at', 1)])
        project_forecasts_collection.create_index('project_id', unique=True)
        project_forecasts_collection.create_index('forecasts.forecast_month')
        inventory_collection.create_index([('material_code', 1), ('warehouse', 1)], unique=True)
        orders_collection.create_index('order_id', unique=True)
        material_actuals_collection.create_index([('project_id', 1), ('month', 1)], unique=True)
        password_reset_tokens_collection.create_index('token', unique=True)
        password_reset_tokens_collection.create_index('created_at', expireAfterSeconds=3600)  # Auto-expire after 1 hour
        
        # Team collaboration indexes
        teams_collection.create_index('team_id', unique=True)
        teams_collection.create_index('members.username')
        teams_collection.create_index('created_by')
        team_invitations_collection.create_index('invitation_token', unique=True)
        team_invitations_collection.create_index('email')
        team_invitations_collection.create_index('created_at', expireAfterSeconds=604800)  # Auto-expire after 7 days
        notifications_collection.create_index('user_id')
        notifications_collection.create_index('created_at')
        pass
    except errors.PyMongoError as e:
        print(f"Error creating indexes: {e}")

    return client, db, users_collection, projects_collection, forecasts_collection, inventory_collection, orders_collection, material_actuals_collection, project_forecasts_collection, password_reset_tokens_collection, teams_collection, team_invitations_collection, notifications_collection

# Load models and encoders
def load_models():
    try:
        model = joblib.load('../multi_xgb_model.joblib')
        feature_cols = joblib.load('../feature_cols1.joblib')
        target_cols = joblib.load('../target_cols1.joblib')
        label_encoders = joblib.load('../label_encoders.joblib')
        return model, feature_cols, target_cols, label_encoders
    except Exception as e:
        print(f"Error loading models: {e}")
        return None, None, None, None

# Load data
def load_data():
    try:
        df = pd.read_csv('../powergrid_realistic_material_dataset1.csv')
        return df
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

# Initialize
client, db, users_collection, projects_collection, forecasts_collection, inventory_collection, orders_collection, material_actuals_collection, project_forecasts_collection, password_reset_tokens_collection, teams_collection, team_invitations_collection, notifications_collection = init_db()
model, feature_cols, target_cols, label_encoders = load_models()
df = load_data()

# Helpers
def sum_numeric_values(obj):
    try:
        return sum(float(v) for v in obj.values() if isinstance(v, (int, float)) or (isinstance(v, str) and v.strip() != ''))
    except Exception:
        total = 0.0
        for v in obj.values():
            try:
                total += float(v)
            except Exception:
                continue
        return total


# Authentication routes
@app.route('/api/me', methods=['GET'])
@jwt_required()
def me():
    username = get_jwt_identity()
    try:
        user = users_collection.find_one({'username': username}, {'_id': 0, 'username': 1, 'email': 1, 'role': 1})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(user)
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user exists
    existing = users_collection.find_one({'$or': [{'username': username}, {'email': email}]})
    if existing:
        return jsonify({'error': 'User already exists'}), 400

    # Create user
    password_hash = generate_password_hash(password)
    try:
        users_collection.insert_one({
            'username': username,
            'email': email,
            'password_hash': password_hash,
            'role': 'user',
            'created_at': datetime.now(timezone.utc)
        })
    except errors.DuplicateKeyError:
        return jsonify({'error': 'User already exists'}), 400
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400
    
    user = users_collection.find_one({'username': username})
    
    if user and check_password_hash(user.get('password_hash', ''), password):
        access_token = create_access_token(identity=username)
        return jsonify({'access_token': access_token, 'user': {'username': username, 'role': user.get('role', 'user')}})
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    """Send password reset email using Flask-Mail"""
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    try:
        # Find user by email (case-insensitive)
        user = users_collection.find_one({'email': {'$regex': f'^{re.escape(email)}$', '$options': 'i'}})
        if not user:
            return jsonify({'error': 'Email not found'}), 404
        
        # Generate secure reset token
        reset_token = secrets.token_urlsafe(32)
        
        # Store reset token in database with expiry
        password_reset_tokens_collection.insert_one({
            'token': reset_token,
            'email': email,
            'username': user['username'],
            'created_at': datetime.now(timezone.utc),
            'used': False
        })
        
        # Send email using Flask-Mail
        frontend_url = os.getenv('FRONTEND_BASE_URL', 'http://localhost:5173')
        # Ensure URL doesn't end with slash and construct reset URL
        frontend_url = frontend_url.rstrip('/')
        reset_url = f"{frontend_url}/reset-password?token={reset_token}"
        
        msg = Message(
            subject='Password Reset Request - PlanGrid',
            recipients=[email],
            sender=app.config['MAIL_DEFAULT_SENDER']
        )
        
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - PlanGrid</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }}
                .content {{
                    background: #f8fafc;
                    padding: 30px;
                    border-radius: 0 0 8px 8px;
                }}
                .button {{
                    display: inline-block;
                    background: #2563eb;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin: 20px 0;
                    font-weight: bold;
                    border: 2px solid #2563eb;
                    transition: all 0.3s ease;
                }}
                .button:hover {{
                    background: #1d4ed8;
                    border-color: #1d4ed8;
                }}
                .warning {{
                    background: #fef3c7;
                    border: 1px solid #f59e0b;
                    color: #92400e;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔐 Password Reset Request</h1>
                <p>PlanGrid Material Forecast Portal</p>
            </div>
            
            <div class="content">
                <h2>Hello {user['username']}!</h2>
                
                <p>You have requested to reset your password for your PlanGrid account.</p>
                
                <p>To reset your password, please click the button below:</p>
                
                <div style="text-align: center;">
                    <a href="{reset_url}" class="button">Reset My Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 4px; font-family: monospace;">
                    {reset_url}
                </p>
                
                <div class="warning">
                    <strong>⚠️ Important Security Information:</strong>
                    <ul>
                        <li>This link will expire in <strong>1 hour</strong></li>
                        <li>The link can only be used <strong>once</strong></li>
                        <li>If you didn't request this reset, please ignore this email</li>
                    </ul>
                </div>
            </div>
        </body>
        </html>
        """
        
        msg.body = f"""
        Hello {user['username']},
        
        You have requested to reset your password for your PlanGrid account.
        
        To reset your password, please click on the following link:
        {reset_url}
        
        This link will expire in 1 hour for security reasons.
        
        If you did not request this password reset, please ignore this email.
        
        Best regards,
        PlanGrid Team
        """
        
        mail.send(msg)
        return jsonify({'message': 'Password reset email sent successfully'}), 200
        
    except Exception as e:
        print(f"Error sending password reset email: {e}")
        return jsonify({'error': 'Failed to send reset email. Please try again later.'}), 500

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    """Reset password using token"""
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    
    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400
    
    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400
    
    try:
        # Find valid reset token
        reset_record = password_reset_tokens_collection.find_one({
            'token': token,
            'used': False,
            'created_at': {'$gte': datetime.now(timezone.utc) - timedelta(hours=1)}
        })
        
        if not reset_record:
            return jsonify({'error': 'Invalid or expired reset token'}), 400
        
        # Update user password
        password_hash = generate_password_hash(new_password)
        users_collection.update_one(
            {'email': reset_record['email']},
            {'$set': {'password_hash': password_hash}}
        )
        
        # Mark token as used
        password_reset_tokens_collection.update_one(
            {'token': token},
            {'$set': {'used': True}}
        )
        
        return jsonify({'message': 'Password reset successfully'}), 200
        
    except Exception as e:
        print(f"Error resetting password: {e}")
        return jsonify({'error': 'Failed to reset password. Please try again.'}), 500

@app.route('/api/verify-reset-token', methods=['POST'])
def verify_reset_token():
    """Verify if reset token is valid"""
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'error': 'Token is required'}), 400
    
    try:
        # Check if token exists and is valid
        reset_record = password_reset_tokens_collection.find_one({
            'token': token,
            'used': False,
            'created_at': {'$gte': datetime.now(timezone.utc) - timedelta(hours=1)}
        })
        
        if reset_record:
            return jsonify({'valid': True, 'email': reset_record['email']}), 200
        else:
            return jsonify({'valid': False, 'error': 'Invalid or expired token'}), 400
            
    except Exception as e:
        print(f"Error verifying token: {e}")
        return jsonify({'error': 'Failed to verify token'}), 500

# Analytics routes
@app.route('/api/analytics/overview', methods=['GET'])
@jwt_required()
def analytics_overview():
    username = get_jwt_identity()
    
    try:
        # Get user's teams
        user_teams = list(teams_collection.find({
            'members.username': username
        }, {'team_id': 1, '_id': 0}))
        
        team_ids = [team['team_id'] for team in user_teams]
        
        # Get projects accessible to user (own projects + team projects)
        accessible_projects_query = {
            '$or': [
                {'created_by': username},
                {'team_id': {'$in': team_ids}}
            ]
        }
        
        # Get user's own project data + team project data
        user_projects = list(projects_collection.find(accessible_projects_query, {'_id': 0}))
        
        if not user_projects:
            return jsonify({
                'total_projects': 0,
                'total_budget': 0,
                'avg_budget': 0,
                'material_totals': {},
                'location_distribution': {},
                'risk_distribution': {}
            })
        
        # Calculate statistics from user's projects + team projects
        total_projects = len(user_projects)
        total_budget = sum(float(p.get('cost', 0)) for p in user_projects if p.get('cost'))
        avg_budget = total_budget / total_projects if total_projects > 0 else 0
        
        # Location distribution
        location_dist = {}
        for project in user_projects:
            location = project.get('location', 'Unknown')
            location_dist[location] = location_dist.get(location, 0) + 1
        
        # Risk distribution (using project status as risk indicator)
        risk_dist = {}
        for project in user_projects:
            status = project.get('status', 'Unknown')
            risk_dist[status] = risk_dist.get(status, 0) + 1
        
        # Material totals (placeholder - would need actual material data)
        material_totals = {}
        if target_cols:
            for col in target_cols:
                material_totals[col] = 0.0  # Would need actual material consumption data
        
        return jsonify({
            'total_projects': total_projects,
            'total_budget': total_budget,
            'avg_budget': avg_budget,
            'material_totals': material_totals,
            'location_distribution': location_dist,
            'risk_distribution': risk_dist
        })
    except Exception as e:
        return jsonify({'error': f'Failed to get analytics overview: {str(e)}'}), 500

@app.route('/api/analytics/materials', methods=['GET'])
@jwt_required()
def materials_analytics():
    if df is None:
        return jsonify({'error': 'Data not available'}), 500
    
    # Material consumption trends
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    monthly_materials = df.groupby(df['timestamp'].dt.to_period('M'))[target_cols].sum()
    
    # Convert to JSON serializable format
    trends = {}
    for col in target_cols:
        trends[col] = {
            'dates': [str(period) for period in monthly_materials.index],
            'values': [float(v) for v in monthly_materials[col].tolist()]
        }
    
    return jsonify(trends)

@app.route('/api/analytics/projects', methods=['GET'])
@jwt_required()
def projects_analytics():
    if df is None:
        return jsonify({'error': 'Data not available'}), 500
    
    # Project details
    project_details = df.groupby('project_id').agg({
        'budget': 'first',
        'project_location': 'first',
        'tower_type': 'first',
        'substation_type': 'first',
        'project_size_km': 'first',
        'region_risk_flag': 'first'
    }).reset_index()
    
    # Add material totals per project
    material_totals = df.groupby('project_id')[target_cols].sum().reset_index()
    project_details = project_details.merge(material_totals, on='project_id')
    
    return jsonify(project_details.to_dict('records'))

# Simple dispatch data endpoint
@app.route('/api/dispatch', methods=['GET'])
@jwt_required()
def dispatch_data():
    try:
        # Generate simple synthetic dispatch data for the last 24 hours, 1-hour interval
        now = datetime.now(timezone.utc)
        points = []
        for i in range(24, -1, -1):
            ts = now - timedelta(hours=i)
            # Basic waveform-like variation
            demand = 800 + (i % 12) * 10
            supply = demand - 10 + (i % 5)
            frequency = 49.5 + ((i % 6) * 0.1)
            points.append({
                'timestamp': ts.isoformat() + 'Z',
                'demand_mw': float(demand),
                'supply_mw': float(supply),
                'frequency_hz': float(round(frequency, 2))
            })
        return jsonify(points)
    except Exception as e:
        return jsonify({'error': f'Failed to build dispatch data: {str(e)}'}), 500

"""
Legacy forecasting route (still computes predictions). After computing, store
month-wise under project_forecasts with upsert on (project_id, forecast_month).
"""
@app.route('/api/forecast', methods=['POST'])
@jwt_required()
def forecast():
    if model is None or feature_cols is None or target_cols is None or label_encoders is None:
        return jsonify({'error': 'Model not available'}), 500
    
    data = request.get_json()
    username = get_jwt_identity()
    
    # Get current month and year
    current_date = datetime.now(timezone.utc)
    forecast_month = data.get('forecast_month', current_date.strftime('%Y-%m'))
    project_id = data.get('project_id', 'unknown')
    
    # Prepare input data
    input_data = {}
    for col in feature_cols:
        if col in data:
            input_data[col] = data[col]
        else:
            # Use default values for missing fields
            if col == 'budget':
                input_data[col] = 30000000.0
            elif col == 'tax_rate':
                input_data[col] = 18.0
            elif col == 'project_size_km':
                input_data[col] = 100.0
            elif col == 'project_start_month':
                input_data[col] = 1.0
            elif col == 'project_end_month':
                input_data[col] = 12.0
            elif col == 'lead_time_days':
                input_data[col] = 45.0
            elif col == 'commodity_price_index':
                input_data[col] = 105.0
            else:
                input_data[col] = 0.0
    
    # Convert numeric fields to proper types
    numeric_fields = ['budget', 'tax_rate', 'project_size_km', 'project_start_month', 
                     'project_end_month', 'lead_time_days', 'commodity_price_index']
    
    for field in numeric_fields:
        if field in input_data:
            try:
                input_data[field] = float(input_data[field])
            except (ValueError, TypeError):
                # Use default values if conversion fails
                if field == 'budget':
                    input_data[field] = 30000000.0
                elif field == 'tax_rate':
                    input_data[field] = 18.0
                elif field == 'project_size_km':
                    input_data[field] = 100.0
                elif field == 'project_start_month':
                    input_data[field] = 1.0
                elif field == 'project_end_month':
                    input_data[field] = 12.0
                elif field == 'lead_time_days':
                    input_data[field] = 45.0
                elif field == 'commodity_price_index':
                    input_data[field] = 105.0
                else:
                    input_data[field] = 0.0
    
    # Encode categorical variables
    for col in ['project_location', 'tower_type', 'substation_type', 'region_risk_flag']:
        if col in input_data and col in label_encoders:
            try:
                input_data[col] = label_encoders[col].transform([input_data[col]])[0]
            except:
                input_data[col] = 0
    
    # Create DataFrame
    input_df = pd.DataFrame([input_data])
    
    # Debug: Print input data and data types
    print("Input data for forecast:")
    print(input_data)
    print("Input data types:")
    for col in input_df.columns:
        print(f"{col}: {input_df[col].dtype}")
    
    # Make prediction
    try:
        predictions = model.predict(input_df[feature_cols])
        
        # Format results
        results = {}
        for i, col in enumerate(target_cols):
            results[col] = float(predictions[0][i])
        
        # Save forecast month-wise under a single project document
        try:
            # Ensure project doc exists
            project_forecasts_collection.update_one(
                {'project_id': project_id},
                {'$setOnInsert': {'project_id': project_id, 'forecasts': []}},
                upsert=True
            )

            # Try to update existing month entry
            res = project_forecasts_collection.update_one(
                {'project_id': project_id, 'forecasts.forecast_month': forecast_month},
                {
                    '$set': {
                        'forecasts.$.predictions': results,
                        'forecasts.$.actual_values': {},
                        'forecasts.$.updated_at': datetime.now(timezone.utc)
                    }
                }
            )

            if res.matched_count == 0:
                # Push new month entry
                project_forecasts_collection.update_one(
                    {'project_id': project_id},
                    {
                        '$push': {
                            'forecasts': {
                                'forecast_month': forecast_month,
                                'predictions': results,
                                'actual_values': {},
                                'created_at': datetime.now(timezone.utc),
                                'updated_at': datetime.now(timezone.utc)
                            }
                        }
                    }
                )
            print(f"Upserted forecast for project {project_id}, month {forecast_month}")
            
        except Exception as e:
            print(f"Failed to save forecast: {e}")
            return jsonify({'error': f'Failed to save forecast: {str(e)}'}), 500
        
        return jsonify({
            'predictions': results,
            'input_used': input_data
        })
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

# Projects API
@app.route('/api/projects', methods=['GET'])
@jwt_required()
def get_projects():
    try:
        username = get_jwt_identity()
        
        # Get user's teams
        user_teams = list(teams_collection.find({
            'members.username': username
        }, {'team_id': 1, '_id': 0}))
        
        team_ids = [team['team_id'] for team in user_teams]
        
        # Get projects created by user OR projects assigned to user's teams
        query = {
            '$or': [
                {'created_by': username},  # User's own projects
                {'team_id': {'$in': team_ids}}  # Projects from user's teams
            ]
        }
        
        projects = list(projects_collection.find(query, {'_id': 0}).sort('created_at', -1))
        
        # Convert ObjectId to string for any remaining _id fields
        for project in projects:
            if '_id' in project:
                project['_id'] = str(project['_id'])
        return jsonify(projects)
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/projects', methods=['POST'])
@jwt_required()
def create_project():
    data = request.get_json()
    username = get_jwt_identity()
    
    try:
        project_data = {
            'project_id': data.get('project_id', f'PROJ_{datetime.now().strftime("%Y%m%d%H%M%S")}'),
            'name': data.get('name'),
            'location': data.get('location'),
            'state': data.get('state'),
            'city': data.get('city'),
            'status': data.get('status', 'PLANNED'),
            'tower_type': data.get('tower_type'),
            'substation_type': data.get('substation_type'),
            'cost': data.get('cost'),
            'start_date': data.get('start_date'),
            'end_date': data.get('end_date'),
            'project_size_km': data.get('project_size_km'),
            'description': data.get('description'),
            'team_id': data.get('team_id'),  # Assign team to project
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
        
        result = projects_collection.insert_one(project_data)
        project_data['_id'] = str(result.inserted_id)
        
        # Auto-create team entry if team_id is provided
        if data.get('team_id'):
            team_name = f"{data.get('name')}-Team"
            team_description = f"Team for {data.get('name')} project"
            
            # Check if team already exists
            existing_team = teams_collection.find_one({'team_id': data.get('team_id')})
            
            if not existing_team:
                # Create new team entry
                team_data = {
                    'team_id': data.get('team_id'),
                    'name': team_name,
                    'description': team_description,
                    'project_id': project_data['project_id'],  # Link to project
                    'project_name': data.get('name'),
                    'owner': username,
                    'members': [
                        {
                            'username': username,
                            'role': 'owner',
                            'joined_at': datetime.now(timezone.utc)
                        }
                    ],
                    'created_at': datetime.now(timezone.utc),
                    'updated_at': datetime.now(timezone.utc)
                }
                
                teams_collection.insert_one(team_data)
                print(f"Auto-created team: {team_name} for project: {data.get('name')}")
                
                # Notify team members of new project
                update_manager.notify_team_update(
                    data.get('team_id'),
                    'project_created',
                    {
                        'project_name': data.get('name'),
                        'project_id': project_data['project_id'],
                        'created_by': username,
                        'status': data.get('status', 'PLANNED')
                    }
                )
            else:
                # Update existing team with project info
                teams_collection.update_one(
                    {'team_id': data.get('team_id')},
                    {
                        '$set': {
                            'project_id': project_data['project_id'],
                            'project_name': data.get('name'),
                            'updated_at': datetime.now(timezone.utc)
                        }
                    }
                )
                print(f"Updated existing team with project info: {data.get('name')}")
                
                # Notify team members of project assignment
                update_manager.notify_team_update(
                    data.get('team_id'),
                    'project_assigned',
                    {
                        'project_name': data.get('name'),
                        'project_id': project_data['project_id'],
                        'assigned_by': username,
                        'status': data.get('status', 'PLANNED')
                    }
                )
        
        return jsonify(project_data), 201
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/projects/<project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    data = request.get_json()
    username = get_jwt_identity()
    
    try:
        update_data = {
            'name': data.get('name'),
            'location': data.get('location'),
            'state': data.get('state'),
            'city': data.get('city'),
            'status': data.get('status'),
            'tower_type': data.get('tower_type'),
            'substation_type': data.get('substation_type'),
            'cost': data.get('cost'),
            'start_date': data.get('start_date'),
            'end_date': data.get('end_date'),
            'project_size_km': data.get('project_size_km'),
            'description': data.get('description'),
            'updated_by': username,
            'updated_at': datetime.now(timezone.utc)
        }
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        result = projects_collection.update_one(
            {'project_id': project_id},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Project not found'}), 404
            
        return jsonify({'message': 'Project updated successfully'}), 200
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/projects/<project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    username = get_jwt_identity()
    
    try:
        # First get the project to check ownership and get team_id
        project = projects_collection.find_one({
            'project_id': project_id,
            'created_by': username
        })
        
        if not project:
            return jsonify({'error': 'Project not found or access denied'}), 404
        
        # Delete the project
        result = projects_collection.delete_one({
            'project_id': project_id,
            'created_by': username
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Project not found or access denied'}), 404
        
        # Auto-delete associated team if it exists
        if project.get('team_id'):
            team_result = teams_collection.delete_one({'team_id': project['team_id']})
            if team_result.deleted_count > 0:
                print(f"Auto-deleted team {project['team_id']} for deleted project {project_id}")
        
        return jsonify({'message': 'Project deleted successfully'}), 200
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/projects/<project_id>/details', methods=['GET'])
@jwt_required()
def get_project_details(project_id):
    """Get project details including team members"""
    username = get_jwt_identity()
    
    try:
        # Get user's teams
        user_teams = list(teams_collection.find({
            'members.username': username
        }, {'team_id': 1, '_id': 0}))
        
        team_ids = [team['team_id'] for team in user_teams]
        
        # Get project details - user can access if they created it OR if it's assigned to their team
        query = {
            'project_id': project_id,
            '$or': [
                {'created_by': username},  # User's own projects
                {'team_id': {'$in': team_ids}}  # Projects from user's teams
            ]
        }
        
        project = projects_collection.find_one(query, {'_id': 0})
        
        if not project:
            return jsonify({'error': 'Project not found or access denied'}), 404
        
        # Get team members if project has a team
        team_members = []
        if project.get('team_id'):
            team = teams_collection.find_one({'team_id': project['team_id']}, {'_id': 0})
            if team:
                team_members = team.get('members', [])
        
        # Combine project details with team members
        project_details = {
            **project,
            'team_members': team_members,
            'team_info': {
                'team_id': project.get('team_id'),
                'has_team': bool(project.get('team_id')),
                'member_count': len(team_members)
            }
        }
        
        return jsonify(project_details), 200
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/teams/create-for-existing-projects', methods=['POST'])
@jwt_required()
def create_teams_for_existing_projects():
    """Create teams for existing projects that don't have teams yet"""
    username = get_jwt_identity()
    
    try:
        # Get all projects created by the user that don't have teams
        projects_without_teams = list(projects_collection.find({
            'created_by': username,
            'team_id': {'$exists': False}
        }))
        
        created_teams = []
        
        for project in projects_without_teams:
            # Generate team_id based on project
            team_id = f"TEAM_{project['project_id']}"
            team_name = f"{project['name']}-Team"
            team_description = f"Team for {project['name']} project"
            
            # Check if team already exists
            existing_team = teams_collection.find_one({'team_id': team_id})
            
            if not existing_team:
                # Create new team
                team_data = {
                    'team_id': team_id,
                    'name': team_name,
                    'description': team_description,
                    'project_id': project['project_id'],
                    'project_name': project['name'],
                    'owner': username,
                    'members': [
                        {
                            'username': username,
                            'role': 'owner',
                            'joined_at': datetime.now(timezone.utc)
                        }
                    ],
                    'created_at': datetime.now(timezone.utc),
                    'updated_at': datetime.now(timezone.utc)
                }
                
                teams_collection.insert_one(team_data)
                
                # Update project with team_id
                projects_collection.update_one(
                    {'project_id': project['project_id']},
                    {'$set': {'team_id': team_id}}
                )
                
                created_teams.append({
                    'project_name': project['name'],
                    'team_name': team_name,
                    'team_id': team_id
                })
        
        return jsonify({
            'message': f'Created {len(created_teams)} teams for existing projects',
            'created_teams': created_teams
        }), 200
        
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

# Forecasts API
@app.route('/api/forecasts', methods=['GET'])
@jwt_required()
def get_forecasts():
    try:
        username = get_jwt_identity()
        
        # Get user's teams
        user_teams = list(teams_collection.find({
            'members.username': username
        }, {'team_id': 1, '_id': 0}))
        
        team_ids = [team['team_id'] for team in user_teams]
        
        # Get projects accessible to user
        accessible_projects = list(projects_collection.find({
            '$or': [
                {'created_by': username},
                {'team_id': {'$in': team_ids}}
            ]
        }, {'project_id': 1, '_id': 0}))
        
        project_ids = [project['project_id'] for project in accessible_projects]
        
        # Get forecasts for accessible projects
        forecasts = list(forecasts_collection.find({
            'project_id': {'$in': project_ids}
        }, {'_id': 0}).sort('created_at', -1))
        
        return jsonify(forecasts)
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/dashboard/metrics', methods=['GET'])
@jwt_required()
def get_dashboard_metrics():
    try:
        username = get_jwt_identity()
        print(f"Getting dashboard metrics for user: {username}")
        
        # Get user's teams
        user_teams = list(teams_collection.find({
            'members.username': username
        }, {'team_id': 1, '_id': 0}))
        
        team_ids = [team['team_id'] for team in user_teams]
        print(f"User {username} is in teams: {team_ids}")
        
        # Get projects accessible to user (own projects + team projects)
        accessible_projects_query = {
            '$or': [
                {'created_by': username},
                {'team_id': {'$in': team_ids}}
            ]
        }
        
        # Get total projects count (team-based)
        total_projects = projects_collection.count_documents(accessible_projects_query)
        print(f"Total accessible projects for {username}: {total_projects}")
        
        # Get active projects count (team-based)
        active_query = {**accessible_projects_query, 'status': 'IN PROGRESS'}
        active_projects = projects_collection.count_documents(active_query)
        print(f"Active projects for {username}: {active_projects}")
        
        # Calculate forecast accuracy from stored actual values (new schema)
        raw = list(project_forecasts_collection.find({}))
        forecasts_with_actuals = []
        for doc in raw:
            for f in doc.get('forecasts', []):
                if f.get('predictions') and f.get('actual_values') is not None:
                    # Count even empty dicts as present but zero; use robust sum
                    f_total = sum_numeric_values(f.get('predictions', {}))
                    a_total = sum_numeric_values(f.get('actual_values', {}))
                    f['_calc_forecast_total'] = f_total
                    f['_calc_actual_total'] = a_total
                    forecasts_with_actuals.append(f)
        
        print(f"Found {len(forecasts_with_actuals)} forecasts with actual values")
        
        if forecasts_with_actuals:
            total_accuracy = 0
            count = 0
            individual_accuracies = []
            
            for forecast in forecasts_with_actuals:
                if 'predictions' in forecast:
                    try:
                        forecast_total = forecast.get('_calc_forecast_total', sum_numeric_values(forecast['predictions']))
                        actual_total = forecast.get('_calc_actual_total', sum_numeric_values(forecast.get('actual_values', {})))
                        
                        if forecast_total > 0:
                            accuracy = (1 - abs(actual_total - forecast_total) / forecast_total) * 100
                            total_accuracy += accuracy
                            count += 1
                            individual_accuracies.append(accuracy)
                            print(f"Project {forecast.get('project_id', 'unknown')}: forecast={forecast_total:.1f}, actual={actual_total:.1f}, accuracy={accuracy:.1f}%")
                    except (TypeError, ValueError, ZeroDivisionError) as e:
                        print(f"Error calculating accuracy for project {forecast.get('project_id', 'unknown')}: {e}")
                        continue
            
            print(f"Individual accuracies: {individual_accuracies}")
            print(f"Total accuracy sum: {total_accuracy:.1f}")
            print(f"Count of projects: {count}")
            
            forecast_accuracy = round(total_accuracy / count, 1) if count > 0 else 0.0
            print(f"Calculated average: {total_accuracy:.1f} / {count} = {forecast_accuracy}%")
            print(f"Overall forecast accuracy: {forecast_accuracy}% (from {count} projects)")
        else:
            forecast_accuracy = 0.0
            print("No forecasts with actual values found")
        
        # Get pending orders count from orders collection (team-based)
        accessible_projects = list(projects_collection.find(accessible_projects_query, {'project_id': 1, '_id': 0}))
        project_ids = [project['project_id'] for project in accessible_projects]
        print(f"Accessible project IDs for {username}: {project_ids}")
        
        pending_orders = orders_collection.count_documents({
            'project_id': {'$in': project_ids},
            'status': 'PENDING'
        })
        
        # Get total orders count from orders collection (team-based)
        total_orders = orders_collection.count_documents({
            'project_id': {'$in': project_ids}
        })
        
        print(f"Orders data for {username}: pending={pending_orders}, total={total_orders}")
        
        # Calculate projects added this month (team-based)
        current_month = datetime.now(timezone.utc).strftime('%Y-%m')
        monthly_query = {
            **accessible_projects_query,
            'created_at': {
                '$gte': datetime.strptime(f'{current_month}-01', '%Y-%m-%d').replace(tzinfo=timezone.utc)
            }
        }
        projects_this_month = projects_collection.count_documents(monthly_query)
        
        metrics = {
            'total_projects': total_projects,
            'active_projects': active_projects,
            'forecast_accuracy': forecast_accuracy,
            'pending_orders': pending_orders,
            'total_orders': total_orders,
            'projects_this_month': projects_this_month,
            'current_month': current_month,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'debug_info': {
                'forecasts_with_actuals_count': len(forecasts_with_actuals),
                'individual_accuracies': individual_accuracies if 'individual_accuracies' in locals() else [],
                'calculation_details': f"{total_accuracy:.1f} / {count} = {forecast_accuracy}%" if count > 0 else "No data",
                'orders_data': f"pending={pending_orders}, total={total_orders}"
            }
        }
        
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': f'Failed to fetch dashboard metrics: {str(e)}'}), 500

@app.route('/api/dashboard/trends', methods=['GET'])
@jwt_required()
def get_dashboard_trends():
    try:
        print("Dashboard trends endpoint called")
        # Optional filter by project_id
        project_filter = request.args.get('project_id')
        query = {'project_id': project_filter} if project_filter else {}

        # Read from consolidated project_forecasts (optionally filtered)
        docs = list(project_forecasts_collection.find(query))
        forecasts = []
        for d in docs:
            for f in d.get('forecasts', []):
                if f.get('predictions'):
                    f['_calc_forecast_total'] = sum_numeric_values(f.get('predictions', {}))
                    f['_calc_actual_total'] = sum_numeric_values(f.get('actual_values', {}))
                    forecasts.append(f)
        print(f"Found {len(forecasts)} total forecasts (new schema)")

        # Aggregate data by month
        monthly_data = {}
        
        # Process forecasts and use stored actual values
        for forecast in forecasts:
            month = forecast.get('forecast_month')
            if month and 'predictions' in forecast:
                if month not in monthly_data:
                    monthly_data[month] = {
                        'forecast_total': 0, 
                        'actual_total': 0, 
                        'forecast_count': 0,
                        'actual_count': 0,
                        'month_name': month
                    }
                
                # Calculate total forecast quantity
                try:
                    total_forecast = forecast.get('_calc_forecast_total', sum_numeric_values(forecast.get('predictions', {})))
                    monthly_data[month]['forecast_total'] += total_forecast
                    monthly_data[month]['forecast_count'] += 1
                    
                    # Use stored actual values
                    if 'actual_values' in forecast and forecast['actual_values'] is not None:
                        total_actual = forecast.get('_calc_actual_total', sum_numeric_values(forecast.get('actual_values', {})))
                        monthly_data[month]['actual_total'] += total_actual
                        monthly_data[month]['actual_count'] += 1
                        print(f"Added actual values for {month}: {total_actual} (project: {forecast.get('project_id', 'unknown')})")
                    else:
                        # Fallback: generate if no actual values stored
                        import random
                        variation = random.uniform(0.85, 1.15)
                        total_actual = total_forecast * variation
                        monthly_data[month]['actual_total'] += total_actual
                        monthly_data[month]['actual_count'] += 1
                        print(f"Generated actual values for {month}: {total_actual} (project: {forecast.get('project_id', 'unknown')})")
                    
                except (TypeError, ValueError) as e:
                    print(f"Error processing forecast predictions: {e}")
                    continue
        
        # Convert to array and format for chart (calculate averages)
        trend_data = []
        for month_key, data in sorted(monthly_data.items()):
            # Calculate averages
            avg_forecast = data['forecast_total'] / data['forecast_count'] if data['forecast_count'] > 0 else 0
            avg_actual = data['actual_total'] / data['actual_count'] if data['actual_count'] > 0 else 0
            
            # Convert YYYY-MM to month name
            try:
                month_date = datetime.strptime(month_key, '%Y-%m')
                month_name = month_date.strftime('%b')
                trend_data.append({
                    'month': month_name,
                    'forecast': round(avg_forecast, 1),
                    'actual': round(avg_actual, 1),
                    'forecast_count': data['forecast_count'],
                    'actual_count': data['actual_count']
                })
                print(f"Month {month_name}: avg_forecast={avg_forecast:.1f}, avg_actual={avg_actual:.1f} (from {data['forecast_count']} forecasts, {data['actual_count']} actuals)")
            except ValueError as e:
                print(f"Error parsing month {month_key}: {e}")
                continue
        
        # If no data, return empty array (no dummy data)
        if not trend_data:
            print("No trend data found, returning empty array")
            trend_data = []
        
        print(f"Returning {len(trend_data)} trend data points")
        return jsonify(trend_data)
    except Exception as e:
        print(f"Error in dashboard trends: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to fetch trends data: {str(e)}'}), 500

# Get forecasts for a specific project and month
@app.route('/api/projects/<project_id>/forecasts/<month>', methods=['GET'])
@jwt_required()
def get_project_forecast_by_month(project_id, month):
    try:
        forecast = forecasts_collection.find_one({
            'project_id': project_id,
            'forecast_month': month
        })
        
        if not forecast:
            return jsonify({'error': f'No forecast found for project {project_id} in month {month}'}), 404
        
        # Convert ObjectId to string for JSON serialization
        forecast['_id'] = str(forecast['_id'])
        if 'created_at' in forecast:
            forecast['created_at'] = forecast['created_at'].isoformat()
        if 'updated_at' in forecast:
            forecast['updated_at'] = forecast['updated_at'].isoformat()
        
        return jsonify(forecast)
    except Exception as e:
        return jsonify({'error': f'Failed to fetch forecast: {str(e)}'}), 500

# Generate dynamic actual values for comparison
@app.route('/api/projects/<project_id>/forecasts/<month>/actuals', methods=['GET'])
@jwt_required()
def generate_actual_values(project_id, month):
    try:
        # Get the forecast data from consolidated doc
        doc = project_forecasts_collection.find_one({'project_id': project_id})
        forecast = None
        for f in (doc.get('forecasts', []) if doc else []):
            if f.get('forecast_month') == month:
                forecast = f
                break
        
        if not forecast:
            return jsonify({'error': f'No forecast found for project {project_id} in month {month}'}), 404
        
        # Generate dynamic actual values based on forecast + some variation
        import random
        actual_values = {}
        
        for material, forecast_value in forecast['predictions'].items():
            # Generate actual value with ±10% variation from forecast
            variation = random.uniform(0.85, 1.15)  # 85% to 115% of forecast
            actual_value = forecast_value * variation
            actual_values[material] = round(actual_value, 2)
        
        return jsonify({
            'forecast_month': month,
            'project_id': project_id,
            'forecast_values': forecast['predictions'],
            'actual_values': actual_values,
            'generated_at': datetime.now(timezone.utc).isoformat()
        })
    except Exception as e:
        return jsonify({'error': f'Failed to generate actual values: {str(e)}'}), 500

# Get all forecasts for a project (month-wise, new schema)
@app.route('/api/projects/<project_id>/forecasts', methods=['GET'])
@jwt_required()
def get_project_forecasts(project_id):
    try:
        # New schema first
        doc = project_forecasts_collection.find_one({'project_id': project_id})
        forecasts = (doc.get('forecasts', []) if doc else [])
        forecasts = [f for f in forecasts if f.get('predictions')]
        # Fallback to legacy collection if empty (for older data)
        if not forecasts:
            legacy = list(forecasts_collection.find({'project_id': project_id}))
            forecasts = []
            for f in legacy:
                entry = {
                    'forecast_month': f.get('forecast_month'),
                    'predictions': f.get('predictions', {}),
                    'actual_values': f.get('actual_values', {}),
                    'created_at': f.get('created_at').isoformat() if f.get('created_at') else None,
                    'updated_at': f.get('updated_at').isoformat() if f.get('updated_at') else None
                }
                if entry['forecast_month'] and entry['predictions']:
                    forecasts.append(entry)
        # Sort newest first
        forecasts.sort(key=lambda x: x.get('forecast_month', ''), reverse=True)
        return jsonify(forecasts)
    except Exception as e:
        return jsonify({'error': f'Failed to fetch forecasts: {str(e)}'}), 500

@app.route('/api/forecasts', methods=['POST'])
@jwt_required()
def create_forecast():
    data = request.get_json()
    username = get_jwt_identity()
    
    try:
        forecast_data = {
            'project_id': data.get('project_id'),
            'material': data.get('material'),
            'quantity': data.get('quantity'),
            'unit': data.get('unit'),
            'range_min': data.get('range_min'),
            'range_max': data.get('range_max'),
            'confidence': data.get('confidence'),
            'period': data.get('period'),
            'status': data.get('status'),
            'created_by': username,
            'created_at': datetime.now(timezone.utc)
        }
        
        result = forecasts_collection.insert_one(forecast_data)
        forecast_data['_id'] = str(result.inserted_id)
        return jsonify(forecast_data), 201
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

# Material Actual Values API
@app.route('/api/material-actuals', methods=['GET'])
@jwt_required()
def get_material_actuals():
    try:
        project_id = request.args.get('project_id')
        month = request.args.get('month')
        
        query = {}
        if project_id:
            query['project_id'] = project_id
        if month:
            query['month'] = month
            
        actuals = list(material_actuals_collection.find(query, {'_id': 0}).sort('created_at', -1))
        return jsonify(actuals)
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/material-actuals', methods=['POST'])
@jwt_required()
def save_material_actuals():
    data = request.get_json()
    username = get_jwt_identity()
    
    try:
        # Calculate current, previous, and next month
        now = datetime.now(timezone.utc)
        current_month = now.strftime('%Y-%m')
        prev_month = (now.replace(day=1) - timedelta(days=1)).strftime('%Y-%m')
        next_month = (now.replace(day=28) + timedelta(days=4)).replace(day=1).strftime('%Y-%m')
        
        actual_data = {
            'project_id': data.get('project_id'),
            'month': data.get('month', current_month),
            'material_values': data.get('material_values', {}),
            'combined_score': data.get('combined_score', 0),
            'forecast_total': data.get('forecast_total', 0),
            'accuracy_percentage': data.get('accuracy_percentage', 0),
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
        
        # Use upsert to update existing or create new
        result = material_actuals_collection.update_one(
            {'project_id': actual_data['project_id'], 'month': actual_data['month']},
            {'$set': actual_data},
            upsert=True
        )
        
        return jsonify({
            'message': 'Material actuals saved successfully',
            'project_id': actual_data['project_id'],
            'month': actual_data['month'],
            'current_month': current_month,
            'prev_month': prev_month,
            'next_month': next_month
        }), 201
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

# Inventory API
@app.route('/api/inventory', methods=['POST'])
@jwt_required()
def create_inventory_item():
    data = request.get_json()
    username = get_jwt_identity()
    
    try:
        inventory_data = {
            'material_code': data.get('material_code'),
            'name': data.get('name'),
            'category': data.get('category'),
            'warehouse': data.get('warehouse'),
            'quantity': data.get('quantity'),
            'unit': data.get('unit'),
            'min_stock': data.get('min_stock'),
            'max_stock': data.get('max_stock'),
            'available': data.get('available'),
            'reserved': data.get('reserved'),
            'in_transit': data.get('in_transit'),
            'status': data.get('status'),
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
        
        result = inventory_collection.insert_one(inventory_data)
        inventory_data['_id'] = str(result.inserted_id)
        return jsonify(inventory_data), 201
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

# Material pricing data (market rates)
MATERIAL_PRICES = {
    'Steel Tower': 45000,
    'Conductor Cable': 850,
    'Insulator': 1200,
    'Power Transformer': 2500000,
    'Switchgear': 180000,
    'Circuit Breaker': 95000,
    'Cable Tray': 350,
    'Lightning Arrester': 8500,
    'Surge Arrester': 12000,
    'Busbar': 2800
}

# Orders API
@app.route('/api/orders', methods=['GET'])
@jwt_required()
def get_orders():
    try:
        username = get_jwt_identity()
        
        # Get user's teams
        user_teams = list(teams_collection.find({
            'members.username': username
        }, {'team_id': 1, '_id': 0}))
        
        team_ids = [team['team_id'] for team in user_teams]
        
        # Get projects accessible to user
        accessible_projects = list(projects_collection.find({
            '$or': [
                {'created_by': username},
                {'team_id': {'$in': team_ids}}
            ]
        }, {'project_id': 1, '_id': 0}))
        
        project_ids = [project['project_id'] for project in accessible_projects]
        
        # Get orders for accessible projects
        orders = list(orders_collection.find({
            'project_id': {'$in': project_ids}
        }, {'_id': 0}).sort('created_at', -1))
        
        return jsonify(orders)
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/orders', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json()
    username = get_jwt_identity()
    
    try:
        material = data.get('material')
        quantity = float(data.get('quantity', 0))
        
        # Calculate unit price based on material type
        unit_price = MATERIAL_PRICES.get(material, 1000)  # Default price if material not found
        
        # Add some variation based on dealer (simulate market conditions)
        dealer = data.get('dealer', '')
        if 'Power Tech Solutions' in dealer:
            unit_price *= 1.05  # 5% premium for premium dealer
        elif 'Grid Equipment Ltd' in dealer:
            unit_price *= 0.98  # 2% discount for bulk dealer
        elif 'Electrical Components Co' in dealer:
            unit_price *= 1.02  # 2% premium for quality dealer
        
        total_price = quantity * unit_price
        
        order_data = {
            'order_id': f'ORD_{datetime.now().strftime("%Y%m%d%H%M%S")}',
            'project': data.get('project'),
            'material': material,
            'dealer': dealer,
            'quantity': quantity,
            'unit_price': round(unit_price, 2),
            'total_price': round(total_price, 2),
            'expected_delivery': data.get('expected_delivery'),
            'status': 'PENDING',
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
        
        result = orders_collection.insert_one(order_data)
        order_data['_id'] = str(result.inserted_id)
        
        # Notify team members if project has a team
        if order_data.get('project_id'):
            project = projects_collection.find_one({'project_id': order_data['project_id']})
            if project and project.get('team_id'):
                update_manager.notify_team_update(
                    project['team_id'],
                    'order_created',
                    {
                        'order_id': order_data['order_id'],
                        'project_name': project.get('name'),
                        'project_id': order_data['project_id'],
                        'material': order_data.get('material'),
                        'quantity': order_data.get('quantity'),
                        'created_by': username
                    }
                )
        
        return jsonify(order_data), 201
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/projects/<project_id>/actual-values', methods=['POST'])
@jwt_required()
def save_actual_values(project_id):
    try:
        data = request.get_json()
        requested_month = data.get('month')  # optional 'YYYY-MM'
        actual_values = data.get('actual_values', {})

        # Load consolidated project forecasts
        doc = project_forecasts_collection.find_one({'project_id': project_id})
        if not doc or not doc.get('forecasts'):
            return jsonify({'error': 'No forecast found for this project'}), 404

        # Determine target month: requested month or latest available
        months = [f for f in doc['forecasts'] if f.get('predictions')]
        if not months:
            return jsonify({'error': 'No forecast found for this project'}), 404

        if requested_month:
            target_month = requested_month
        else:
            # Latest by forecast_month string (YYYY-MM)
            target_month = sorted((m.get('forecast_month') for m in months if m.get('forecast_month')), reverse=True)[0]

        # Update the month entry using arrayFilters
        result = project_forecasts_collection.update_one(
            {'project_id': project_id},
            {
                '$set': {
                    'forecasts.$[m].actual_values': actual_values,
                    'forecasts.$[m].updated_at': datetime.now(timezone.utc),
                    'forecasts.$[m].actual_values_updated_at': datetime.now(timezone.utc),
                    'forecasts.$[m].actual_values_updated_by': get_jwt_identity()
                }
            },
            array_filters=[{'m.forecast_month': target_month}]
        )

        if result.matched_count == 0:
            return jsonify({'error': f'No forecast found for month {target_month}'}), 404

        return jsonify({
            'message': 'Actual values saved successfully',
            'project_id': project_id,
            'month': target_month,
            'actual_values': actual_values
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to save actual values: {str(e)}'}), 500

@app.route('/api/orders/<order_id>', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    data = request.get_json()
    username = get_jwt_identity()
    
    try:
        update_data = {
            'status': data.get('status'),
            'updated_by': username,
            'updated_at': datetime.now(timezone.utc)
        }
        
        result = orders_collection.update_one(
            {'order_id': order_id, 'created_by': username},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Order not found or access denied'}), 404
        
        # Notify team members of order status change
        order = orders_collection.find_one({'order_id': order_id})
        if order and order.get('project_id'):
            project = projects_collection.find_one({'project_id': order['project_id']})
            if project and project.get('team_id'):
                update_manager.notify_team_update(
                    project['team_id'],
                    'order_status_changed',
                    {
                        'order_id': order_id,
                        'project_name': project.get('name'),
                        'project_id': order['project_id'],
                        'old_status': order.get('status'),
                        'new_status': data.get('status'),
                        'updated_by': username
                    }
                )
            
        return jsonify({'message': 'Order updated successfully'}), 200
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/orders/<order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    username = get_jwt_identity()
    
    try:
        result = orders_collection.delete_one({
            'order_id': order_id, 
            'created_by': username
        })
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Order not found or you do not have permission to delete it'}), 404
            
        return jsonify({'message': 'Order deleted successfully'}), 200
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

# Real-time update system
class RealTimeUpdateManager:
    def __init__(self):
        self.subscribers = defaultdict(list)  # team_id -> list of user_ids
        self.update_queue = []
        self.lock = threading.Lock()
    
    def subscribe_user_to_team(self, user_id, team_id):
        """Subscribe a user to receive updates for a team"""
        with self.lock:
            if user_id not in self.subscribers[team_id]:
                self.subscribers[team_id].append(user_id)
                print(f"User {user_id} subscribed to team {team_id}")
    
    def unsubscribe_user_from_team(self, user_id, team_id):
        """Unsubscribe a user from team updates"""
        with self.lock:
            if user_id in self.subscribers[team_id]:
                self.subscribers[team_id].remove(user_id)
                print(f"User {user_id} unsubscribed from team {team_id}")
    
    def notify_team_update(self, team_id, update_type, data):
        """Notify all team members of an update"""
        with self.lock:
            update = {
                'team_id': team_id,
                'update_type': update_type,
                'data': data,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            self.update_queue.append(update)
            print(f"Queued update for team {team_id}: {update_type}")
    
    def get_updates_for_user(self, user_id):
        """Get all pending updates for a user"""
        with self.lock:
            user_updates = []
            for update in self.update_queue[:]:
                # Check if user is subscribed to this team
                if user_id in self.subscribers.get(update['team_id'], []):
                    user_updates.append(update)
                    self.update_queue.remove(update)
            return user_updates

# Global update manager
update_manager = RealTimeUpdateManager()

@app.route('/api/updates/subscribe/<team_id>', methods=['POST'])
@jwt_required()
def subscribe_to_updates(team_id):
    """Subscribe user to team updates"""
    username = get_jwt_identity()
    update_manager.subscribe_user_to_team(username, team_id)
    return jsonify({'message': f'Subscribed to updates for team {team_id}'}), 200

@app.route('/api/updates/unsubscribe/<team_id>', methods=['POST'])
@jwt_required()
def unsubscribe_from_updates(team_id):
    """Unsubscribe user from team updates"""
    username = get_jwt_identity()
    update_manager.unsubscribe_user_from_team(username, team_id)
    return jsonify({'message': f'Unsubscribed from updates for team {team_id}'}), 200

@app.route('/api/updates/poll', methods=['GET'])
@jwt_required()
def poll_updates():
    """Poll for pending updates"""
    username = get_jwt_identity()
    updates = update_manager.get_updates_for_user(username)
    return jsonify({'updates': updates}), 200

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

# Inventory Management Endpoints
@app.route('/api/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    username = get_jwt_identity()
    
    try:
        # Get inventory items (inventory is typically shared across teams)
        inventory_items = list(inventory_collection.find({}, {'_id': 0}))
        return jsonify(inventory_items), 200
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/inventory/<material_code>', methods=['PUT'])
@jwt_required()
def update_inventory_item(material_code):
    username = get_jwt_identity()
    data = request.get_json()
    
    try:
        update_data = {
            'quantity': data.get('quantity'),
            'min_stock': data.get('min_stock'),
            'max_stock': data.get('max_stock'),
            'available': data.get('available'),
            'reserved': data.get('reserved'),
            'in_transit': data.get('in_transit'),
            'warehouse': data.get('warehouse'),
            'updated_by': username,
            'updated_at': datetime.now(timezone.utc)
        }
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        result = inventory_collection.update_one(
            {'material_code': material_code},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Inventory item not found'}), 404
            
        return jsonify({'message': 'Inventory item updated successfully'}), 200
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/inventory/initialize', methods=['POST'])
@jwt_required()
def initialize_inventory():
    username = get_jwt_identity()
    
    # Material definitions based on dataset
    material_definitions = [
        { 
            'material_code': 'steel_tons', 
            'name': 'Steel (Tons)', 
            'category': 'Structural Materials', 
            'unit': 'tons',
            'min_stock': 20,
            'max_stock': 100,
            'quantity': 50,
            'available': 45,
            'reserved': 3,
            'in_transit': 2,
            'warehouse': 'Main Warehouse',
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        { 
            'material_code': 'copper_tons', 
            'name': 'Copper (Tons)', 
            'category': 'Conductors', 
            'unit': 'tons',
            'min_stock': 2,
            'max_stock': 10,
            'quantity': 5,
            'available': 4,
            'reserved': 1,
            'in_transit': 0,
            'warehouse': 'Main Warehouse',
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        { 
            'material_code': 'cement_tons', 
            'name': 'Cement (Tons)', 
            'category': 'Construction Materials', 
            'unit': 'tons',
            'min_stock': 15,
            'max_stock': 50,
            'quantity': 30,
            'available': 28,
            'reserved': 2,
            'in_transit': 0,
            'warehouse': 'Main Warehouse',
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        { 
            'material_code': 'aluminum_tons', 
            'name': 'Aluminum (Tons)', 
            'category': 'Conductors', 
            'unit': 'tons',
            'min_stock': 1,
            'max_stock': 8,
            'quantity': 4,
            'available': 3,
            'reserved': 1,
            'in_transit': 0,
            'warehouse': 'Main Warehouse',
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        { 
            'material_code': 'insulators_count', 
            'name': 'Insulators', 
            'category': 'Electrical Equipment', 
            'unit': 'pieces',
            'min_stock': 30,
            'max_stock': 100,
            'quantity': 65,
            'available': 60,
            'reserved': 3,
            'in_transit': 2,
            'warehouse': 'Main Warehouse',
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        { 
            'material_code': 'conductors_tons', 
            'name': 'Conductors (Tons)', 
            'category': 'Conductors', 
            'unit': 'tons',
            'min_stock': 15,
            'max_stock': 50,
            'quantity': 25,
            'available': 22,
            'reserved': 2,
            'in_transit': 1,
            'warehouse': 'Main Warehouse',
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        { 
            'material_code': 'transformers_count', 
            'name': 'Transformers', 
            'category': 'Electrical Equipment', 
            'unit': 'pieces',
            'min_stock': 1,
            'max_stock': 5,
            'quantity': 3,
            'available': 2,
            'reserved': 1,
            'in_transit': 0,
            'warehouse': 'Main Warehouse',
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        { 
            'material_code': 'switchgears_count', 
            'name': 'Switchgears', 
            'category': 'Electrical Equipment', 
            'unit': 'pieces',
            'min_stock': 3,
            'max_stock': 8,
            'quantity': 5,
            'available': 4,
            'reserved': 1,
            'in_transit': 0,
            'warehouse': 'Main Warehouse',
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        { 
            'material_code': 'cables_count', 
            'name': 'Cables', 
            'category': 'Conductors', 
            'unit': 'pieces',
            'min_stock': 4,
            'max_stock': 10,
            'quantity': 7,
            'available': 6,
            'reserved': 1,
            'in_transit': 0,
            'warehouse': 'Main Warehouse',
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        { 
            'material_code': 'protective_relays_count', 
            'name': 'Protective Relays', 
            'category': 'Protection Equipment', 
            'unit': 'pieces',
            'min_stock': 2,
            'max_stock': 8,
            'quantity': 4,
            'available': 3,
            'reserved': 1,
            'in_transit': 0,
            'warehouse': 'Main Warehouse',
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        { 
            'material_code': 'oil_tons', 
            'name': 'Transformer Oil (Tons)', 
            'category': 'Electrical Equipment', 
            'unit': 'tons',
            'min_stock': 2,
            'max_stock': 5,
            'quantity': 3,
            'available': 2,
            'reserved': 1,
            'in_transit': 0,
            'warehouse': 'Main Warehouse',
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        { 
            'material_code': 'foundation_concrete_tons', 
            'name': 'Foundation Concrete (Tons)', 
            'category': 'Construction Materials', 
            'unit': 'tons',
            'min_stock': 10,
            'max_stock': 30,
            'quantity': 20,
            'available': 18,
            'reserved': 2,
            'in_transit': 0,
            'warehouse': 'Main Warehouse',
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        { 
            'material_code': 'bolts_count', 
            'name': 'Bolts & Fasteners', 
            'category': 'Structural Materials', 
            'unit': 'pieces',
            'min_stock': 1000,
            'max_stock': 2000,
            'quantity': 1500,
            'available': 1400,
            'reserved': 80,
            'in_transit': 20,
            'warehouse': 'Main Warehouse',
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
    ]
    
    try:
        # Check if inventory already exists
        existing_count = inventory_collection.count_documents({})
        if existing_count > 0:
            return jsonify({'message': 'Inventory already initialized', 'count': existing_count}), 200
        
        # Insert all material definitions
        result = inventory_collection.insert_many(material_definitions)
        return jsonify({
            'message': 'Inventory initialized successfully',
            'count': len(result.inserted_ids)
        }), 201
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/materials', methods=['GET'])
@jwt_required()
def get_materials():
    try:
        # Get materials from target_cols (predicted materials)
        materials = []
        for col in target_cols:
            # Convert column names to readable material names and remove "Quantity" prefix
            material_name = col.replace('_', ' ').title()
            # Remove "Quantity" prefix if it exists
            if material_name.startswith('Quantity '):
                material_name = material_name.replace('Quantity ', '')
            materials.append({
                'id': col,
                'name': material_name,
                'unit': 'tons' if 'tons' in col.lower() else 'units'
            })
        
        return jsonify(materials)
    except Exception as e:
        return jsonify({'error': f'Failed to fetch materials: {str(e)}'}), 500

# Warehouse Management Endpoints
@app.route('/api/warehouses', methods=['GET'])
@jwt_required()
def get_warehouses():
    try:
        # Get unique warehouses from inventory
        warehouses = inventory_collection.distinct('warehouse')
        warehouses = [w for w in warehouses if w]  # Filter out None/empty values
        return jsonify(warehouses)
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/inventory/<material_code>', methods=['DELETE'])
@jwt_required()
def delete_inventory_item(material_code):
    username = get_jwt_identity()
    
    try:
        result = inventory_collection.delete_one({'material_code': material_code})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Inventory item not found'}), 404
            
        return jsonify({
            'message': 'Inventory item deleted successfully',
            'material_code': material_code,
            'deleted_by': username,
            'deleted_at': datetime.now(timezone.utc).isoformat()
        }), 200
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/inventory/delete-all', methods=['DELETE'])
@jwt_required()
def delete_all_inventory():
    username = get_jwt_identity()
    
    try:
        # Delete all inventory items
        result = inventory_collection.delete_many({})
        
        return jsonify({
            'message': 'All inventory items deleted successfully',
            'deleted_count': result.deleted_count,
            'deleted_by': username,
            'deleted_at': datetime.now(timezone.utc).isoformat()
        }), 200
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

# ==================== TEAM COLLABORATION APIs ====================

@app.route('/api/teams', methods=['POST'])
@jwt_required()
def create_team():
    """Create a new team"""
    data = request.get_json()
    username = get_jwt_identity()
    
    try:
        team_data = {
            'team_id': f'TEAM_{datetime.now().strftime("%Y%m%d%H%M%S")}',
            'name': data.get('name'),
            'description': data.get('description', ''),
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'members': [{
                'username': username,
                'role': 'owner',
                'joined_at': datetime.now(timezone.utc)
            }],
            'settings': {
                'allow_member_invites': True,
                'require_approval_for_projects': False
            }
        }
        
        result = teams_collection.insert_one(team_data)
        team_data['_id'] = str(result.inserted_id)
        
        # Create notification for team creation
        create_notification(username, 'team_created', f'Team "{team_data["name"]}" created successfully')
        
        return jsonify(team_data), 201
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/teams', methods=['GET'])
@jwt_required()
def get_user_teams():
    """Get all teams for the current user"""
    username = get_jwt_identity()
    
    try:
        teams = list(teams_collection.find({
            'members.username': username
        }, {'_id': 0}))
        
        return jsonify(teams)
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/teams/<team_id>', methods=['GET'])
@jwt_required()
def get_team_details(team_id):
    """Get detailed information about a specific team"""
    username = get_jwt_identity()
    
    try:
        team = teams_collection.find_one({
            'team_id': team_id,
            'members.username': username
        }, {'_id': 0})
        
        if not team:
            return jsonify({'error': 'Team not found or access denied'}), 404
            
        return jsonify(team)
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/teams/<team_id>/invite', methods=['POST'])
@jwt_required()
def invite_team_member(team_id):
    """Invite a new member to the team"""
    data = request.get_json()
    username = get_jwt_identity()
    email = data.get('email')
    role = data.get('role', 'member')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    try:
        # Check if user has permission to invite (owner or admin)
        team = teams_collection.find_one({
            'team_id': team_id,
            'members.username': username,
            'members.role': {'$in': ['owner', 'admin']}
        })
        
        if not team:
            return jsonify({'error': 'Permission denied'}), 403
        
        # Check if user already exists
        existing_user = users_collection.find_one({'email': email})
        
        # Generate invitation token
        invitation_token = secrets.token_urlsafe(32)
        
        invitation_data = {
            'invitation_token': invitation_token,
            'team_id': team_id,
            'team_name': team['name'],
            'email': email,
            'role': role,
            'invited_by': username,
            'created_at': datetime.now(timezone.utc),
            'status': 'pending',
            'user_exists': existing_user is not None
        }
        
        team_invitations_collection.insert_one(invitation_data)
        
        # Send invitation email
        frontend_url = os.getenv('FRONTEND_BASE_URL', 'http://localhost:5173')
        frontend_url = frontend_url.rstrip('/')
        
        if existing_user:
            # User exists, send direct invitation
            invitation_url = f"{frontend_url}/team-invitation?token={invitation_token}"
            subject = f'Team Invitation - {team["name"]}'
        else:
            # User doesn't exist, send registration + invitation
            invitation_url = f"{frontend_url}/register?invite={invitation_token}"
            subject = f'Join {team["name"]} Team - PlanGrid'
        
        msg = Message(
            subject=subject,
            recipients=[email],
            sender=app.config['MAIL_DEFAULT_SENDER']
        )
        
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Team Invitation - PlanGrid</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }}
                .content {{
                    background: #f8fafc;
                    padding: 30px;
                    border-radius: 0 0 8px 8px;
                }}
                .button {{
                    display: inline-block;
                    background: #2563eb;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin: 20px 0;
                    font-weight: bold;
                }}
                .team-info {{
                    background: #e2e8f0;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🤝 Team Invitation</h1>
                <p>PlanGrid Material Forecast Portal</p>
            </div>
            
            <div class="content">
                <h2>You've been invited to join a team!</h2>
                
                <div class="team-info">
                    <h3>Team: {team['name']}</h3>
                    <p><strong>Role:</strong> {role.title()}</p>
                    <p><strong>Invited by:</strong> {username}</p>
                    {f"<p><strong>Description:</strong> {team.get('description', 'No description provided')}</p>" if team.get('description') else ''}
                </div>
                
                <p>Click the button below to accept the invitation:</p>
                
                <div style="text-align: center;">
                    <a href="{invitation_url}" class="button">Accept Invitation</a>
                </div>
                
                <p>Or copy and paste this link:</p>
                <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 4px;">
                    {invitation_url}
                </p>
                
                <p><small>This invitation will expire in 7 days.</small></p>
            </div>
        </body>
        </html>
        """
        
        mail.send(msg)
        
        return jsonify({
            'message': 'Invitation sent successfully',
            'invitation_token': invitation_token
        }), 201
        
    except Exception as e:
        print(f"Error sending team invitation: {e}")
        return jsonify({'error': 'Failed to send invitation'}), 500

@app.route('/api/teams/invitations/<invitation_token>', methods=['GET'])
def get_invitation_details(invitation_token):
    """Get invitation details by token"""
    try:
        invitation = team_invitations_collection.find_one({
            'invitation_token': invitation_token,
            'status': 'pending',
            'created_at': {'$gte': datetime.now(timezone.utc) - timedelta(days=7)}
        }, {'_id': 0})
        
        if not invitation:
            return jsonify({'error': 'Invalid or expired invitation'}), 404
            
        return jsonify(invitation)
    except Exception as e:
        return jsonify({'error': f'Failed to get invitation: {str(e)}'}), 500

@app.route('/api/teams/invitations/<invitation_token>/accept', methods=['POST'])
@jwt_required()
def accept_team_invitation(invitation_token):
    """Accept a team invitation"""
    username = get_jwt_identity()
    
    try:
        invitation = team_invitations_collection.find_one({
            'invitation_token': invitation_token,
            'status': 'pending',
            'created_at': {'$gte': datetime.now(timezone.utc) - timedelta(days=7)}
        })
        
        if not invitation:
            return jsonify({'error': 'Invalid or expired invitation'}), 404
        
        # Add user to team
        teams_collection.update_one(
            {'team_id': invitation['team_id']},
            {
                '$push': {
                    'members': {
                        'username': username,
                        'role': invitation['role'],
                        'joined_at': datetime.now(timezone.utc)
                    }
                }
            }
        )
        
        # Mark invitation as accepted
        team_invitations_collection.update_one(
            {'invitation_token': invitation_token},
            {'$set': {'status': 'accepted', 'accepted_at': datetime.now(timezone.utc)}}
        )
        
        # Create notification
        create_notification(username, 'team_joined', f'You joined team "{invitation["team_name"]}"')
        
        # Notify team members about new member
        team = teams_collection.find_one({'team_id': invitation['team_id']})
        if team:
            for member in team['members']:
                if member['username'] != username:
                    create_notification(
                        member['username'], 
                        'team_member_joined', 
                        f'{username} joined team "{invitation["team_name"]}"'
                    )
        
        # Notify real-time updates
        update_manager.notify_team_update(invitation['team_id'], 'member_joined', {
            'username': username,
            'role': invitation['role']
        })
        
        return jsonify({'message': 'Successfully joined the team'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to accept invitation: {str(e)}'}), 500

@app.route('/api/projects/invitations/<invitation_token>/accept', methods=['POST'])
@jwt_required()
def accept_project_invitation(invitation_token):
    """Accept a project invitation"""
    username = get_jwt_identity()
    
    try:
        invitation = team_invitations_collection.find_one({
            'invitation_token': invitation_token,
            'status': 'pending',
            'type': 'project_invitation',
            'created_at': {'$gte': datetime.now(timezone.utc) - timedelta(days=7)}
        })
        
        if not invitation:
            return jsonify({'error': 'Invalid or expired invitation'}), 404
        
        # Get the project to find its team
        project = projects_collection.find_one({'project_id': invitation['project_id']})
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # If project has a team, add user to that team
        if project.get('team_id'):
            # Check if user is already in the team
            team = teams_collection.find_one({
                'team_id': project['team_id'],
                'members.username': username
            })
            
            if not team:
                # Add user to the project's team
                teams_collection.update_one(
                    {'team_id': project['team_id']},
                    {
                        '$push': {
                            'members': {
                                'username': username,
                                'role': invitation['role'],
                                'joined_at': datetime.now(timezone.utc)
                            }
                        }
                    }
                )
        
        # Mark invitation as accepted
        team_invitations_collection.update_one(
            {'invitation_token': invitation_token},
            {'$set': {'status': 'accepted', 'accepted_at': datetime.now(timezone.utc)}}
        )
        
        # Create notification
        create_notification(username, 'project_joined', f'You joined project "{invitation["project_name"]}"')
        
        # Notify project team members about new member
        if project.get('team_id'):
            team = teams_collection.find_one({'team_id': project['team_id']})
            if team:
                for member in team['members']:
                    if member['username'] != username:
                        create_notification(
                            member['username'], 
                            'project_member_joined', 
                            f'{username} joined project "{invitation["project_name"]}"'
                        )
                
                # Notify real-time updates
                update_manager.notify_team_update(project['team_id'], 'project_member_joined', {
                    'username': username,
                    'role': invitation['role'],
                    'project_name': invitation['project_name']
                })
        
        return jsonify({'message': 'Successfully joined the project'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to accept project invitation: {str(e)}'}), 500

@app.route('/api/teams/<team_id>/members', methods=['GET'])
@jwt_required()
def get_team_members(team_id):
    """Get all members of a team"""
    username = get_jwt_identity()
    
    try:
        team = teams_collection.find_one({
            'team_id': team_id,
            'members.username': username
        })
        
        if not team:
            return jsonify({'error': 'Team not found or access denied'}), 404
            
        return jsonify(team['members'])
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/teams/<team_id>/members/<member_username>', methods=['DELETE'])
@jwt_required()
def remove_team_member(team_id, member_username):
    """Remove a member from the team"""
    username = get_jwt_identity()
    
    try:
        # Check if user has permission (owner or admin)
        team = teams_collection.find_one({
            'team_id': team_id,
            'members.username': username,
            'members.role': {'$in': ['owner', 'admin']}
        })
        
        if not team:
            return jsonify({'error': 'Permission denied'}), 403
        
        # Check if trying to remove owner
        member_to_remove = next((m for m in team['members'] if m['username'] == member_username), None)
        if member_to_remove and member_to_remove['role'] == 'owner':
            return jsonify({'error': 'Cannot remove team owner'}), 400
        
        # Remove member
        teams_collection.update_one(
            {'team_id': team_id},
            {'$pull': {'members': {'username': member_username}}}
        )
        
        # Create notification for removed member
        create_notification(member_username, 'team_removed', f'You were removed from team "{team["name"]}"')
        
        return jsonify({'message': 'Member removed successfully'}), 200
        
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/teams/<team_id>', methods=['DELETE'])
@jwt_required()
def delete_team(team_id):
    """Delete a team (only owner can delete)"""
    username = get_jwt_identity()
    
    try:
        # Check if user is the team owner
        team = teams_collection.find_one({
            'team_id': team_id,
            'members.username': username,
            'members.role': 'owner'
        })
        
        if not team:
            return jsonify({'error': 'Permission denied. Only team owner can delete the team.'}), 403
        
        # Notify all team members before deletion
        for member in team.get('members', []):
            if member['username'] != username:
                create_notification(
                    member['username'], 
                    'team_deleted', 
                    f'Team "{team["name"]}" has been deleted by the owner'
                )
        
        # Delete the team
        result = teams_collection.delete_one({'team_id': team_id})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Team not found'}), 404
        
        return jsonify({'message': 'Team deleted successfully'}), 200
        
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/teams/<team_id>/projects', methods=['GET'])
@jwt_required()
def get_team_projects(team_id):
    """Get all projects shared with the team"""
    username = get_jwt_identity()
    
    try:
        # Check if user is team member
        team = teams_collection.find_one({
            'team_id': team_id,
            'members.username': username
        })
        
        if not team:
            return jsonify({'error': 'Team not found or access denied'}), 404
        
        # Get projects created by team members
        team_members = [m['username'] for m in team['members']]
        projects = list(projects_collection.find({
            'created_by': {'$in': team_members}
        }, {'_id': 0}).sort('created_at', -1))
        
        return jsonify(projects)
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_user_notifications():
    """Get notifications for the current user"""
    username = get_jwt_identity()
    
    try:
        notifications = list(notifications_collection.find({
            'user_id': username
        }, {'_id': 0}).sort('created_at', -1).limit(50))
        
        return jsonify(notifications)
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/notifications/<notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    username = get_jwt_identity()
    
    try:
        notifications_collection.update_one(
            {'_id': ObjectId(notification_id), 'user_id': username},
            {'$set': {'read': True, 'read_at': datetime.now(timezone.utc)}}
        )
        
        return jsonify({'message': 'Notification marked as read'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to update notification: {str(e)}'}), 500

@app.route('/api/team-data-summary', methods=['GET'])
@jwt_required()
def get_team_data_summary():
    """Get a summary of all team-shared data"""
    username = get_jwt_identity()
    
    try:
        team_query = get_team_based_query(username)
        team_members = get_team_members_for_user(username)
        
        # Get counts for different data types
        projects_count = projects_collection.count_documents(team_query)
        orders_count = orders_collection.count_documents(team_query)
        forecasts_count = forecasts_collection.count_documents(team_query)
        inventory_count = inventory_collection.count_documents({})  # Inventory is shared
        
        # Get recent activity
        recent_projects = list(projects_collection.find(team_query, {'_id': 0, 'name': 1, 'created_by': 1, 'created_at': 1}).sort('created_at', -1).limit(5))
        recent_orders = list(orders_collection.find(team_query, {'_id': 0, 'project': 1, 'material': 1, 'created_by': 1, 'created_at': 1}).sort('created_at', -1).limit(5))
        
        return jsonify({
            'team_members': team_members,
            'counts': {
                'projects': projects_count,
                'orders': orders_count,
                'forecasts': forecasts_count,
                'inventory_items': inventory_count
            },
            'recent_activity': {
                'projects': recent_projects,
                'orders': recent_orders
            }
        })
    except Exception as e:
        return jsonify({'error': f'Failed to get team data summary: {str(e)}'}), 500

@app.route('/api/projects/<project_id>/invite-team', methods=['POST'])
@jwt_required()
def invite_team_to_project(project_id):
    """Invite team members to a specific project"""
    data = request.get_json()
    username = get_jwt_identity()
    email = data.get('email')
    role = data.get('role', 'member')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    try:
        # Check if user owns the project
        project = projects_collection.find_one({
            'project_id': project_id,
            'created_by': username
        })
        
        if not project:
            return jsonify({'error': 'Project not found or access denied'}), 404
        
        # Check if user exists
        existing_user = users_collection.find_one({'email': email})
        
        # Generate invitation token
        invitation_token = secrets.token_urlsafe(32)
        
        invitation_data = {
            'invitation_token': invitation_token,
            'project_id': project_id,
            'project_name': project['name'],
            'email': email,
            'role': role,
            'invited_by': username,
            'created_at': datetime.now(timezone.utc),
            'status': 'pending',
            'user_exists': existing_user is not None,
            'type': 'project_invitation'
        }
        
        team_invitations_collection.insert_one(invitation_data)
        
        # Send invitation email
        frontend_url = os.getenv('FRONTEND_BASE_URL', 'http://localhost:5173')
        frontend_url = frontend_url.rstrip('/')
        
        if existing_user:
            invitation_url = f"{frontend_url}/project-invitation?token={invitation_token}"
            subject = f'Project Invitation - {project["name"]}'
        else:
            invitation_url = f"{frontend_url}/register?invite={invitation_token}"
            subject = f'Join Project {project["name"]} - PlanGrid'
        
        msg = Message(
            subject=subject,
            recipients=[email],
            sender=app.config['MAIL_DEFAULT_SENDER']
        )
        
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Project Invitation - PlanGrid</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }}
                .content {{
                    background: #f8fafc;
                    padding: 30px;
                    border-radius: 0 0 8px 8px;
                }}
                .button {{
                    display: inline-block;
                    background: #2563eb;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin: 20px 0;
                    font-weight: bold;
                }}
                .project-info {{
                    background: #e2e8f0;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📁 Project Invitation</h1>
                <p>PlanGrid Material Forecast Portal</p>
            </div>
            
            <div class="content">
                <h2>You've been invited to collaborate on a project!</h2>
                
                <div class="project-info">
                    <h3>Project: {project['name']}</h3>
                    <p><strong>Location:</strong> {project.get('location', 'Not specified')}</p>
                    <p><strong>Status:</strong> {project.get('status', 'Not specified')}</p>
                    <p><strong>Invited by:</strong> {username}</p>
                    {f"<p><strong>Description:</strong> {project.get('description', 'No description provided')}</p>" if project.get('description') else ''}
                </div>
                
                <p>Click the button below to accept the invitation:</p>
                
                <div style="text-align: center;">
                    <a href="{invitation_url}" class="button">Accept Project Invitation</a>
                </div>
                
                <p>Or copy and paste this link:</p>
                <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 4px;">
                    {invitation_url}
                </p>
                
                <p><small>This invitation will expire in 7 days.</small></p>
            </div>
        </body>
        </html>
        """
        
        mail.send(msg)
        
        return jsonify({
            'message': 'Project invitation sent successfully',
            'invitation_token': invitation_token
        }), 201
        
    except Exception as e:
        print(f"Error sending project invitation: {e}")
        return jsonify({'error': 'Failed to send invitation'}), 500

def create_notification(user_id, notification_type, message, data=None):
    """Helper function to create notifications"""
    try:
        notification_data = {
            'user_id': user_id,
            'type': notification_type,
            'message': message,
            'data': data or {},
            'read': False,
            'created_at': datetime.now(timezone.utc)
        }
        
        notifications_collection.insert_one(notification_data)
    except Exception as e:
        print(f"Error creating notification: {e}")

def get_user_teams(username):
    """Get all teams that a user belongs to"""
    try:
        teams = list(teams_collection.find({
            'members.username': username
        }, {'_id': 0}))
        return teams
    except Exception as e:
        print(f"Error getting user teams: {e}")
        return []

def get_team_members_for_user(username):
    """Get all team members from all teams that a user belongs to"""
    try:
        teams = get_user_teams(username)
        all_members = set([username])  # Include the user themselves
        
        for team in teams:
            for member in team.get('members', []):
                all_members.add(member['username'])
        
        return list(all_members)
    except Exception as e:
        print(f"Error getting team members: {e}")
        return [username]  # Fallback to just the user

def get_team_based_query(username):
    """Get MongoDB query for team-based data access"""
    team_members = get_team_members_for_user(username)
    return {'created_by': {'$in': team_members}}

if __name__ == '__main__':
    debug_flag = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', '5000'))
    app.run(debug=debug_flag, host=host, port=port)
