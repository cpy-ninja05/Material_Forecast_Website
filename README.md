# PLANGRID Material Demand Forecasting Dashboard

A modern, professional, and interactive frontend UI for a Material Demand Forecasting Dashboard built with Vite + React + JavaScript and TailwindCSS. The dashboard focuses on visualizing project-wise and material-wise demand predictions for PLANGRID projects across India.

## 🚀 Features

### Core Features & Pages

#### 📊 Dashboard Overview
- **Total materials demand, upcoming projects, and budget summary**
- **Critical alerts** (shortages, overstocking, cost overruns)
- **Interactive cards, counters, and progress bars**
- **Real-time trend animations** for demand changes
- **Animated counters** with smooth transitions

#### 📈 Material Forecast Visualization
- **Interactive charts** showing forecasted demand trends per material
- **Multiple chart types**: Line, Bar, Donut, Area charts
- **Advanced filtering** by project location, tower type, substation type, and time period
- **Color-coded heatmaps** for high-demand regions
- **Multiple view modes**: Chart, Table, Heatmap views
- **Export functionality** for data analysis

#### 🗺️ Project Map View
- **Interactive map of India** with project locations pinned
- **Clickable markers** showing expected material demand and budget
- **Risk-based color coding** (Green: Low, Yellow: Medium, Red: High)
- **Detailed project popups** with comprehensive information
- **Cluster support** for multiple projects in a region
- **Custom markers** with dynamic styling

#### 📋 Data Tables & Insights
- **Sortable columns** with ascending/descending options
- **Search functionality** across all data
- **Conditional formatting** for critical/high-demand items
- **Responsive design** for desktop and tablet screens
- **Export capabilities** for further analysis

### 🎨 Unique UI Features

#### 🌓 Dark/Light Theme Toggle
- **Seamless theme switching** with smooth transitions
- **Persistent theme preference** stored in localStorage
- **Consistent design** across all components
- **Accessibility-friendly** color schemes

#### 🔍 Advanced Filtering System
- **Sidebar with comprehensive filters** for easy navigation
- **Real-time filter application** with instant results
- **Multiple filter categories**: Location, Tower Type, Substation, Risk Level, Date Range, Material Type
- **Filter persistence** across page navigation

#### 📱 Responsive Design
- **Mobile-first approach** with tablet and desktop optimizations
- **Flexible grid layouts** that adapt to screen sizes
- **Touch-friendly interactions** for mobile devices
- **Optimized performance** across all devices

#### 🎭 Interactive Components
- **Tooltips with detailed info** on charts and maps
- **Smooth animations** and transitions throughout
- **Loading states** with skeleton screens
- **Error handling** with user-friendly messages

## 🛠️ Technical Stack

### Frontend
- **React 19.1.1** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **TailwindCSS 3.3.6** - Utility-first CSS framework
- **ApexCharts** - Advanced charting library
- **React-Leaflet** - Interactive maps
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls

### Backend
- **Flask** - Python web framework
- **SQLite** - Lightweight database
- **JWT** - Authentication and authorization
- **Pandas** - Data manipulation and analysis
- **Joblib** - Model serialization
- **XGBoost** - Machine learning model

### Key Libraries
- **react-apexcharts** - React wrapper for ApexCharts
- **react-leaflet** - React components for Leaflet maps
- **react-router-dom** - Client-side routing
- **clsx** - Conditional className utility

## 📁 Project Structure

```
Material_Forecast_Website/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # Reusable UI components
│   │   │   │   ├── AnimatedCounter.jsx
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── FilterSidebar.jsx
│   │   │   │   ├── InteractiveChart.jsx
│   │   │   │   ├── MetricCard.jsx
│   │   │   │   └── ThemeToggle.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── Dashboard.jsx          # Enhanced dashboard
│   │   │   ├── ForecastingPage.jsx
│   │   │   ├── MaterialsPage.jsx      # Material visualization
│   │   │   ├── MapView.jsx            # Interactive map
│   │   │   └── Navigation.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx       # Theme management
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
├── backend/
│   ├── app.py                         # Enhanced Flask API
│   ├── requirements.txt
│   └── users.db
├── *.joblib                          # ML models and encoders
├── *.csv                            # Dataset
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Material_Forecast_Website
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   python app.py
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## 📊 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Analytics
- `GET /api/analytics/overview` - Dashboard overview data
- `GET /api/analytics/materials` - Material consumption trends
- `GET /api/analytics/projects` - Project details
- `GET /api/analytics/forecast-trends` - Forecast trends for next 6 months
- `GET /api/analytics/map-data` - Project locations for map
- `GET /api/analytics/material-insights` - Material consumption insights

### Forecasting
- `POST /api/forecast` - Generate material demand forecast

### Health Check
- `GET /api/health` - API health status

## 🎯 Key Features Implementation

### Real-time Animations
- **Animated counters** with easing functions
- **Smooth chart transitions** with ApexCharts animations
- **Loading states** with skeleton screens
- **Hover effects** and micro-interactions

### Interactive Charts
- **Multiple chart types**: Line, Bar, Donut, Area
- **Zoom and pan** functionality
- **Tooltip customization** with detailed information
- **Legend management** with show/hide options
- **Export capabilities** (PNG, SVG, PDF)

### Advanced Filtering
- **Multi-criteria filtering** with real-time updates
- **Filter persistence** across page navigation
- **Reset functionality** for quick filter clearing
- **Visual filter indicators** showing active filters

### Map Integration
- **Interactive India map** with project markers
- **Custom marker styling** based on risk levels
- **Popup information** with project details
- **Zoom controls** and map navigation
- **Responsive map sizing** for different screen sizes

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Info**: Blue (#3B82F6)
- **Purple**: Violet (#8B5CF6)

### Typography
- **Font Family**: Inter (system font stack)
- **Headings**: Bold weights (600, 700)
- **Body**: Regular weight (400)
- **Captions**: Medium weight (500)

### Spacing
- **Consistent spacing** using Tailwind's spacing scale
- **Responsive margins** and padding
- **Grid gaps** for consistent layouts

## 🔧 Customization

### Adding New Chart Types
1. Extend the `InteractiveChart` component
2. Add new chart configurations in `getDefaultOptions()`
3. Update the chart type prop handling

### Adding New Filters
1. Update the `FilterSidebar` component
2. Add new filter options to the state
3. Implement filter logic in the parent components

### Customizing Themes
1. Modify the `ThemeContext` for additional theme options
2. Update Tailwind config for custom color schemes
3. Add theme-specific component variants

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🚀 Performance Optimizations

- **Code splitting** with React.lazy()
- **Memoization** with React.memo()
- **Efficient re-renders** with useMemo and useCallback
- **Optimized bundle size** with Vite
- **Lazy loading** for map components

## 🔒 Security Features

- **JWT authentication** with secure token handling
- **Protected routes** with authentication checks
- **Input validation** on both frontend and backend
- **CORS configuration** for secure API access

## 📈 Future Enhancements

- **Real-time data updates** with WebSocket integration
- **Advanced forecasting models** with more ML algorithms
- **Mobile app** with React Native
- **Advanced analytics** with more detailed insights
- **Integration** with external APIs for real-time data
- **Advanced reporting** with PDF generation
- **Collaboration features** for team management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **PLANGRID Corporation** for the project requirements
- **React community** for excellent documentation
- **TailwindCSS** for the utility-first CSS framework
- **ApexCharts** for beautiful charting capabilities
- **Leaflet** for interactive mapping features

---

**Built with ❤️ for PLANGRID Material Demand Forecasting**

