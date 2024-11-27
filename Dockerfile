FROM bitnami/python:3.7

RUN apt-get update && apt-get install -y --no-install-recommends \
    redis-server \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Ajouter un utilisateur non-root
RUN groupadd -g 1001 app && useradd -r -u 1001 -g app app

RUN mkdir /home/app && chown 1001 /home/app
WORKDIR /home/app

COPY src/ src/
COPY requirements.txt ./requirements.txt
RUN chown -R 1001 /home/app

ENV PATH="/home/app/.local/bin:${PATH}"
RUN pip install --upgrade pip && pip install -r ./requirements.txt

# Exposer le port 8080
EXPOSE 8080

# Définir l'utilisateur non-root (décommenter si nécessaire)
# USER 1001

# Commande de démarrage
CMD ["python", "src/manage.py", "runserver", "0.0.0.0:8080", "--noreload"]
