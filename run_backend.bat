@echo off
cd backend
if exist "..\.venv\Scripts\python.exe" (
    echo Using root .venv...
    ..\.venv\Scripts\python manage.py runserver
) else if exist "venv\Scripts\python.exe" (
    echo Using backend venv...
    venv\Scripts\python manage.py runserver
) else (
    echo Virtual environment not found!
    echo Please create one or check paths.
    pause
)
