FROM python:3.11-slim

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . /app
WORKDIR /app

EXPOSE 5000
EXPOSE 5001

CMD uvicorn main:app --host 0.0.0.0 --port 5000 & uvicorn linguee_api.api:app --host 0.0.0.0 --port 5001
