# zwam-wallet-ai

Aplicación full-stack minimal para gestión de wallets y transacciones.

Estructura principal:
- /server : API Node.js + Express + TypeScript + Prisma (Postgres)
- Frontend ya existente con Vite + React (usa la carpeta raíz)

Rápido inicio (con Docker):

1. Copia .env.example a .env y ajusta si es necesario.
2. Ejecuta: docker-compose up --build

El servidor API estará en http://localhost:4000 y el frontend en http://localhost:5000

Migraciones Prisma (si no usas Docker):
- cd server && npx prisma migrate dev --name init

No subas claves en .env al repo. Usa GitHub Secrets para CI.
