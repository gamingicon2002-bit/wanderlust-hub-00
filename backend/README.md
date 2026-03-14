# Travel Booking Backend API

Node.js + Express + MongoDB backend for the Travel Booking application.

## Setup

```bash
cd backend
cp .env.example .env    # Edit with your MongoDB URI & JWT secret
npm install
npm run dev             # Starts with nodemon on port 5000
```

## Requirements
- Node.js 18+
- MongoDB (local or Atlas)

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/auth/register` | Super Admin | Create admin user |
| GET | `/api/auth/me` | Yes | Get current user |
| PUT | `/api/auth/change-password` | Yes | Change own password |
| GET | `/api/auth/users` | Super Admin | List admin users |
| PUT | `/api/auth/users/:id/role` | Super Admin | Update user role |
| PUT | `/api/auth/users/:id/password` | Super Admin | Reset user password |
| DELETE | `/api/auth/users/:id` | Super Admin | Delete user |

### Vehicles
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/vehicles` | No | List (filter: type, sub_type) |
| GET | `/api/vehicles/:id` | No | Get one |
| POST | `/api/vehicles` | Admin | Create |
| PUT | `/api/vehicles/:id` | Admin | Update |
| DELETE | `/api/vehicles/:id` | Admin | Delete |

### Vehicle Types
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/vehicle-types` | No | List all |
| POST | `/api/vehicle-types` | Admin | Create |
| PUT | `/api/vehicle-types/:id` | Admin | Update |
| DELETE | `/api/vehicle-types/:id` | Admin | Delete |

### Packages
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/packages` | No | List (filter: destination, tour_type, is_featured) |
| GET | `/api/packages/:id` | No | Get one |
| POST | `/api/packages` | Admin | Create |
| PUT | `/api/packages/:id` | Admin | Update |
| DELETE | `/api/packages/:id` | Admin | Delete |

### Destinations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/destinations` | No | List all |
| GET | `/api/destinations/:id` | No | Get one |
| POST | `/api/destinations` | Admin | Create |
| PUT | `/api/destinations/:id` | Admin | Update |
| DELETE | `/api/destinations/:id` | Admin | Delete |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/bookings` | Admin | List (filter: status, booking_type) |
| GET | `/api/bookings/:id` | Yes | Get one |
| POST | `/api/bookings` | No | Create (customer) |
| PUT | `/api/bookings/:id` | Admin | Update |
| PUT | `/api/bookings/:id/status` | Admin | Update status |
| PUT | `/api/bookings/:id/assign-driver` | Admin | Assign driver |
| DELETE | `/api/bookings/:id` | Admin | Delete |

### Drivers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/drivers` | Admin | List all |
| GET | `/api/drivers/:id` | Yes | Get one |
| POST | `/api/drivers` | Admin | Create |
| PUT | `/api/drivers/:id` | Admin | Update |
| POST | `/api/drivers/:id/create-account` | Admin | Create login |
| DELETE | `/api/drivers/:id` | Admin | Delete |

### Hotels
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/hotels` | No | List (filter: destination, is_active) |
| GET | `/api/hotels/:id` | No | Get one |
| POST | `/api/hotels` | Admin | Create |
| PUT | `/api/hotels/:id` | Admin | Update |
| DELETE | `/api/hotels/:id` | Admin | Delete |

### Blogs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/blogs` | No | List (filter: status) |
| GET | `/api/blogs/:id` | No | Get one |
| POST | `/api/blogs` | Admin | Create |
| PUT | `/api/blogs/:id` | Admin | Update |
| DELETE | `/api/blogs/:id` | Admin | Delete |
| POST | `/api/blogs/:id/comments` | No | Add comment |
| PUT | `/api/blogs/:blogId/comments/:commentId/status` | Admin | Update comment status |

### Gallery, Reviews, Contacts, Invoices, Offers, Pages, Settings, Social Links, Homepage, Notifications
All follow standard CRUD pattern. See route files for details.

## Seed Super Admin

```bash
node seed.js
```

Creates a super admin user: `admin@admin.com` / `admin123456`

## Architecture

```
backend/
├── server.js           # Entry point
├── middleware/auth.js   # JWT auth + role middleware
├── models/             # Mongoose schemas
├── routes/             # Express route handlers
├── seed.js             # DB seeder
└── .env.example        # Environment template
```
