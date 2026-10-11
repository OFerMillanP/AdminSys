@echo off
echo Iniciando tareas...
echo Ejecutando el Administrador de Systemas

cd ~\Documentos\Repositorios\AdminSys

start /b npm run start:all:w & start /b npm run api & start /b run-db.bat

