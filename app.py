import os
import shutil
import numpy as np
from uuid import uuid4
from io import BytesIO
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from fastapi.responses import StreamingResponse
from fastapi import FastAPI, UploadFile, File, Response, status
from llama_index.readers import StringIterableReader, PDFReader, SimpleDirectoryReader

import inference

class Message(BaseModel):
  content: str

app = FastAPI()

if not os.path.exists("tmp"):
  os.mkdir("tmp")

@app.post("/retriveal/ingest")
async def store_file(
    file: UploadFile = File(...)
):

  global index

  try:

    id = str(uuid4())
    file_location = f"tmp/{id}"

    if not os.path.exists(file_location):
      os.mkdir(file_location)

    with open(f"{file_location}/{file.filename}",  "wb+") as f:
      shutil.copyfileobj(file.file, f)

    pdf = SimpleDirectoryReader(f"tmp/{id}/").load_data()

    index = VectorStoreIndex.from_documents(pdf)

    return jsonable_encoder({"message": "ok"})

  except Exception as e:

    # response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    return jsonable_encoder({"error": str(e)})

@app.post("/retriveal")
async def inference(
    message: Message
):

    query = message.content

    query_engine = index.as_query_engine()

    inference = query_engine.query(query)

    return inference


def stream_inference(gen):
  for token in gen:
    yield token


@app.post("/retriveal/stream")
async def inference(
    message: Message
):

    query = message.content

    query_engine = index.as_query_engine(streaming=True)

    gen = query_engine.query(query).response_gen

    return StreamingResponse(stream_inference(gen))
