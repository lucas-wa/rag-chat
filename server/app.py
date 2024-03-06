import os
import shutil
import shutil
import numpy as np
from uuid import uuid4
from io import BytesIO
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.encoders import jsonable_encoder
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, Response, status
from llama_index.readers import StringIterableReader, PDFReader, SimpleDirectoryReader
from llama_index import (
    VectorStoreIndex,
    ServiceContext,
    set_global_service_context,
)
# from pyngrok import ngrok
import inference


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
  content: str

if not os.path.exists("tmp"):
  os.mkdir("tmp")

vector_stores = {}

@app.post("/retriveal/ingest")
async def store_file(
    file: UploadFile = File(...)
):

  try:

    print(file.filename)
    id = str(uuid4())
    file_location = f"tmp/{id}"

    if not os.path.exists(file_location):
      os.mkdir(file_location)

    with open(f"{file_location}/{file.filename}",  "wb+") as f:
      shutil.copyfileobj(file.file, f)

    pdf = SimpleDirectoryReader(f"tmp/{id}").load_data()

    vector_stores[id] = VectorStoreIndex.from_documents(pdf)

    return jsonable_encoder({"uuid": id})

  except Exception as e:

    # response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    return jsonable_encoder({"error": str(e)})

@app.post("/retriveal/ingest/{id}")
async def store_file_with_id(
    id,
    file: UploadFile = File(...)
):

  try:

    print(file.filename)

    if(id == None or id == ""):
      raise Exception("Id is required")

    file_location = f"tmp/{id}"

    if not os.path.exists(file_location):
      os.mkdir(file_location)

    with open(f"{file_location}/{file.filename}",  "wb+") as f:
      shutil.copyfileobj(file.file, f)

    pdf = SimpleDirectoryReader(f"tmp/{id}").load_data()

    vector_stores[id] = VectorStoreIndex.from_documents(pdf)

    return jsonable_encoder({"uuid": id})

  except Exception as e:

    # response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    return jsonable_encoder({"error": str(e)})

@app.delete("/session/{id}")
async def delete_session(id):
  try:
    shutil.rmtree(f"tmp/{id}")
    return jsonable_encoder({"message": "ok"})
  except Exception as e:
    return jsonable_encoder({"error": str(e)})

@app.post("/retriveal/{id}")
async def inference(
    id,
    message: Message
):

    if(id == None or id == ""):
      raise Exception("Id is required")

    query = message.content

    query_engine = vector_stores[id].as_query_engine()

    inference = query_engine.query(query)

    return inference


def stream_inference(gen):
  for token in gen:
    yield token


@app.post("/retriveal/stream/{id}")
async def inference(
    id,
    message: Message
):

    if(id == None or id == ""):
      raise Exception("Id is required")

    query = message.content

    query_engine = vector_stores[id].as_query_engine(streaming=True)

    gen = query_engine.query(query).response_gen

    return StreamingResponse(stream_inference(gen))

app.mount("/", StaticFiles(directory="static", html = True), name="static")
