# Training Management System Frontend

Production-ready Vite + React 18 + TypeScript frontend for managing training programs, groups, school years, trainers, modules, trainees, assignments, attendance, and grades.

## Stack

- Vite, React 18, TypeScript
- TailwindCSS with shadcn/ui-style components
- React Router v6
- Axios with mock REST adapter
- TanStack Query
- React Hook Form + Zod
- Lucide React, Sonner, Recharts

## Run

```bash
npm install
npm run dev
```

The app uses `.env`:

```bash
VITE_API_URL=http://localhost:8080/api
VITE_USE_MOCK_API=true
```

Set `VITE_USE_MOCK_API=false` when a real backend is available.

## Database

An importable MySQL/MariaDB database script is available at:

```bash
database/training_management_system.mysql.sql
```

Import it with:

```bash
mysql -u root -p < database/training_management_system.mysql.sql
```
