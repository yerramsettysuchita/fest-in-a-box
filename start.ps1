# Fest-in-a-Box Launcher
Write-Host "🚀 Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\DELL\Downloads\fest-in-a-box\backend'; .\venv\Scripts\activate; uvicorn main:app --reload --port 8000"
Write-Host "⏳ Waiting for backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "🎨 Starting Frontend..." -ForegroundColor Green
cd 'C:\Users\DELL\Downloads\fest-in-a-box\frontend'
npm run dev
