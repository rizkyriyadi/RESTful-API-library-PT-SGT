# Library Management API

A RESTful API for managing a library system built with Express.js and PostgreSQL.

## Features

- **Books Management**: List books with filtering and pagination
- **Member Management**: Register new members with validation
- **Borrowing System**: Create and track book borrowings with transaction support
- **Return System**: Process book returns and update inventory
- **Pagination & Filtering**: Support for pagination and various filter options

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Environment**: dotenv

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd summit-global-teknologi
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
Create a `.env` file in the root directory with the following:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=library_db
PORT=3000
```

4. Setup the database:
```bash
psql -U postgres -h localhost
CREATE DATABASE library_db;
```

5. Run the schema:
```bash
psql -U postgres -h localhost -d library_db -f schema.sql
```

6. Seed sample data:
```bash
psql -U postgres -h localhost -d library_db -f seed-data.sql
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will run on `http://localhost:3000` by default.

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### 1. Get All Books

**Endpoint:** `GET /books`

**Query Parameters:**
- `title` (string, optional): Filter by book title (case-insensitive)
- `author` (string, optional): Filter by author (case-insensitive)
- `page` (integer, default: 1): Page number for pagination
- `limit` (integer, default: 10): Number of records per page

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "published_year": 1925,
      "stock": 5,
      "isbn": "9780743273565",
      "available": true
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/api/books?title=gatsby&limit=5"
```

---

### 2. Register Member

**Endpoint:** `POST /members`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "081234567890",
  "address": "123 Main Street, City"
}
```

**Validations:**
- All fields are required
- Email must be unique and valid format
- Phone must be 10-15 digits

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890",
    "address": "123 Main Street, City",
    "created_at": "2025-11-22T01:20:58.976Z"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890",
    "address": "123 Main St"
  }'
```

---

### 3. Get Member Borrowing History

**Endpoint:** `GET /members/:id/borrowings`

**Path Parameters:**
- `id` (UUID): Member ID

**Query Parameters:**
- `status` (string, optional): Filter by status ('BORROWED' or 'RETURNED')
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 10): Records per page

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "borrow_date": "2025-11-21T17:00:00.000Z",
      "return_date": null,
      "status": "BORROWED",
      "created_at": "2025-11-22T01:23:30.967Z",
      "book": {
        "id": "uuid",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "isbn": "9780743273565",
        "published_year": 1925
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/api/members/19817367-e923-4503-92d0-3eff7fe511e0/borrowings?status=BORROWED"
```

---

### 4. Create Book Borrowing

**Endpoint:** `POST /borrowings`

**Request Body:**
```json
{
  "book_id": "uuid",
  "member_id": "uuid"
}
```

**Business Rules:**
- Book must exist and have stock > 0
- Member must exist
- Member cannot borrow more than 3 books at the same time
- Uses database transaction to ensure data consistency

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "book_id": "uuid",
    "member_id": "uuid",
    "borrow_date": "2025-11-22",
    "return_date": null,
    "status": "BORROWED",
    "created_at": "2025-11-22T01:23:30.967Z",
    "updated_at": "2025-11-22T01:23:30.967Z"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/borrowings \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "674c960b-2ebe-44b7-a7f2-d85685e04287",
    "member_id": "3cc63973-e992-416c-8ba4-b0c89f78d182"
  }'
```

---

### 5. Return Book

**Endpoint:** `PUT /borrowings/:id/return`

**Path Parameters:**
- `id` (UUID): Borrowing ID

**Business Logic:**
- Borrowing record must exist
- Book cannot already be returned
- Uses database transaction to ensure data consistency
- Automatically updates book stock

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "book_id": "uuid",
    "member_id": "uuid",
    "borrow_date": "2025-11-21T17:00:00.000Z",
    "return_date": "2025-11-22T17:00:00.000Z",
    "status": "RETURNED",
    "created_at": "2025-11-22T01:23:30.967Z",
    "updated_at": "2025-11-22T01:47:40.201Z"
  }
}
```

**Example:**
```bash
curl -X PUT "http://localhost:3000/api/borrowings/8f285966-662e-48cc-b9e5-2dec807db44d/return"
```

---

## Error Handling

The API returns standard HTTP status codes with error messages:

```json
{
  "error": true,
  "message": "Error description"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

---

## Project Structure

```
src/
├── config/
│   └── database.js          # PostgreSQL connection setup
├── controllers/
│   ├── bookController.js    # Book request handler
│   ├── memberController.js  # Member request handler
│   └── borrowingController.js # Borrowing request handler
├── models/
│   ├── book.js              # Book database queries
│   ├── member.js            # Member database queries
│   └── borrowing.js         # Borrowing database queries
├── services/
│   ├── bookService.js       # Book business logic
│   ├── memberService.js     # Member business logic
│   └── borrowingService.js  # Borrowing business logic
├── routes/
│   ├── bookRoutes.js        # Book endpoints
│   ├── memberRoutes.js      # Member endpoints
│   └── borrowingRoutes.js   # Borrowing endpoints
└── app.js                   # Express application entry point

schema.sql                   # Database schema (create tables)
seed-data.sql              # Sample data
.env                       # Environment variables
```

---

## Database Design

### Books Table
- `id` (UUID): Primary Key
- `title` (VARCHAR): Book title
- `author` (VARCHAR): Author name
- `published_year` (INTEGER): Publication year
- `stock` (INTEGER): Current available stock
- `isbn` (VARCHAR): ISBN number (unique)
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

### Members Table
- `id` (UUID): Primary Key
- `name` (VARCHAR): Member name
- `email` (VARCHAR): Email (unique)
- `phone` (VARCHAR): Phone number
- `address` (TEXT): Member address
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

### Borrowings Table
- `id` (UUID): Primary Key
- `book_id` (UUID): Foreign Key to Books
- `member_id` (UUID): Foreign Key to Members
- `borrow_date` (DATE): Date of borrowing
- `return_date` (DATE): Date of return (null if not returned)
- `status` (VARCHAR): 'BORROWED' or 'RETURNED'
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

---

## Key Features

### Transaction Support
Create and return borrowing operations use database transactions to ensure:
- Stock is decremented/incremented atomically
- Borrowing record is created/updated atomically
- If any operation fails, all changes are rolled back

### Validation
- **Email**: Format validation and uniqueness check
- **Phone**: 10-15 digits validation
- **Book Stock**: Prevents borrowing out-of-stock books
- **Member Limit**: Prevents borrowing more than 3 books
- **Required Fields**: All required fields must be provided

### Pagination
All list endpoints support pagination with:
- `page`: Current page (default: 1)
- `limit`: Records per page (default: 10)
- Returns total count and total pages

### Filtering
- Books: Filter by title and author (case-insensitive)
- Borrowings: Filter by status (BORROWED/RETURNED)

---

## Testing with cURL

### Test Books Endpoint
```bash
# Get all books
curl http://localhost:3000/api/books

# Filter by title
curl "http://localhost:3000/api/books?title=gatsby"

# With pagination
curl "http://localhost:3000/api/books?page=2&limit=5"
```

### Test Member Endpoints
```bash
# Register member
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","phone":"081234567890","address":"Jl. Test"}'

# Get member borrowings
curl "http://localhost:3000/api/members/{member_id}/borrowings"
```

### Test Borrowing Endpoints
```bash
# Create borrowing
curl -X POST http://localhost:3000/api/borrowings \
  -H "Content-Type: application/json" \
  -d '{"book_id":"{book_id}","member_id":"{member_id}"}'

# Return book
curl -X PUT "http://localhost:3000/api/borrowings/{borrowing_id}/return"
```

---

## Notes

- The `.env` file contains sensitive information and should not be committed to version control
- All timestamps are stored in UTC
- ISBN must be 13 characters long
- The API uses parameterized queries to prevent SQL injection
- Database indexes are created on frequently queried fields for performance

---

## License

ISC
