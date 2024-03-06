import logging
import sys
from IPython.display import Markdown, display
import torch
from llama_index.llms.huggingface import HuggingFaceLLM
from llama_index.prompts import PromptTemplate
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

from llama_index import (
    ServiceContext,
    set_global_service_context,
)

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler(stream=sys.stdout))


# Model names (make sure you have access on HF)
LLAMA2_7B = "meta-llama/Llama-2-7b-hf"
LLAMA2_7B_CHAT = "meta-llama/Llama-2-7b-chat-hf"
LLAMA2_13B = "meta-llama/Llama-2-13b-hf"
LLAMA2_13B_CHAT = "meta-llama/Llama-2-13b-chat-hf"
LLAMA2_70B = "meta-llama/Llama-2-70b-hf"
LLAMA2_70B_CHAT = "meta-llama/Llama-2-70b-chat-hf"

selected_model = LLAMA2_7B_CHAT

SYSTEM_PROMPT = """Você é um assistente de IA que responde a perguntas de maneira amigável, com base nos documentos fornecidos. Aqui estão algumas regras que você sempre segue:
- Gerar saídas legíveis para humanos, evitando criar texto sem sentido.
- Gerar apenas a saída solicitada, sem incluir qualquer outro idioma antes ou depois da saída solicitada.
- Nunca agradecer, expressar felicidade em ajudar, mencionar que é um agente de IA, etc. Apenas responda diretamente.
- Gerar linguagem profissional geralmente usada em documentos comerciais na América do Norte.
- Nunca gerar linguagem ofensiva ou obscena.
- Traduza as suas respostas sempre para Português Brasileiro. Nunca responsa nada em inglês.
"""

query_wrapper_prompt = PromptTemplate(
    "[INST]<<SYS>>\n" + SYSTEM_PROMPT + "<</SYS>>\n\n{query_str}[/INST] "
)

llm = HuggingFaceLLM(
    context_window=4096,
    max_new_tokens=2048,
    generate_kwargs={"temperature": 0.0, "do_sample": False},
    query_wrapper_prompt=query_wrapper_prompt,
    tokenizer_name=selected_model,
    model_name=selected_model,
    device_map="auto",
    # change these settings below depending on your GPU
    # model_kwargs={"torch_dtype": torch.float16, "load_in_8bit": True},
)


embed_model = HuggingFaceEmbedding(model_name="neuralmind/bert-base-portuguese-cased")
# embed_model = FlagModel("BAAI/bge-m3")

service_context = ServiceContext.from_defaults(llm=llm, embed_model=embed_model)

set_global_service_context(service_context)
