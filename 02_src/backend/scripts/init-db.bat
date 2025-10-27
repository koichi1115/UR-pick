@echo off
REM UR-pick Database Initialization Script for Windows
REM This script initializes the PostgreSQL database for UR-pick

setlocal enabledelayedexpansion

REM Load environment variables from .env file
if exist .env (
    for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
        set "%%a=%%b"
    )
)

REM Default values
if not defined DB_HOST set DB_HOST=localhost
if not defined DB_PORT set DB_PORT=5432
if not defined DB_NAME set DB_NAME=urpick
if not defined DB_USER set DB_USER=postgres

echo ===================================
echo UR-pick Database Initialization
echo ===================================
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo Database: %DB_NAME%
echo User: %DB_USER%
echo ===================================

REM Set PGPASSWORD environment variable for psql
set PGPASSWORD=%DB_PASSWORD%

REM Check if database exists
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -tAc "SELECT 1 FROM pg_database WHERE datname='%DB_NAME%'" > temp_check.txt 2>nul
set /p DB_EXISTS=<temp_check.txt
del temp_check.txt 2>nul

if "%DB_EXISTS%"=="1" (
    echo Database '%DB_NAME%' already exists.
    set /p CONFIRM="Do you want to drop and recreate it? (yes/no): "

    if /i "!CONFIRM!"=="yes" (
        echo Dropping database '%DB_NAME%'...
        psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "DROP DATABASE %DB_NAME%;"
        echo Creating database '%DB_NAME%'...
        psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;"
    ) else (
        echo Skipping database recreation.
    )
) else (
    echo Creating database '%DB_NAME%'...
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "CREATE DATABASE %DB_NAME%;"
)

REM Run schema
echo Running schema.sql...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f schema.sql

echo ===================================
echo Database initialization complete!
echo ===================================

endlocal
pause
