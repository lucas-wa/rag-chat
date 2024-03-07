#!/bin/bash

# Verifique o token
python3 /code/server/check_token.py $HF_TOKEN
# python3 /code/server/ngrok_config.py $NGROK_TOKEN


# Verifique o status de saída
if [ $? -eq 0 ]; then
    echo "Login bem-sucedido!"
else    
    echo "Falha no login."
    exit 1
fi

# Inicie o seu aplicativo
# exec "$@"
