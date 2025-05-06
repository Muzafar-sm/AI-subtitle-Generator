@echo off
echo Fixing Node.js PATH...

:: Get the nvm root directory
for /f "tokens=*" %%i in ('nvm root') do set NVM_ROOT=%%i

:: Set the correct Node.js version
set NODE_VERSION=18.17.0

:: Update PATH
set PATH=%NVM_ROOT%\%NODE_VERSION%;%PATH%

:: Verify the change
echo Current Node.js version:
node -v

echo.
echo If the version is still incorrect, please:
echo 1. Close all terminal windows
echo 2. Run this batch file again
echo 3. Open a new terminal and try 'node -v'
pause 