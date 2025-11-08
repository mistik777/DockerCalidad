#!/bin/bash

# Parar y borrar contenedores que contengan "calidad" en el nombre
docker ps -a --format "{{.Names}}" | grep calidad | while read c; do
  docker stop "$c" 2>/dev/null
  docker rm "$c" 2>/dev/null
done

# Reconstruir y levantar
docker compose build --no-cache
docker compose up -d
