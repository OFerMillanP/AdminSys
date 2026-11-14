@echo off
setlocal

where pg_dump >nul 2>nul
if errorlevel 1 (
    echo Error: pg_dump no esta disponible en PATH.
    exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
    echo Error: Node.js no esta disponible en PATH.
    exit /b 1
)

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format dd-MM-yyyy_HH-mm-ss"') do set "TIMESTAMP=%%I"
if not defined TIMESTAMP (
    echo Error: no se pudo generar la fecha y hora del backup.
    exit /b 1
)

set "BACKUP_DIR=%USERPROFILE%\Documents\Respaldos DB"
if not exist "%BACKUP_DIR%\" mkdir "%BACKUP_DIR%"
if errorlevel 1 (
    echo Error: no se pudo acceder a la carpeta Documentos.
    exit /b 1
)

set "BACKUP_FILE=%BACKUP_DIR%\AdminSys_%TIMESTAMP%.sql"

node -e "const pool=require(process.argv[1]);const{spawnSync}=require('child_process');const result=spawnSync('pg_dump',['--host='+pool.options.host,'--port='+pool.options.port,'--username='+pool.options.user,'--format=plain','--file='+process.argv[2],pool.options.database],{env:{...process.env,PGPASSWORD:pool.options.password},stdio:'inherit'});if(result.error){console.error(result.error.message);process.exit(1)}process.exit(result.status===null?1:result.status)" "%~dp0api\database\db.js" "%BACKUP_FILE%"
if errorlevel 1 (
    echo Error: fallo la creacion del backup.
    exit /b 1
)

echo Backup creado: "%BACKUP_FILE%"
exit /b 0
