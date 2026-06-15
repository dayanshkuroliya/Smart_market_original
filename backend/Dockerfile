FROM python:3.11

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 1. Ek system user banao jiska naam 'appuser' hai
RUN useradd -m appuser

# 2. /app folder ka ownership 'appuser' ko de do taaki woh files read/write kar sake
RUN chown -R appuser:appuser /app

# 3. Root user se switch karke 'appuser' par aao
USER appuser

# Ab uvicorn bina root permissions ke run hoga (Super Secure)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]