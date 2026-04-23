# Document Versioning System

A full-stack web application for managing documents and their versions, with role-based access control and audit logging.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.3.5, Spring Data JPA |
| Frontend | React, Vite |
| Database | MySQL 9.6 (Docker) |

## Features

- **Authentication** — Login and registration with hashed passwords
- **Document Management** — Create, view, and delete documents
- **Version Control** — Create versions, approve, reject, or restore them
- **Role-Based Access** — Four roles with different permissions
- **User Management** — Admins can create, delete, and change roles of users
- **Audit Logging** — All actions are logged
- **Profile & Settings** — Update profile info and change password

## Roles

| Role | Permissions |
|------|-------------|
| `ADMIN` | Full access — manages users, documents, and versions |
| `AUTHOR` | Creates and manages their own documents and versions |
| `REVIEWER` | Approves or rejects versions |
| `READER` | View-only access |

## Prerequisites

- Java 17+
- Maven
- Node.js 18+
- Docker (for MySQL)

## Getting Started

### 1. Start the Database

Make sure the MySQL Docker container is running:

```bash
docker run --name mysql-local -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=docvcs_db -p 3307:3306 -d mysql:9.6
```

If you already have it running:

```bash
docker start mysql-local
```

### 2. Run the Backend

```bash
cd document-versioning
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

On first startup, a default admin account is created automatically:

| Username | Password |
|----------|----------|
| `admin` | `admin123` |

### 3. Run the Frontend

```bash
cd my-app
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
demo-repository/
├── document-versioning/        # Spring Boot backend
│   └── src/main/java/com/docvcs/
│       ├── controler/          # REST controllers
│       ├── service/            # Business logic
│       ├── repository/         # JPA repositories
│       ├── model/              # Entity classes
│       └── dto/                # Request/response objects
└── my-app/                     # React frontend
    └── src/
        ├── pages/              # Page components
        ├── components/         # Shared components
        └── services/           # API calls
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/register` | Register |
| `GET` | `/api/documents` | List documents |
| `POST` | `/api/documents` | Create document |
| `DELETE` | `/api/documents/{id}` | Delete document |
| `POST` | `/api/documents/{id}/versions` | Create version |
| `POST` | `/api/documents/{id}/versions/{vId}/approve` | Approve version |
| `POST` | `/api/documents/{id}/versions/{vId}/reject` | Reject version |
| `POST` | `/api/documents/{id}/versions/{vId}/restore` | Restore version |
| `GET` | `/api/users` | List users (admin only) |
| `POST` | `/api/users` | Create user (admin only) |
| `DELETE` | `/api/users/{id}` | Delete user (admin only) |
| `PUT` | `/api/users/{id}/role` | Change user role (admin only) |
| `PUT` | `/api/users/{id}/password` | Change password |
