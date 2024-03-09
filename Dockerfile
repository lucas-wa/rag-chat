FROM debian

RUN apt-get update

RUN apt-get install -y python3 pip

WORKDIR /code

COPY server/* /code/server/

RUN pip install --no-cache-dir --upgrade -r /code/server/requirements.txt --break-system-packages

RUN pip install huggingface-hub --break-system-packages

COPY entrypoint.sh /code/entrypoint.sh

RUN chmod +x /code/entrypoint.sh

COPY web /code/web/

RUN apt-get install -y curl

RUN curl -fsSL https://deb.nodesource.com/setup_21.x | bash - && apt-get install -y nodejs

RUN cd web && npm install 

RUN cd web && npm run build

WORKDIR /code/server

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "3000"]
