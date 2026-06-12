# Database

This folder contains the MySQL/MariaDB database for the Training Management System.

## Import

Using MySQL CLI:

```bash
mysql -u root -p < database/training_management_system.mysql.sql
```

Using phpMyAdmin or MySQL Workbench:

1. Open `database/training_management_system.mysql.sql`.
2. Run/import the full script.
3. The script creates the database `training_management_system`.

## Tables

- `Filiere`
- `Groupe`
- `AnneeScolaire`
- `Formateur`
- `Module`
- `Stagiaire`
- `Affectation`
- `Presence`
- `Note`

The script includes primary keys, foreign keys, useful indexes, uniqueness rules, attendance status validation, note range validation, and seed data matching the frontend mock API.

## Backend Connection Example

Use this connection string in a backend `.env` file:

```bash
DATABASE_URL=mysql://root:password@localhost:3306/training_management_system
```

When your backend is ready, set the frontend `.env` to:

```bash
VITE_USE_MOCK_API=false
VITE_API_URL=http://localhost:8080/api
```
