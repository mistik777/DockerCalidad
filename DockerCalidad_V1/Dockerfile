# =====================================================
# Dockerfile — Imagen de DockerCalidad V.1 (Flask)
# =====================================================

# Imagen base ligera de Python
FROM python:3.11-slim

# Variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Directorio de trabajo
WORKDIR /app

# Copiar los archivos del proyecto al contenedor
COPY . /app

# Instalar dependencias necesarias
RUN pip install --no-cache-dir flask

# Exponer el puerto de la aplicación (igual que en V.0)
EXPOSE 3001

# Comando de ejecución
CMD ["python", "run.py"]
