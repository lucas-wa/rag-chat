import os
from huggingface_hub._login import _login

HF_KEY = os.environ["HF_KEY"]

_login(token=HF_KEY, add_to_git_credential=False)
