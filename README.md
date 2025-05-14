
# Sistema CMPC - Documentación

![Docker](https://img.shields.io/badge/Docker-3.8-blue)
![Node.js](https://img.shields.io/badge/Node.js-20.18-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-purple)


---

## Instalación

### Requisitos Mínimos
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM mínimo
- 5GB de espacio en disco

### Pasos Rápidos

git clone https://github.com/tu-repositorio/CMPC.git
- cd CMPC
- docker-compose up -d --build


```mermaid
graph TD
    A[Frontend: React] -->|HTTP| B[Nginx]
    B -->|Proxy| C[Backend: Node.js]
    C -->|SQL| D[(PostgreSQL)]
    C -->|Files| E[(Volumen uploads)]
```


```
CMPC/
├── backend/            # Backend Node.js + Express
│   ├── src/            # Controladores, rutas y modelos
│   ├── Dockerfile      # Configuración para producción
│   └── package.json    # Dependencias y scripts
├── frontend/           # Frontend React
│   ├── public/         # Íconos, index.html
│   ├── src/            # Componentes y páginas
│   └── Dockerfile      # Configuración multi-stage
├── docker-compose.yml  # Servicios: app, db, nginx
└── README.md           # Esta documentación
```

> **Nota**: Esta estructura sigue el estándar para aplicaciones Dockerizadas con frontend y backend separados.

