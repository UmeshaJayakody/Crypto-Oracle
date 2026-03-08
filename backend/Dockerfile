FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/root/.cache/huggingface
ENV TORCH_HOME=/root/.cache/torch
ENV CUDA_VISIBLE_DEVICES=0

RUN apt-get update && apt-get install -y \
    python3.11 python3.11-dev python3-pip \
    build-essential git curl libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN ln -sf /usr/bin/python3.11 /usr/bin/python && \
    ln -sf /usr/bin/pip3 /usr/bin/pip

WORKDIR /app

# Install PyTorch CUDA 12.1 first (largest dependency)
RUN pip install --no-cache-dir \
    torch==2.3.0+cu121 \
    --index-url https://download.pytorch.org/whl/cu121

# Install Chronos-2 (force fresh clone so ChronosBoltConfig / ChronosConfig are up-to-date)
RUN pip install --no-cache-dir --upgrade \
    "chronos-forecasting @ git+https://github.com/amazon-science/chronos-forecasting.git@main"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "2", \
     "--loop", "uvloop"]
