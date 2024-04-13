FROM continuumio/miniconda3

WORKDIR /app

# Install necessary system packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libatlas-base-dev \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    curl \
    ufw \  
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/

# Install Python dependencies using pip instead of conda
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 5000

CMD ["python", "server.py"]
