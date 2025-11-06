FROM python:3.11-slim

# Crear directorio de trabajo
WORKDIR /app

# Copiar requisitos
COPY server.py /app/server.py
COPY estructura.json /app/estructura.json
COPY templates /app/templates
COPY static /app/static

# Instalar dependencias
RUN pip install flask

# Puerto expuesto
EXPOSE 3001

# Comando de ejecución
CMD ["python3", "server.py"]
