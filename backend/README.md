# Backend for my-react-app

Simple Express backend using PostgreSQL for items and a file upload endpoint.

Setup & Run:


1. Ensure PostgreSQL is running and create a database (example):

```bash
createdb myapp
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp
```

2. Install and start the backend:

```bash
cd backend
npm install
npm run dev   # or `npm run start` for production
```

Endpoints:
- `GET /api/items` - list items
- `POST /api/items` - create item; JSON `{ title, description }`
- `POST /api/upload` - upload file form field `file`

The DB table `items` is created automatically on first run.
