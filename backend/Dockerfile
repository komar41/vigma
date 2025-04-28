FROM python:3.11
COPY . /app/backend
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=8000
ENV FLASK_APP=server.py
EXPOSE 8000
CMD ["python", "server.py"]
