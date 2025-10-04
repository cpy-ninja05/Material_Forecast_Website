# Material Forecast Backend Setup

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Installation guide](https://docs.mongodb.com/manual/installation/)

### Installation & Setup

1. **Install MongoDB**
   ```bash
   # On macOS with Homebrew
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   
   # On Ubuntu
   sudo apt-get install mongodb
   sudo systemctl start mongod
   
   # On Windows
   # Download from https://www.mongodb.com/try/download/community
   # Run installer and start MongoDB service
   ```

2. **Start the Backend**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Install dependencies
   npm install
   
   # Start the server
   npm start
   
   # Or use the startup script
   # On Windows: double-click start.bat
   # On macOS/Linux: ./start.sh
   ```

3. **Verify Setup**
   - Backend will run on: `http://localhost:5000`
   - MongoDB connection: `mongodb://localhost:27017/PLANGRID_DATA/material_forecast`
   - Sample data will be automatically created on first run

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create new supplier
- `POST /api/suppliers/invite` - Invite supplier
- `PUT /api/suppliers/:id/status` - Update supplier status

### Materials
- `GET /api/materials` - Get all materials
- `POST /api/materials` - Create new material

### Forecasting
- `POST /api/forecast` - Generate material forecast

### Analytics
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/materials` - Material analytics
- `GET /api/analytics/projects` - Project analytics

## 🗄️ Database Schema

### Projects
```javascript
{
  name: String,
  description: String,
  location: String,
  towerType: String,
  budget: Number,
  actualCost: Number,
  priority: String, // Low, Medium, High, Critical
  status: String,   // Planning, In Progress, On Hold, Completed, Cancelled
  startDate: Date,
  endDate: Date,
  progress: Number, // 0-100
  assignedTeam: [String],
  materials: [String],
  suppliers: [String],
  milestones: [Object]
}
```

### Suppliers
```javascript
{
  companyName: String,
  contactName: String,
  email: String,
  phone: String,
  address: String,
  category: String,
  specialties: [String],
  website: String,
  status: String, // Active, Pending, Suspended, Verified
  rating: Number, // 0-5
  projectsCompleted: Number,
  totalValue: Number,
  certifications: [String]
}
```

### Materials
```javascript
{
  name: String,
  category: String,
  unit: String,
  predictedQty: Number,
  currentStock: Number,
  suggestedOrder: Number,
  vendor: String,
  priority: String // Low, Medium, High
}
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/material_forecast
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### MongoDB Connection
The app connects to MongoDB at `mongodb://localhost:27017/PLANGRID_DATA/material_forecast` by default.

## 📈 Sample Data

The backend automatically creates sample data on first run:
- 2 sample projects
- 6 sample materials
- 2 sample suppliers

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
# On macOS/Linux
ps aux | grep mongod

# On Windows
tasklist | findstr mongod

# Start MongoDB if not running
# On macOS
brew services start mongodb-community

# On Ubuntu
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### Port Already in Use
```bash
# Kill process using port 5000
# On macOS/Linux
lsof -ti:5000 | xargs kill -9

# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Dependencies Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Set up proper JWT secrets
4. Configure CORS for your domain
5. Use PM2 for process management

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start app.js --name "material-forecast-api"
pm2 save
pm2 startup
```

## 📝 Development

### Adding New Endpoints
1. Define schema in `app.js`
2. Add route handler
3. Test with Postman or frontend
4. Update this README

### Database Migrations
For schema changes, create migration scripts in a `migrations/` folder.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.




