# In-App Notification System

A hackathon project implementing a templated in-app notification system with reliable asynchronous delivery, retry logic, and real-time monitoring.

## 🎯 Features

- **Admin Dashboard**: Create templates, trigger notifications, monitor delivery status
- **User Dashboard**: View received notifications, mark as read
- **Reliable Delivery**: Queue-based processing with automatic retry logic (max 3 retries)
- **Template System**: Support for placeholder-based dynamic content
- **Delivery Tracking**: Real-time metrics on notification delivery

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Admin/User Frontend                   │
│                     (React SPA)                          │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend API                           │
│            (Node.js + Express + SQLite)                 │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │Admin Routes  │  │User Routes   │  │Render/Track│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────┬────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │   SQLite │          │ BullMQ  │          │  Redis  │
   │ Database │          │  Queue  │          │  Cache  │
   └─────────┘          └────┬────┘          └─────────┘
                             │
                             ▼
                      ┌────────────┐
                      │   Worker   │
                      │  (Process  │
                      │  & Retry)  │
                      └────────────┘
```

## 📋 API Endpoints

### Admin Endpoints

#### Template Management

```bash
# Create a new template
POST /admin/templates
Content-Type: application/json

{
  "title": "Welcome {{name}}",
  "body": "Hello {{name}}, your account has been activated."
}

Response: 201 Created
{
  "message": "Template created",
  "template": {
    "id": "template-id",
    "titleTemplate": "Welcome {{name}}",
    "bodyTemplate": "...",
    "createdAt": "2026-02-06T..."
  }
}
```

```bash
# List all templates
GET /admin/templates

Response: 200 OK
[
  {
    "id": "template-id",
    "titleTemplate": "Welcome {{name}}",
    "bodyTemplate": "...",
    "createdAt": "2026-02-06T..."
  }
]
```

```bash
# Get a specific template
GET /admin/templates/:templateId

Response: 200 OK
{
  "id": "template-id",
  "titleTemplate": "...",
  "bodyTemplate": "...",
  "createdAt": "2026-02-06T..."
}
```

#### Notification Delivery

```bash
# Trigger notifications
POST /admin/notify
Content-Type: application/json

{
  "templateId": "template-id",
  "userIds": ["user-id-1", "user-id-2", "user-id-3"]
}

Response: 202 Accepted
{
  "message": "Notifications queued",
  "batchId": "batch-id"
}
```

#### Monitoring

```bash
# Get overall delivery statistics
GET /admin/stats

Response: 200 OK
{
  "total": 150,
  "queued": 10,
  "processing": 5,
  "retrying": 3,
  "sent": 120,
  "failed": 12,
  "successRate": "80.00%"
}
```

```bash
# Get batch delivery status
GET /admin/batches/:batchId/status

Response: 200 OK
{
  "batchId": "batch-id",
  "total": 5,
  "byStatus": {
    "SENT": 4,
    "RETRYING": 1
  },
  "deliveries": [
    {
      "id": "delivery-id",
      "userId": "user-id",
      "status": "SENT",
      "retryCount": 0,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### User Endpoints

```bash
# Get user's notifications
GET /user/notifications/:userId

Response: 200 OK
[
  {
    "id": "notification-id",
    "userId": "user-id",
    "title": "Welcome Alice",
    "body": "Hello Alice, your account has been activated.",
    "isRead": false,
    "createdAt": "2026-02-06T..."
  }
]
```

```bash
# Mark notification as read
PATCH /user/notifications/:notificationId/read

Response: 200 OK
{
  "message": "Marked as read"
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Configuration

Create or update `.env`:

```env
DATABASE_URL="file:./dev.db"
REDIS_URL="redis://default:password@host:port"
PORT=3000
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate dev --name init

# Seed test data
npm run seed
```

### Running the Application

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000`

## 🔄 Queue & Worker Logic

### Notification Processing Flow

1. **Admin triggers notification** → API receives request
2. **Batch created** → Database stores batch metadata
3. **Delivery jobs queued** → One job per user in BullMQ
4. **Worker processes job** → Async processing via background worker
5. **Template rendered** → Placeholders replaced with user data
6. **Delivery simulated** → Random success/failure (60% success)
7. **Status updated** → Database reflects delivery outcome
8. **Retry handled** → Failed deliveries re-queued with exponential backoff

### Retry Logic

- **Max Retries**: 3 attempts per delivery
- **Idempotency**: Already-sent notifications will not be reprocessed
- **State Transitions**:
  - `QUEUED` → `PROCESSING` → `SENT` ✅
  - `PROCESSING` → `RETRYING` → `QUEUED` (max 3 times)
  - `PROCESSING` → `FAILED` (if retries exhausted)

## 🗄️ Database Schema

### Core Models

```prisma
model User {
  id            String
  name          String
  role          Role                // ADMIN | USER
  notifications UserNotification[]
}

model NotificationTemplate {
  id            String
  titleTemplate String               // "Welcome {{name}}"
  bodyTemplate  String               // "Hello {{name}}..."
  createdAt     DateTime
}

model NotificationBatch {
  id         String                 // Groups delivery jobs
  templateId String
  createdAt  DateTime
}

model NotificationDelivery {
  id         String
  batchId    String
  userId     String
  status     DeliveryStatus         // QUEUED | PROCESSING | RETRYING | SENT | FAILED
  retryCount Int                    // 0-3
  createdAt  DateTime
  updatedAt  DateTime
}

model UserNotification {
  id        String                 // Final rendered notification shown to user
  userId    String
  title     String
  body      String
  isRead    Boolean
  createdAt DateTime
}
```

## 🔐 State Management & Rules

### Valid Delivery States

| State        | Meaning                   |
| ------------ | ------------------------- |
| `QUEUED`     | Waiting to be processed   |
| `PROCESSING` | Currently being delivered |
| `RETRYING`   | Failed, will be retried   |
| `SENT`       | Successfully delivered    |
| `FAILED`     | Exhausted all retries     |

### Idempotency Guarantee

- If `status == SENT`, worker exits without processing
- Prevents duplicate notifications
- Safe to retry entire delivery system

### Key Rules

✅ **Allowed**:

- Max 3 retries per delivery
- Retries are queued with delay
- Failed deliveries after 3 retries marked as FAILED
- Caching is invalidated on state changes

❌ **Forbidden**:

- Retrying SENT deliveries
- Creating duplicate notifications for same delivery
- Infinite retries
- Cache-only writes without database sync

## 🧪 Testing the API

### Using cURL

```bash
# Get templates
curl http://localhost:3000/admin/templates

# Create template
curl -X POST http://localhost:3000/admin/templates \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome {{name}}",
    "body": "Hello {{name}}"
  }'

# Trigger notifications (use real IDs from seed)
curl -X POST http://localhost:3000/admin/notify \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "<TEMPLATE_ID>",
    "userIds": ["<USER_ID_1>", "<USER_ID_2>"]
  }'

# Get delivery stats
curl http://localhost:3000/admin/stats

# Get user notifications
curl http://localhost:3000/user/notifications/<USER_ID>
```

### Using Postman

Import the endpoints above with proper JSON payloads. Test scenarios:

1. Create 2-3 templates
2. Trigger a batch to multiple users
3. Monitor stats as worker processes
4. Verify retry behavior with logs
5. Get user notifications

## 📊 Monitoring

### Log Watch

```bash
# In separate terminal, watch worker logs
npm run dev
```

### Database Status

```bash
# View database in Prisma Studio
npx prisma studio
```

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite (dev), PostgreSQL (prod)
- **Queue**: BullMQ (Redis-backed)
- **ORM**: Prisma
- **Task Processing**: BullMQ Worker

## 📝 Implementation Notes

### Template Rendering

Templates use mustache-style placeholders:

```javascript
// Example
let title = "Welcome {{name}}";
let user = { name: "Alice", department: "Engineering" };
// Result: "Welcome Alice"
```

### Worker Pattern

The background worker:

1. Picks job from queue
2. Checks current status (idempotency)
3. Marks as PROCESSING
4. Renders template with user data
5. Simulates delivery
6. Updates status or re-queues on failure

### Caching Strategy

- Cache invalidated on: create, update, delete operations
- Source of truth: Database
- Cache misses automatically fetch from DB

## 🐛 Troubleshooting

### Queue not processing

```bash
# Check Redis connection
redis-cli ping

# Restart worker
kill <worker_pid>
npm run dev
```

### Database locked (SQLite)

```bash
# Clear and reseed
rm dev.db
npm run seed
```

### Template not rendering

- Verify placeholder format: `{{name}}`
- Check user has that field
- Test with manual placeholder

## 📦 Deployment

For production:

1. Switch DATABASE_URL to PostgreSQL
2. Update Prisma schema provider
3. Deploy worker separately
4. Monitor Redis connection pool
5. Set up proper logging

## 📄 License

ISC

---

**Built during Hackathon 2026** 🚀
