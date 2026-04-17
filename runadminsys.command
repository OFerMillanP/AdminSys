#!/bin/zsh
echo "Ejecutando el Administrador de Systemas"

cd /Users/mi39251/Documents/adminsys

python3 api/api.py & npm run start:all
