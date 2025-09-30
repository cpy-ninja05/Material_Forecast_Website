from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime, timedelta
from pymongo import MongoClient, errors

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'powergrid-secret-key-2025'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)
CORS(app)

# Initialize MongoDB
def init_db():
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
    db_name = os.getenv('MONGO_DB', 'material_forecast')

    client = MongoClient(mongo_uri)
    db = client[db_name]

    users_collection = db['users']

    # Ensure unique indexes for username and email
    try:
        users_collection.create_index('username', unique=True)
        users_collection.create_index('email', unique=True)
    except errors.PyMongoError as e:
        print(f"Error creating indexes: {e}")

    return client, db, users_collection

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
client, db, users_collection = init_db()
model, feature_cols, target_cols, label_encoders = load_models()
df = load_data()

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
            'created_at': datetime.utcnow()
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

# Analytics routes
@app.route('/api/analytics/overview', methods=['GET'])
@jwt_required()
def analytics_overview():
    if df is None:
        return jsonify({'error': 'Data not available'}), 500
    
    # Basic statistics
    total_projects = int(df['project_id'].nunique())
    total_budget = float(df.groupby('project_id')['budget'].first().sum())
    avg_budget = float(df.groupby('project_id')['budget'].first().mean())
    
    # Material totals
    material_totals = {}
    for col in target_cols:
        material_totals[col] = float(df[col].sum())
    
    # Project distribution by location
    location_dist = df.groupby('project_id')['project_location'].first().value_counts().to_dict()
    location_dist = {str(k): int(v) for k, v in location_dist.items()}
    
    # Risk distribution
    risk_dist = df.groupby('project_id')['region_risk_flag'].first().value_counts().to_dict()
    risk_dist = {str(k): int(v) for k, v in risk_dist.items()}
    
    return jsonify({
        'total_projects': total_projects,
        'total_budget': total_budget,
        'avg_budget': avg_budget,
        'material_totals': material_totals,
        'location_distribution': location_dist,
        'risk_distribution': risk_dist
    })

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
        now = datetime.utcnow()
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

# Forecasting route
@app.route('/api/forecast', methods=['POST'])
@jwt_required()
def forecast():
    if model is None or feature_cols is None or target_cols is None or label_encoders is None:
        return jsonify({'error': 'Model not available'}), 500
    
    data = request.get_json()
    
    # Prepare input data
    input_data = {}
    for col in feature_cols:
        if col in data:
            input_data[col] = data[col]
        else:
            # Use default values for missing fields
            if col == 'budget':
                input_data[col] = 30000000
            elif col == 'tax_rate':
                input_data[col] = 18
            elif col == 'project_size_km':
                input_data[col] = 100
            elif col == 'project_start_month':
                input_data[col] = 1
            elif col == 'project_end_month':
                input_data[col] = 12
            elif col == 'lead_time_days':
                input_data[col] = 45
            elif col == 'commodity_price_index':
                input_data[col] = 105
            else:
                input_data[col] = 0
    
    # Encode categorical variables
    for col in ['project_location', 'tower_type', 'substation_type', 'region_risk_flag']:
        if col in input_data and col in label_encoders:
            try:
                input_data[col] = label_encoders[col].transform([input_data[col]])[0]
            except:
                input_data[col] = 0
    
    # Create DataFrame
    input_df = pd.DataFrame([input_data])
    
    # Make prediction
    try:
        predictions = model.predict(input_df[feature_cols])
        
        # Format results
        results = {}
        for i, col in enumerate(target_cols):
            results[col] = float(predictions[0][i])
        
        return jsonify({
            'predictions': results,
            'input_used': input_data
        })
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
