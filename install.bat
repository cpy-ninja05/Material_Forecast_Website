@echo off
echo Installing POWERGRID Material Forecasting System...
echo.

echo Setting up Backend...
cd backend
echo Creating virtual environment...
python -m venv venv
echo Activating virtual environment...
call venv\Scripts\activate
echo Installing Python dependencies...
pip install -r requirements.txt
cd ..

echo.
echo Setting up Frontend...
cd frontend
echo Installing Node.js dependencies...
npm install
cd ..

echo.
echo Installation completed!
echo.
echo To start the system, run: start_servers.bat
echo Or manually start:
echo   1. Backend: cd backend ^&^& venv\Scripts\activate ^&^& python app.py
echo   2. Frontend: cd frontend ^&^& npm run dev
echo.
pause
