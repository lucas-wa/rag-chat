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

ngrok config add-authtoken $NGROK_KEY

cd /code/server &&
uvicorn app:app --host 0.0.0.0 --port $SERVER_PORT &
export NEXT_PUBLIC_API_URL="http://localhost:{$SERVER_PORT}" &&
cd /code/web &&
yarn build && 
yarn start &
ngrok http 8080

# Inicie o seu aplicativo
# exec "$@"
