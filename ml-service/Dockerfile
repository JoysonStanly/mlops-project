FROM python:3.11-slim

WORKDIR /app
ENV GIT_PYTHON_REFRESH=quiet

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY pipeline ./pipeline
COPY data ./data
COPY train.py ./train.py
COPY generate_model.py ./generate_model.py

RUN python -m pipeline.data_generator --samples-per-class 250 --out data/dataset.csv
RUN python train.py --dataset data/dataset.csv --output-dir /app/artifacts --model logreg --max-samples 400

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
