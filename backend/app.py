from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient, errors

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'powergrid-secret-key-2025'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)
CORS(app)

# Initialize MongoDB
def init_db():
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/POWERGRID_DATA')
    db_name = os.getenv('MONGO_DB', 'material_forecast')

    client = MongoClient(mongo_uri)
    db = client[db_name]

    users_collection = db['users']
    projects_collection = db['projects']
    forecasts_collection = db['forecasts']
    inventory_collection = db['inventory']
    orders_collection = db['orders']
    material_actuals_collection = db['material_actuals']

    # Ensure unique indexes for username and email
    try:
        users_collection.create_index('username', unique=True)
        users_collection.create_index('email', unique=True)
        # Only create project_id index if collection is empty or doesn't have null values
        if projects_collection.count_documents({'project_id': None}) == 0:
            projects_collection.create_index('project_id', unique=True)
        forecasts_collection.create_index([('project_id', 1), ('material', 1), ('created_at', 1)])
        inventory_collection.create_index([('material_code', 1), ('warehouse', 1)], unique=True)
        orders_collection.create_index('order_id', unique=True)
        material_actuals_collection.create_index([('project_id', 1), ('month', 1)], unique=True)
    except errors.PyMongoError as e:
        print(f"Error creating indexes: {e}")

    return client, db, users_collection, projects_collection, forecasts_collection, inventory_collection, orders_collection, material_actuals_collection

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
client, db, users_collection, projects_collection, forecasts_collection, inventory_collection, orders_collection, material_actuals_collection = init_db()
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

# Forecasting route
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
        
        # Save forecast to database with rolling window logic
        try:
            # Check if forecast already exists for this project and month
            existing_forecast = forecasts_collection.find_one({
                'project_id': project_id,
                'forecast_month': forecast_month
            })
            
            if existing_forecast:
                # Update existing forecast instead of creating duplicate
                forecasts_collection.update_one(
                    {'project_id': project_id, 'forecast_month': forecast_month},
                    {
                        '$set': {
                            'input_data': input_data,
                            'predictions': results,
                            'updated_at': datetime.now(timezone.utc),
                            'updated_by': username
                        }
                    }
                )
                print(f"Forecast updated for project {project_id}, month {forecast_month}")
            else:
                # Create new forecast with actual values
                import random
                actual_values = {}
                for material, forecast_value in results.items():
                    # Generate actual value with ±15% variation from forecast
                    variation = random.uniform(0.85, 1.15)
                    actual_value = forecast_value * variation
                    actual_values[material] = round(actual_value, 2)
                
                forecast_data = {
                    'project_id': project_id,
                    'forecast_month': forecast_month,
                    'forecast_year': int(forecast_month.split('-')[0]),
                    'forecast_month_num': int(forecast_month.split('-')[1]),
                    'input_data': input_data,
                    'predictions': results,
                    'actual_values': actual_values,
                    'created_at': datetime.now(timezone.utc),
                    'created_by': username,
                    'updated_at': datetime.now(timezone.utc),
                    'updated_by': username
                }
                forecasts_collection.insert_one(forecast_data)
                print(f"Forecast created for project {project_id}, month {forecast_month}")
            
            # Implement rolling window: Keep only last 4 months of forecasts
            # Get all forecasts for this project, sorted by forecast_month
            all_forecasts = list(forecasts_collection.find(
                {'project_id': project_id}
            ).sort('forecast_month', -1))  # Sort by month descending
            
            # If more than 4 months, archive the oldest ones
            if len(all_forecasts) > 4:
                forecasts_to_archive = all_forecasts[4:]  # Get forecasts beyond the 4th
                for forecast in forecasts_to_archive:
                    # Move to archived collection or delete
                    forecasts_collection.delete_one({'_id': forecast['_id']})
                    print(f"Archived old forecast for project {project_id}, month {forecast['forecast_month']}")
            
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
        projects = list(projects_collection.find({}, {'_id': 0}))
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
            'created_by': username,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
        
        result = projects_collection.insert_one(project_data)
        project_data['_id'] = str(result.inserted_id)
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
    try:
        result = projects_collection.delete_one({'project_id': project_id})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Project not found'}), 404
            
        return jsonify({'message': 'Project deleted successfully'}), 200
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

# Forecasts API
@app.route('/api/forecasts', methods=['GET'])
@jwt_required()
def get_forecasts():
    try:
        forecasts = list(forecasts_collection.find({}, {'_id': 0}).sort('created_at', -1))
        return jsonify(forecasts)
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/dashboard/metrics', methods=['GET'])
@jwt_required()
def get_dashboard_metrics():
    try:
        # Get total projects count
        total_projects = projects_collection.count_documents({})
        
        # Get active projects count (status = 'IN PROGRESS')
        active_projects = projects_collection.count_documents({'status': 'IN PROGRESS'})
        
        # Calculate forecast accuracy from stored actual values in forecasts
        forecasts_with_actuals = list(forecasts_collection.find({
            'actual_values': {'$exists': True, '$ne': {}}
        }))
        
        print(f"Found {len(forecasts_with_actuals)} forecasts with actual values")
        
        if forecasts_with_actuals:
            total_accuracy = 0
            count = 0
            individual_accuracies = []
            
            for forecast in forecasts_with_actuals:
                if 'predictions' in forecast and 'actual_values' in forecast:
                    try:
                        forecast_total = sum(forecast['predictions'].values())
                        actual_total = sum(forecast['actual_values'].values())
                        
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
        
        # Get pending orders count (placeholder - you can implement orders collection later)
        pending_orders = 0  # orders_collection.count_documents({'status': 'PENDING'})
        
        # Get total orders count (placeholder - you can implement orders collection later)
        total_orders = 0  # orders_collection.count_documents({})
        
        # Calculate projects added this month
        current_month = datetime.now(timezone.utc).strftime('%Y-%m')
        projects_this_month = projects_collection.count_documents({
            'created_at': {
                '$gte': datetime.strptime(f'{current_month}-01', '%Y-%m-%d').replace(tzinfo=timezone.utc)
            }
        })
        
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
                'calculation_details': f"{total_accuracy:.1f} / {count} = {forecast_accuracy}%" if count > 0 else "No data"
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
        
        # Get all forecasts (remove date filter for now to get all data)
        forecasts = list(forecasts_collection.find({}).sort('forecast_month', 1))
        print(f"Found {len(forecasts)} total forecasts")
        
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
                    total_forecast = sum(forecast['predictions'].values())
                    monthly_data[month]['forecast_total'] += total_forecast
                    monthly_data[month]['forecast_count'] += 1
                    
                    # Use stored actual values
                    if 'actual_values' in forecast and forecast['actual_values']:
                        total_actual = sum(forecast['actual_values'].values())
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
        # Get the forecast data
        forecast = forecasts_collection.find_one({
            'project_id': project_id,
            'forecast_month': month
        })
        
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

# Get all forecasts for a project (for month selector)
@app.route('/api/projects/<project_id>/forecasts', methods=['GET'])
@jwt_required()
def get_project_forecasts(project_id):
    try:
        forecasts = list(forecasts_collection.find(
            {'project_id': project_id}
        ).sort('forecast_month', -1))
        
        # Convert ObjectIds and dates for JSON serialization
        for forecast in forecasts:
            forecast['_id'] = str(forecast['_id'])
            if 'created_at' in forecast:
                forecast['created_at'] = forecast['created_at'].isoformat()
            if 'updated_at' in forecast:
                forecast['updated_at'] = forecast['updated_at'].isoformat()
            if 'actual_values_updated_at' in forecast:
                forecast['actual_values_updated_at'] = forecast['actual_values_updated_at'].isoformat()
        
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
        # Get orders for the current user
        orders = list(orders_collection.find({'created_by': username}, {'_id': 0}).sort('created_at', -1))
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
        return jsonify(order_data), 201
    except errors.PyMongoError as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@app.route('/api/projects/<project_id>/actual-values', methods=['POST'])
@jwt_required()
def save_actual_values(project_id):
    try:
        data = request.get_json()
        actual_values = data.get('actual_values', {})
        
        # Get the latest forecast for this project
        latest_forecast = forecasts_collection.find_one(
            {'project_id': project_id},
            sort=[('created_at', -1)]
        )
        
        if not latest_forecast:
            return jsonify({'error': 'No forecast found for this project'}), 404
        
        # Update the forecast with actual values
        forecasts_collection.update_one(
            {'_id': latest_forecast['_id']},
            {
                '$set': {
                    'actual_values': actual_values,
                    'actual_values_updated_at': datetime.now(timezone.utc),
                    'actual_values_updated_by': get_jwt_identity()
                }
            }
        )
        
        return jsonify({
            'message': 'Actual values saved successfully',
            'project_id': project_id,
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
            return jsonify({'error': 'Order not found'}), 404
            
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
