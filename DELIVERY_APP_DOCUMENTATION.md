# Delivery App - Complete Technical Documentation

## Table of Contents

1. [Overview](#overview)
2. [Backend Architecture](#backend-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Authentication System](#authentication-system)
5. [Database Models](#database-models)
6. [API Routes](#api-routes)
7. [Frontend Components](#frontend-components)
8. [Role-Based Access Control](#role-based-access-control)
9. [Setup and Installation](#setup-and-installation)
10. [Code Walkthrough](#code-walkthrough)

## Overview

This is a full-stack delivery management application built with:

- **Backend**: Node.js, Express.js, MongoDB, JWT Authentication
- **Frontend**: React, Ionic Framework, TypeScript
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB with Mongoose ODM

The app supports three user roles:

- **User**: Can create and track orders
- **Dispatcher**: Can manage and update delivery statuses
- **Admin**: Can manage users, view analytics, and oversee all operations

## Backend Architecture

### File Structure

```
backend/
├── models/
│   ├── User.js          # User schema and methods
│   ├── Order.js         # Order schema
│   └── Delivery.js      # Delivery schema
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── orders.js        # Order management routes
│   ├── deliveries.js    # Delivery management routes
│   └── admin.js         # Admin dashboard routes
├── server.js            # Main server file
└── package.json         # Dependencies and scripts
```

### Key Technologies

- **Express.js**: Web application framework
- **Mongoose**: MongoDB object modeling
- **JWT**: For authentication tokens
- **bcryptjs**: For password hashing
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security middleware
- **Rate Limiting**: To prevent abuse

## Frontend Architecture

### File Structure

```
src/
├── components/
│   ├── Header.tsx       # Reusable header component
│   └── Register.tsx     # Registration component
├── pages/
│   ├── Login.tsx        # Login page
│   ├── Home.tsx         # Dashboard page
│   ├── Orders.tsx       # Orders management (users)
│   ├── Deliveries.tsx   # Deliveries management (dispatchers)
│   └── Profile.tsx      # User profile page
├── contexts/
│   └── AuthContext.tsx  # Authentication state management
├── services/
│   └── api.ts           # API service layer
└── App.tsx              # Main app component with routing
```

## Authentication System

### How JWT Authentication Works

1. **User Registration/Login**:

   ```javascript
   // User provides email and password
   const response = await apiService.login(email, password);

   // Server validates credentials and returns JWT token
   const token = jwt.sign(
     { userId: user._id, email: user.email, role: user.role },
     "secret-key",
     { expiresIn: "7d" },
   );
   ```

2. **Token Storage**:

   ```javascript
   // Frontend stores token in localStorage
   localStorage.setItem("token", response.token);
   ```

3. **Authenticated Requests**:

   ```javascript
   // Every API request includes the token in headers
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

4. **Server Validation**:
   ```javascript
   // Server middleware validates token on protected routes
   const authenticate = (req, res, next) => {
     const token = req.headers.authorization?.split(" ")[1];
     const decoded = jwt.verify(token, "secret-key");
     req.user = decoded; // Contains userId, email, role
     next();
   };
   ```

## Database Models

### User Model (`backend/models/User.js`)

```javascript
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed with bcrypt
    role: {
      type: String,
      enum: ["user", "dispatcher", "admin"],
      default: "user",
    },
    phone: { type: String },
    address: { type: String },
    avatar: { type: String, default: "default-avatar-url" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
```

**Key Features**:

- Passwords are automatically hashed before saving using bcrypt
- `comparePassword` method for login verification
- Timestamps for creation and modification tracking

### Order Model (`backend/models/Order.js`)

```javascript
const orderSchema = new mongoose.Schema(
  {
    product: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "In Transit", "Delivered", "Cancelled"],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pickupAddress: { type: String, required: true },
    pickupPhone: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryPhone: { type: String, required: true },
    details: { type: String },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    estimatedCost: { type: Number, default: 0 },
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery" },
  },
  { timestamps: true },
);
```

### Delivery Model (`backend/models/Delivery.js`)

```javascript
const deliverySchema = new mongoose.Schema(
  {
    product: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Transit", "Delivered", "Cancelled"],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dispatcherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // ... address and contact fields
    trackingNumber: { type: String, unique: true },
    estimatedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
  },
  { timestamps: true },
);
```

**Key Features**:

- Auto-generates unique tracking numbers
- Links customers and dispatchers via ObjectId references

## API Routes

### Authentication Routes (`backend/routes/auth.js`)

#### POST `/api/auth/register`

```javascript
// Creates new user account
Body: {
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  role: "user", // optional, defaults to "user"
  phone: "+1234567890",
  address: "123 Main St"
}

Response: {
  success: true,
  token: "jwt-token-here",
  user: { id, name, email, role, phone, address, avatar }
}
```

#### POST `/api/auth/login`

```javascript
// Authenticates user and returns token
Body: {
  email: "john@example.com",
  password: "password123"
}

Response: {
  success: true,
  token: "jwt-token-here",
  user: { id, name, email, role, phone, address, avatar }
}
```

#### GET `/api/auth/me` (Protected)

```javascript
// Returns current user info
Headers: { Authorization: "Bearer jwt-token" }

Response: {
  success: true,
  user: { id, name, email, role, phone, address, avatar }
}
```

### Order Routes (`backend/routes/orders.js`)

#### GET `/api/orders` (Protected)

```javascript
// Gets user's orders
Headers: { Authorization: "Bearer jwt-token" }
Query: { status: "Pending", search: "laptop" }

Response: {
  success: true,
  orders: [
    {
      _id: "order-id",
      product: "Laptop",
      status: "Pending",
      pickupAddress: "Tech Store",
      deliveryAddress: "Customer Home",
      // ... other fields
    }
  ]
}
```

#### POST `/api/orders` (Protected)

```javascript
// Creates new order
Headers: { Authorization: "Bearer jwt-token" }
Body: {
  product: "Smartphone",
  pickupAddress: "Electronics Store, Lagos",
  pickupPhone: "+2348012345678",
  deliveryAddress: "Customer Address, Abuja",
  deliveryPhone: "+2348098765432",
  details: "Handle with care",
  priority: "Medium"
}

Response: {
  success: true,
  order: { /* order object */ },
  delivery: { /* auto-created delivery object */ }
}
```

### Delivery Routes (`backend/routes/deliveries.js`)

#### GET `/api/deliveries` (Protected - Dispatcher/Admin only)

```javascript
// Gets deliveries for dispatcher
Headers: { Authorization: "Bearer jwt-token" }
Query: { status: "In Transit", search: "phone" }

Response: {
  success: true,
  deliveries: [
    {
      _id: "delivery-id",
      product: "Smartphone",
      status: "In Transit",
      customerName: "John Doe",
      dispatcherName: "Jane Dispatcher",
      trackingNumber: "DLV1234567890ABC",
      // ... other fields
    }
  ]
}
```

#### PUT `/api/deliveries/:id/status` (Protected - Dispatcher/Admin only)

```javascript
// Updates delivery status
Headers: { Authorization: "Bearer jwt-token" }
Body: {
  status: "Delivered",
  notes: "Package delivered successfully"
}

Response: {
  success: true,
  delivery: { /* updated delivery object */ },
  message: "Status updated successfully"
}
```

### Admin Routes (`backend/routes/admin.js`)

#### GET `/api/admin/dashboard/stats` (Protected - Admin only)

```javascript
// Gets dashboard statistics
Headers: { Authorization: "Bearer jwt-token" }

Response: {
  success: true,
  stats: {
    overview: {
      totalUsers: 150,
      totalOrders: 1200,
      totalDeliveries: 1180,
      todayOrders: 25,
      todayDeliveries: 30
    },
    statusDistribution: {
      orders: [
        { _id: "Pending", count: 45 },
        { _id: "In Transit", count: 120 },
        { _id: "Delivered", count: 1000 }
      ],
      deliveries: [/* similar structure */]
    },
    userRoles: [
      { _id: "user", count: 120 },
      { _id: "dispatcher", count: 25 },
      { _id: "admin", count: 5 }
    ]
  }
}
```

## Frontend Components

### Authentication Context (`src/contexts/AuthContext.tsx`)

This provides global authentication state management:

```typescript
interface AuthContextType {
  user: User | null; // Current logged-in user
  isLoading: boolean; // Loading state
  isAuthenticated: boolean; // Whether user is logged in
  login: (email, password) => Promise<void>;
  register: (userData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData) => Promise<void>;
}
```

**How it works**:

1. **Initialization**: Checks localStorage for existing token on app startup
2. **Login/Register**: Calls API, stores token, updates user state
3. **Token Validation**: Validates token with server on app load
4. **Global State**: Provides user info to all components

### API Service (`src/services/api.ts`)

Centralized service for all backend communication:

```typescript
class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async login(email: string, password: string) {
    // Makes API call to /api/auth/login
    // Returns user data and token
  }

  async getOrders(params?: { status?: string; search?: string }) {
    // Makes API call to /api/orders
    // Includes auth headers automatically
  }

  // ... other methods
}
```

**Key Features**:

- Automatic token inclusion in headers
- Centralized error handling
- Type-safe API calls
- Response standardization

## Role-Based Access Control

### Frontend Route Protection

```typescript
// In App.tsx - Different routes based on user role
{user?.role === 'user' && (
  <Route path="/orders" component={Orders} />
)}

{user?.role === 'dispatcher' && (
  <Route path="/deliveries" component={Deliveries} />
)}

{user?.role === 'admin' && (
  <Route path="/admin" component={AdminDashboard} />
)}
```

### Backend Route Protection

```javascript
// Middleware checks user role
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Applied to admin routes
app.use("/api/admin", authenticate, adminOnly, adminRoutes);
```

## Setup and Installation

### Backend Setup

1. **Install Dependencies**:

   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables** (`.env`):

   ```
   PORT=4000
   MONGODB_URL=mongodb://localhost:27017/delivery_app
   JWT_SECRET=your-super-secret-key
   ```

3. **Start Server**:
   ```bash
   npm run dev  # Development with nodemon
   npm start    # Production
   ```

### Frontend Setup

1. **Install Dependencies**:

   ```bash
   cd src
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Code Walkthrough

### User Registration Flow

1. **Frontend** (`src/components/Register.tsx`):

   ```typescript
   const handleRegister = async () => {
     try {
       await register({ name, email, password, phone, address });
       // AuthContext automatically updates user state
       history.push("/home");
     } catch (error) {
       setError(error.message);
     }
   };
   ```

2. **AuthContext** (`src/contexts/AuthContext.tsx`):

   ```typescript
   const register = async (userData) => {
     const response = await apiService.register(userData);
     localStorage.setItem("token", response.token);
     setUser(response.user);
   };
   ```

3. **API Service** (`src/services/api.ts`):

   ```typescript
   async register(userData) {
     const response = await fetch('/api/auth/register', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(userData)
     });
     return this.handleResponse(response);
   }
   ```

4. **Backend** (`backend/routes/auth.js`):
   ```javascript
   router.post("/register", async (req, res) => {
     // Validate input
     // Check if user exists
     // Hash password
     // Create user
     // Generate JWT token
     // Return user data and token
   });
   ```

### Order Creation Flow

1. **User clicks "Add Order"** in Orders page
2. **Modal opens** with order form
3. **User fills form** and submits
4. **Frontend validates** input
5. **API call made** to create order
6. **Backend creates** Order and Delivery records
7. **Frontend updates** order list
8. **Real-time notification** sent to admins (future feature)

### Delivery Status Update Flow

1. **Dispatcher opens** Deliveries page
2. **Sees assigned deliveries** filtered by their ID
3. **Clicks on delivery** to open details
4. **Updates status** using dropdown
5. **Backend validates** dispatcher permissions
6. **Database updated** with new status
7. **Frontend refreshes** delivery list
8. **Customer can track** updated status

### Authentication Flow

1. **App loads**: Check localStorage for token
2. **Token exists**: Validate with backend
3. **Token valid**: Set user state, show authenticated UI
4. **Token invalid**: Clear token, show login
5. **User logs in**: Get new token, update state
6. **User logs out**: Clear token and state

## Security Features

### Password Security

- Passwords hashed with bcrypt (salt rounds: 10)
- Never stored in plain text
- Server-side validation

### JWT Security

- Tokens expire after 7 days
- Include user role for authorization
- Stored securely in localStorage

### API Security

- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet for security headers
- Input validation and sanitization

### Role-based Authorization

- Frontend route protection
- Backend middleware checks
- Database-level user roles

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live notifications
2. **Push Notifications**: Mobile app notifications
3. **GPS Tracking**: Real-time delivery location tracking
4. **Payment Integration**: Online payment processing
5. **Advanced Analytics**: Charts and reporting dashboard
6. **Email Notifications**: Automated status update emails
7. **File Upload**: Support for delivery photos/signatures
8. **Advanced Search**: Full-text search capabilities

## Testing Strategy

### Backend Testing

- Unit tests for models and utilities
- Integration tests for API endpoints
- Authentication middleware testing
- Database operation testing

### Frontend Testing

- Component unit tests
- Authentication flow testing
- API service testing
- User interaction testing

This documentation provides a comprehensive overview of the delivery app architecture, explaining how each component works and how they interact with each other to create a complete delivery management system.
