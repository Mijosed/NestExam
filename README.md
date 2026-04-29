## Prérequis

- Node.js 20+
- Docker

## Comment lancer le projet

### 1. Backend

```bash
cd backend
npm install
```

Copie `.env.copy` en `.env` :

```bash
cp .env.copy .env
```

Lance la base de données :

```bash
docker compose up -d
```

Applique les migrations :

```bash
npx prisma migrate dev
```

Lance le seed (données de test) :

```bash
npx prisma db seed
```

Démarre le serveur :

```bash
npm run start:dev
```

Le backend tourne sur `http://localhost:3000`.
La doc Swagger est disponible sur `http://localhost:3000/api`.

## Comptes de test

| Email | Username | Mot de passe | Rôle |
|---|---|---|---|
| user@test.fr | user | test1234 | USER |
| admin@test.fr | admin | test1234 | ADMIN |
| user1@test.fr | user1 | test1234 | USER |

