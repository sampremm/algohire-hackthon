# In-App Messaging System

A full-stack notification and messaging platform with admin dashboard for creating templates, triggering notifications, and monitoring delivery status. Built with Node.js/Express backend and React frontend.

## 🎯 Features

- ✅ **Template Management** - Create and manage notification templates with dynamic placeholders
- ✅ **Batch Notifications** - Send notifications to multiple users simultaneously
- ✅ **Delivery Tracking** - Monitor notification delivery status with real-time stats
- ✅ **User Dashboard** - Users can view their notifications and mark as read
- ✅ **Admin Dashboard** - Full control over templates, sending, and monitoring
- ✅ **Async Processing** - Background job queue with retry logic using BullMQ
- ✅ **State Management** - Track notifications through delivery lifecycle (QUEUED → SENT/FAILED)
- ✅ **Responsive UI** - Modern React interface with Vite for fast development

## 🏗️ Tech Stack

### Backend

- **Framework**: Node.js with Express.js v5.2.1
- **Database**: PostgreSQL (Aiven Cloud) with Prisma ORM v6.19.2
- **Queue**: BullMQ v5.67.3 + Redis (ioredis v5.9.2 - RedisLabs)
- **Authentication**: Header-based user identification (x-user-id)
- **CORS**: Enabled for http://localhost:5173

### Frontend

- **Framework**: React 19.2.0 with Hooks
- **Build Tool**: Vite v7.2.4
- **HTTP Client**: Axios v1.13.4
- **Styling**: CSS (no external component library)

## 📁 Project Structure

```
in-app-messaging/
├── backend/
│   ├── controllers/           # Request handlers
│   │   ├── admin.controller.js
│   │   └── user.controller.js
│   ├── routes/               # Express route definitions
│   │   ├── admin.routes.js
│   │   └── user.routes.js
│   ├── services/             # Business logic
│   │   ├── template.service.js
│   │   ├── notification.service.js
│   │   └── delivery.service.js
│   ├── queue/                # Job queue & worker
│   │   ├── notification.queue.js
│   │   └── notification.worker.js
│   ├── prisma/               # Database schema & migrations
│   │   └── schema.prisma
│   ├── utils/                # Helper functions
│   │   └── templateRenderer.js
│   ├── index.js              # Express server setup
│   ├── prisma.js             # Prisma client instance
│   └── seed.js               # Database seeding
│
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   │   ├── AdminDashboard.jsx
    │   │   └── UserDashboard.jsx
    │   ├── api.js            # Axios HTTP client
    │   ├── App.jsx           # Main app component
    │   ├── App.css           # Global styles
    │   ├── main.jsx          # React entry point
    │   └── index.css
    ├── index.html
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Redis (for queue processing)

### Installation

#### Backend Setup

```bash
cd backend
npm install
```

#### Frontend Setup

```bash
cd frontend
npm install
```

### Environment Configuration

Create `.env` file in the backend directory with your PostgreSQL and Redis credentials:

```env
# PostgreSQL (e.g., from Aiven)
DATABASE_URL="postgres://user:password@host:port/database?sslmode=require"

# Redis (e.g., from RedisLabs)
REDIS_URL="redis://default:password@host:port"

# Server Port
PORT=3000
```

## 🔧 Running the Application

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

Server runs on `http://localhost:3000`

### 2. Start Background Worker

In a separate terminal:

```bash
cd backend
node queue/notification.worker.js
```

### 3. Start Frontend Dev Server

In another terminal:

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Seed Database (Optional)

```bash
cd backend
npm run seed
```

Creates 5 test users and 3 notification templates.

## 📊 API Endpoints

### Admin Endpoints

#### Create Template

```
POST /admin/templates
Body: { "title": "Welcome {{name}}", "body": "Hello {{name}}" }
Response: 201 { id, titleTemplate, bodyTemplate, createdAt }
```

#### Get All Templates

```
GET /admin/templates
Response: 200 [{ id, titleTemplate, bodyTemplate, createdAt }]
```

#### Get Template by ID

```
GET /admin/templates/:id
Response: 200 { id, titleTemplate, bodyTemplate, createdAt }
```

#### Send Notifications to Users

```
POST /admin/notify
Body: { "templateId": "uuid", "userIds": ["uuid1", "uuid2"] }
Response: 202 { batchId, templateId, createdAt }
```

#### Get Delivery Statistics

```
GET /admin/stats
Response: 200 { QUEUED: n, PROCESSING: n, SENT: n, FAILED: n, successRate: % }
```

#### Get Batch Status

```
GET /admin/batches/:batchId/status
Response: 200 { QUEUED: n, PROCESSING: n, SENT: n, FAILED: n }
```

### User Endpoints

#### Get User Notifications

```
GET /user/notifications
Headers: x-user-id: <userId>
OR
Query: GET /user/notifications?userId=<userId>

Response: 200 [{ id, userId, title, body, isRead, createdAt }]
```

**Examples:**

```bash
# Using header
curl http://localhost:3000/user/notifications \
  -H "x-user-id: f6a329e5-ec7f-4000-8019-8a34be1e874a"

# Using query param
curl "http://localhost:3000/user/notifications?userId=f6a329e5-ec7f-4000-8019-8a34be1e874a"
```

#### Mark Notification as Read

```
PATCH /user/notifications/:id/read
Headers: x-user-id: <userId>
OR
Query: PATCH /user/notifications/:id/read?userId=<userId>

Response: 200 { message: "Notification marked as read" }
```

## 🗄️ Database Schema

### User

- `id` (UUID, Primary Key)
- `name` (String)
- `role` (ADMIN | USER)

### NotificationTemplate

- `id` (UUID, Primary Key)
- `titleTemplate` (String) - Template with placeholders e.g., "Welcome {{name}}"
- `bodyTemplate` (String)
- `createdAt` (DateTime)

### NotificationBatch

- `id` (UUID, Primary Key)
- `templateId` (String)
- `createdAt` (DateTime)

### NotificationDelivery

- `id` (UUID, Primary Key)
- `batchId` (String)
- `userId` (String)
- `status` (QUEUED | PROCESSING | RETRYING | SENT | FAILED)
- `retryCount` (Int, default: 0)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### UserNotification

- `id` (UUID, Primary Key)
- `userId` (String, Foreign Key)
- `title` (String) - Rendered with placeholders substituted
- `body` (String)
- `isRead` (Boolean, default: false)
- `createdAt` (DateTime)

## 🎛️ Admin Dashboard Features

1. **Templates Tab**
   - Create new notification templates
   - View all existing templates
   - Dynamic placeholder support ({{fieldName}})

2. **Send Notifications Tab**
   - Select template and target users
   - Trigger batch notification delivery
   - Check batch delivery status with breakdown

3. **Stats Tab**
   - Real-time delivery statistics
   - Status breakdown (QUEUED, PROCESSING, SENT, FAILED)
   - Success rate calculation
   - Auto-refresh every 2 seconds

## 👤 User Dashboard Features

1. **User Selection**
   - Select from available demo users
   - Auto-fetches notifications on user change

2. **Notification List**
   - View all notifications for selected user
   - Visual indicators for unread messages
   - Timestamp display

3. **Mark as Read**
   - One-click notification read action
   - Auto-refresh after update
   - Status messages for user feedback

4. **Auto-Refresh**
   - Toggle auto-refresh on/off (default: ON)
   - Refreshes every 3 seconds when enabled
   - Manual refresh button available

## 🔄 Notification Delivery Flow

1. **Admin Trigger**: Admin creates batch and specifies template + users
2. **Enqueue**: Notification job added to BullMQ queue
3. **Process**: Worker picks up job, validates data, renders template
4. **Render**: Placeholders replaced with user data (e.g., {{name}} → "Alice")
5. **Store**: UserNotification record created with rendered content
6. **Retry**: If processing fails, retry up to 3 times with exponential backoff
7. **Finalize**: Status updated to SENT or FAILED
8. **Display**: Users see rendered notifications in their dashboard

## 🔧 Configuration

### Worker Settings

- **Max Retries**: 3 attempts
- **Initial Delay**: 1000ms (1 second)
- **Backoff Type**: Exponential
- **Idempotency**: Prevents duplicate processing of SENT deliveries

### Auto-Refresh

- **Admin Stats**: 2 seconds interval
- **User Notifications**: 3 seconds interval (can be toggled)

## 📝 Test Data

After running `npm run seed`, you'll have:

**Users (4 regular users + 1 admin):**

- Admin User (2f8ae86f-e24b-44ed-8769-90116b1c3dbe)
- Alice Johnson (f6a329e5-ec7f-4000-8019-8a34be1e874a)
- Bob Smith (d7b7a9f7-e5d5-4c7e-87dd-03e0c8879e3a)
- Carol White (c88ebdfd-b0ed-4cc1-b45b-78600ca490d3)
- David Brown (09bab597-e16f-4bf1-9d3d-688804e4201f)

**Templates (multiple pre-created):**

- Welcome {{name}}
- Action Required - {{name}}
- Special Offer for {{name}}
- And more...

## 🧪 Testing

### Quick Database Diagnostics

```bash
cd backend
node debug-notifications.js
```

Shows: users, templates, batches, deliveries, notifications, and queue status.

### Manual API Testing (curl)

```bash
# Get notifications for Alice Johnson
curl http://localhost:3000/user/notifications \
  -H "x-user-id: f6a329e5-ec7f-4000-8019-8a34be1e874a"

# Or using query params
curl "http://localhost:3000/user/notifications?userId=f6a329e5-ec7f-4000-8019-8a34be1e874a"

# List all templates
curl http://localhost:3000/admin/templates

# Check delivery stats
curl http://localhost:3000/admin/stats
```

## 🛠️ Development

### Backend Development Scripts

- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server
- `npm run seed` - Populate database with test data

### Frontend Development Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📦 Build & Deployment

### Build Frontend

```bash
cd frontend
npm run build
```

Creates optimized production build in `dist/` directory.

### Build Backend

Backend is run directly with Node.js. For production:

```bash
cd backend
npm install
NODE_ENV=production node index.js
```

## 🐛 Troubleshooting

### Empty Notifications Array []

**Solution:** Check diagnostic output first

```bash
cd backend
node debug-notifications.js
```

This shows:

- ✅ Users count
- ✅ Templates count
- ✅ Deliveries status
- ✅ Notifications created
- ✅ Queue jobs pending

If jobs are PROCESSING:

- Make sure **worker is running**: `node queue/notification.worker.js`
- Wait 5-10 seconds for processing to complete
- Run diagnostic again

### Queue Not Processing

- Verify RedisLabs Redis is reachable: Check `REDIS_URL` in `.env`
- Check worker process is started in separate terminal: `node queue/notification.worker.js`
- Monitor worker console for error messages and logs
- Run: `node debug-notifications.js` to check queue count

### Database Connection Error

- Verify `DATABASE_URL` is correct in `.env` (PostgreSQL format)
- Test connection: `npx prisma db execute --stdin < schema.prisma`
- Check Aiven PostgreSQL is accessible from your network
- Verify SSL requirement: `?sslmode=require` is in connection string

### 404 or Missing Notifications

- Ensure backend server is running: `npm run dev`
- Ensure worker is running: `node queue/notification.worker.js`
- Use correct userIds when requesting (check with diagnostic script)
- Provide **x-user-id header** or **?userId query param**
- Try: `curl "http://localhost:3000/user/notifications?userId=YOUR_USER_ID"`

### Missing User ID Header Error

If getting "User ID required" error:

```bash
# ✅ This works
curl http://localhost:3000/user/notifications \
  -H "x-user-id: f6a329e5-ec7f-4000-8019-8a34be1e874a"

# ✅ Or this
curl "http://localhost:3000/user/notifications?userId=f6a329e5-ec7f-4000-8019-8a34be1e874a"

# ❌ This won't work (no userId)
curl http://localhost:3000/user/notifications
```

### CORS Errors (ERR_BLOCKED_BY_CLIENT)

- Ensure frontend runs on http://localhost:5173
- Check backend CORS configuration in `index.js`
- Restart backend server after any changes
- Verify `Access-Control-Allow-Origin: http://localhost:5173` in response headers

## 📄 License

ISC

## 👨‍💻 Author

Created with Node.js, React, and Prisma
