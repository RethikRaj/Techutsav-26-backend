# Frontend Integration Plan - Techutsav '26

## 🏗️ Architecture Overview

**Backend:** Node.js + Express API (Port 8080)  
**Frontend:** Next.js SPA (Separate Deployment)  
**Base URL:** `http://${HOST}:8080/api`  
**Authentication:** Cookie-based (HttpOnly cookies with JWT)

---

## 📱 Frontend Pages & Routes

### **Public Pages (Main SPA)**
1. **Landing Page** (`/`)
2. **All Events Page** (`/events`)
3. **Event Details Page** (`/events/[eventId]`)
4. **Login Page** (`/login`)
5. **Signup Page** (`/signup`)
6. **Email Verification Page** (`/verify`)
7. **Forgot Password Page** (`/forgot-password`)
8. **Reset Password Page** (`/reset-password`)

### **Protected User Pages**
9. **User Dashboard** (`/dashboard`)
10. **User Profile** (`/profile`)
11. **My Registered Events** (`/my-events`)
12. **Payment Upload** (`/payment`)

### **Admin Pages**
13. **Event Organizer Dashboard** (`/admin/events`)
14. **Create Event** (`/admin/events/create`)
15. **Edit Event** (`/admin/events/edit/[eventId]`)
16. **Payment Admin Dashboard** (`/admin/payments`)

---

## 🔐 Authentication & Authorization

### Cookie Management
- **Cookie Name:** `Authentication`
- **Cookie Structure:** `{ LoginToken: "JWT_TOKEN" }`
- **Expires:** 24 hours (86400000 ms)
- **Flags:** HttpOnly, Path: `/`

### User Roles
- `participant` - Regular users (default)
- `EventOrganizer` - Can create/edit events
- `PaymentAdmin` - Can view/approve payments

### Protected Route Middleware
All protected endpoints require the `loginUser` middleware which:
- Checks for `Authentication` cookie
- Validates JWT token
- Attaches `req.user` object with: `{ userId, email, name, role, collegeId }`

---

## 📋 API Endpoints Reference

### **1. User Authentication & Management**

#### **POST /api/user/signup**
**Purpose:** Register a new user  
**Auth Required:** No

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePass123",
  "collegeId": "65abc123...",
  "phoneNo": "9876543210",
  "year": 2,
  "department": "Computer Science"
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Signup Successful, Confirmation Mail Sent to: john@example.com",
  "data": null
}
```

**What Frontend Gets:**
- Success/error message
- Email verification status

**Frontend Actions:**
- Redirect to `/verify` with email info
- Show "Check your email" message

---

#### **GET /api/verify?auth={token}**
**Purpose:** Verify user email  
**Auth Required:** No

**Query Parameters:**
- `auth` - Email verification token (sent via email)

**Response (200):**
```json
{
  "status": 200,
  "message": "Account verified successfully",
  "data": null
}
```

**Frontend Actions:**
- Show success message
- Redirect to `/login` after 3 seconds

---

#### **GET /api/resend-email**
**Purpose:** Resend verification email  
**Auth Required:** No

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Authentication code successfully resent. Please check your email for the new code.",
  "data": null
}
```

---

#### **POST /api/user/login**
**Purpose:** Login user  
**Auth Required:** No

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePass123"
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Logged In successfully",
  "data": {
    "_id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "collegeId": "65xyz789...",
    "phoneNo": "9876543210",
    "year": 2,
    "department": "Computer Science",
    "role": "participant",
    "organizerEventId": null
  }
}
```

**What Frontend Gets:**
- User object (store in state/context)
- Authentication cookie (automatically set by browser)

**Frontend Actions:**
- Store user data in React Context/Redux
- Redirect to `/dashboard` or `/admin/events` based on role

---

#### **GET /api/user/profile**
**Purpose:** Get authenticated user profile with QR code  
**Auth Required:** Yes (Cookie)

**Response (200):**
```json
{
  "status": 200,
  "message": "User profile fetched successfully",
  "data": {
    "userId": "65abc123...",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "participant",
    "collegeId": "65xyz789...",
    "qrCode": "data:image/png;base64,iVBORw0KGgo...",
    "paymentInfo": [
      {
        "TXNID": "TXN123456",
        "amount": 500,
        "passType": "EVENT",
        "status": "APPROVED",
        "createdAt": "2026-02-01T10:30:00.000Z"
      }
    ]
  }
}
```

**What Frontend Gets:**
- User profile details
- QR code (base64 image) for event check-in
- Payment history

**Frontend Actions:**
- Display user profile page
- Show QR code for scanning at events
- Display payment status

---

#### **POST /api/user/logout**
**Purpose:** Logout user  
**Auth Required:** Yes

**Response (200):**
```json
{
  "status": 200,
  "message": "Logged out successfully",
  "data": null
}
```

**Frontend Actions:**
- Clear user context/state
- Redirect to `/login`

---

#### **POST /api/forgot-password**
**Purpose:** Request password reset  
**Auth Required:** No

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "If the email exists, a password reset link has been sent",
  "data": null
}
```

---

#### **POST /api/reset-password?token={resetToken}**
**Purpose:** Reset password with token  
**Auth Required:** No

**Query Parameters:**
- `token` - Password reset token (from email link)

**Request Body:**
```json
{
  "newPassword": "newSecurePass456"
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Password reset successfully. You can now login with your new password.",
  "data": null
}
```

---

### **2. Events Management**

#### **GET /api/event/all**
**Purpose:** Get all events (Public)  
**Auth Required:** No

**Response (200):**
```json
{
  "status": 200,
  "message": "Events retrieved successfully",
  "data": {
    "events": [
      {
        "_id": "65event123...",
        "name": "Code Sprint",
        "department": "CSE",
        "description": "48-hour hackathon...",
        "ruleBookUrl": "https://example.com/rules.pdf",
        "prizesInfo": "1st Prize: ₹50,000",
        "ruleDescription": "Teams of 2-4...",
        "orgContact": "9876543210",
        "category": "Offline",
        "posterUrl": "https://example.com/poster.jpg",
        "venue": "Main Auditorium",
        "date": "2026-03-15T00:00:00.000Z",
        "time": "10:00 AM",
        "isTeamEvent": true,
        "maxTeamSize": 4,
        "organizerId": "65org789...",
        "createdAt": "2026-02-01T10:00:00.000Z"
      }
    ]
  }
}
```

**What Frontend Gets:**
- Array of all events
- Complete event details

**Frontend Actions:**
- Display events grid/list on `/events` page
- Create event cards with poster, name, department
- Add "View Details" and "Register" buttons

---

#### **POST /api/event/create**
**Purpose:** Create new event (Event Organizers only)  
**Auth Required:** Yes (Role: EventOrganizer)

**Request Body:**
```json
{
  "name": "Code Sprint",
  "department": "CSE",
  "description": "48-hour hackathon...",
  "ruleBookUrl": "https://example.com/rules.pdf",
  "prizesInfo": "1st Prize: ₹50,000",
  "ruleDescription": "Teams of 2-4 members...",
  "orgContact": "9876543210",
  "category": "Offline",
  "posterUrl": "https://example.com/poster.jpg",
  "venue": "Main Auditorium",
  "date": "2026-03-15",
  "time": "10:00 AM",
  "isTeamEvent": true,
  "maxTeamSize": 4
}
```

**Response (201):**
```json
{
  "status": 201,
  "message": "Event created successfully",
  "data": {
    "event": { /* Full event object */ }
  }
}
```

---

#### **PUT /api/event/update/:eventId**
**Purpose:** Update event (Only event creator)  
**Auth Required:** Yes (Must be event organizer)

**URL Parameters:**
- `eventId` - Event ID to update

**Request Body:** (Any fields to update)
```json
{
  "name": "Updated Event Name",
  "description": "Updated description...",
  "venue": "New Venue"
}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Event updated successfully",
  "data": {
    "event": { /* Updated event object */ }
  }
}
```

---

#### **GET /api/event/my-events**
**Purpose:** Get events created by logged-in organizer  
**Auth Required:** Yes (Role: EventOrganizer)

**Response (200):**
```json
{
  "status": 200,
  "message": "Events retrieved successfully",
  "data": {
    "events": [ /* Array of events created by this organizer */ ]
  }
}
```

---

### **3. Event Registration**

#### **POST /api/event/register/:eventId**
**Purpose:** Register for an event  
**Auth Required:** Yes

**URL Parameters:**
- `eventId` - Event ID to register for

**Response (200):**
```json
{
  "status": 200,
  "message": "Registered for event successfully",
  "data": {
    "registration": {
      "_id": "65reg456...",
      "eventId": "65event123...",
      "userId": "65user789...",
      "teamId": null,
      "status": "registered",
      "createdAt": "2026-02-08T12:00:00.000Z"
    }
  }
}
```

**Error Cases:**
- 400: Already registered
- 404: Event not found
- 401: Not authenticated

**Frontend Actions:**
- Change "Register" button to "Registered" (disabled)
- Show success toast/notification

---

#### **GET /api/event/registered-events**
**Purpose:** Get all events user has registered for  
**Auth Required:** Yes

**Response (200):**
```json
{
  "status": 200,
  "message": "Registered events retrieved successfully",
  "data": {
    "events": [
      {
        "registrationId": "65reg456...",
        "_id": "65event123...",
        "name": "Code Sprint",
        "department": "CSE",
        "category": "Offline",
        "description": "48-hour hackathon...",
        "posterUrl": "https://example.com/poster.jpg",
        "date": "2026-03-15T00:00:00.000Z",
        "time": "10:00 AM",
        "venue": "Main Auditorium",
        "registrationStatus": "registered",
        "registrationDate": "2026-02-08T12:00:00.000Z"
      }
    ],
    "totalRegisteredEvents": 5
  }
}
```

**Frontend Actions:**
- Display registered events on `/my-events` page
- Show registration date and status

---

### **4. Payment Management**

#### **POST /api/Upload-Payment-Info**
**Purpose:** Upload payment screenshot  
**Auth Required:** Yes

**Request:** `multipart/form-data`
```
Content-Type: multipart/form-data

Fields:
- screenshot: [File] (Image file)
- TXNID: "TXN123456789"
- amount: 500
- passType: "EVENT" | "PAPER" | "IDEATHON"
```

**Response (201):**
```json
{
  "status": 201,
  "message": "Payment uploaded successfully. Awaiting verification.",
  "data": {
    "_id": "65pay123...",
    "userId": "65user789...",
    "TXNID": "TXN123456789",
    "amount": 500,
    "passType": "EVENT",
    "status": "PENDING",
    "createdAt": "2026-02-08T12:30:00.000Z"
  }
}
```

**Validation Rules:**
- Max 3 payments per user
- Unique TXNID (no duplicates)
- Screenshot is required

**Frontend Actions:**
- Show file upload form
- Display payment status after upload
- Show "Awaiting verification" message

---

#### **GET /api/View-All-Payments**
**Purpose:** View all payment submissions (Admins only)  
**Auth Required:** Yes (Role: PaymentAdmin)

**Response (200):**
```json
{
  "status": 200,
  "message": "Payments fetched",
  "data": [
    {
      "_id": "65pay123...",
      "userId": {
        "_id": "65user789...",
        "name": "John Doe",
        "email": "john@example.com",
        "phoneNo": "9876543210",
        "collegeId": "65college456..."
      },
      "TXNID": "TXN123456789",
      "amount": 500,
      "passType": "EVENT",
      "screenshotUrl": "base64EncodedImageString...",
      "screenshotMimeType": "image/png",
      "status": "PENDING",
      "createdAt": "2026-02-08T12:30:00.000Z",
      "updatedAt": "2026-02-08T12:30:00.000Z"
    }
  ]
}
```

**Frontend Actions:**
- Display admin payment dashboard
- Show table with user details, amount, status
- Display screenshot as image: `data:${mimeType};base64,${screenshotUrl}`
- Add "Approve" / "Reject" buttons

---

#### **PUT /api/Update-Payment-Status/:paymentId**
**Purpose:** Approve/Reject payment (Admins only)  
**Auth Required:** Yes (Role: PaymentAdmin)

**URL Parameters:**
- `paymentId` - Payment ID to update

**Request Body:**
```json
{
  "status": "APPROVED"
}
```
*Valid values: `APPROVED` | `REJECTED`*

**Response (200):**
```json
{
  "status": 200,
  "message": "Payment status updated successfully",
  "data": {
    "_id": "65pay123...",
    "status": "APPROVED",
    // ... other payment fields
  }
}
```

---

### **5. College Management**

#### **GET /api/college/all**
**Purpose:** Get all colleges  
**Auth Required:** No

**Response (200):**
```json
{
  "status": 200,
  "message": "Colleges fetched successfully",
  "data": [
    {
      "_id": "65college123...",
      "name": "Anna University",
      "isVerified": true,
      "totalCount": 245,
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
  ]
}
```

**Frontend Actions:**
- Use in signup form dropdown
- Display college name (not ID) in profile

---

#### **POST /api/college/create**
**Purpose:** Create new college  
**Auth Required:** No (might need admin in future)

**Request Body:**
```json
{
  "name": "New Engineering College"
}
```

---

#### **PUT /api/college/update/:id**
**Purpose:** Update college details  
**Auth Required:** TBD (Admin)

**URL Parameters:**
- `id` - College ID

**Request Body:**
```json
{
  "name": "Updated College Name",
  "isVerified": true,
  "totalCount": 300
}
```

---

#### **DELETE /api/college/delete/:id**
**Purpose:** Delete college  
**Auth Required:** TBD (Admin)

**URL Parameters:**
- `id` - College ID

---

## 🎨 Frontend Components Recommendations

### **1. Authentication Components**
```
/components/auth/
  - LoginForm.jsx
  - SignupForm.jsx
  - ForgotPasswordForm.jsx
  - ResetPasswordForm.jsx
```

### **2. Event Components**
```
/components/events/
  - EventCard.jsx (for listing)
  - EventDetail.jsx (full event view)
  - EventRegistrationButton.jsx
  - EventForm.jsx (create/edit - admin)
```

### **3. User Components**
```
/components/user/
  - ProfileCard.jsx
  - QRCodeDisplay.jsx
  - PaymentUploadForm.jsx
  - PaymentHistoryTable.jsx
  - RegisteredEventsList.jsx
```

### **4. Admin Components**
```
/components/admin/
  - PaymentApprovalTable.jsx
  - EventManagementTable.jsx
  - CollegeManagementPanel.jsx
```

### **5. Layout Components**
```
/components/layout/
  - Navbar.jsx (with conditional admin links)
  - Footer.jsx
  - ProtectedRoute.jsx (HOC for auth)
  - RoleBasedRoute.jsx (HOC for role check)
```

---

## 🔒 Frontend Auth Context Structure

```javascript
// contexts/AuthContext.js
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: (email, password) => {},
  logout: () => {},
  signup: (userData) => {},
  refreshProfile: () => {},
  isLoading: false,
});
```

---

## 📊 State Management Recommendations

### **User State**
- `user` - User object from login/profile
- `isAuthenticated` - Boolean
- `role` - User role for conditional rendering

### **Events State**
- `allEvents` - List of all events
- `myEvents` - User's created events (organizers)
- `registeredEvents` - User's registered events

### **Payment State**
- `paymentHistory` - User's payments
- `allPayments` - Admin view of all payments

---

## 🚦 Error Handling

### **Standard Response Format**
```json
{
  "status": 200-500,
  "message": "Human-readable message",
  "data": null | {} | []
}
```

### **Common Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (wrong role/permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `422` - Unprocessable Entity
- `500` - Server Error

### **Frontend Error Display**
- Show `response.data.message` in toast/alert
- Handle 401 by redirecting to `/login`
- Handle 403 by showing "Access Denied" page

---

## 🔄 API Call Examples (Fetch/Axios)

### **Login Example**
```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:8080/api/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important for cookies
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.status === 200) {
    setUser(data.data);
    return true;
  }
  throw new Error(data.message);
};
```

### **Protected API Call Example**
```javascript
const getProfile = async () => {
  const response = await fetch('http://localhost:8080/api/user/profile', {
    method: 'GET',
    credentials: 'include', // Sends cookies
  });
  
  const data = await response.json();
  return data;
};
```

### **File Upload Example**
```javascript
const uploadPayment = async (file, txnId, amount, passType) => {
  const formData = new FormData();
  formData.append('screenshot', file);
  formData.append('TXNID', txnId);
  formData.append('amount', amount);
  formData.append('passType', passType);
  
  const response = await fetch('http://localhost:8080/api/Upload-Payment-Info', {
    method: 'POST',
    credentials: 'include',
    body: formData // Don't set Content-Type for FormData
  });
  
  return await response.json();
};
```

---

## 📝 Important Notes

1. **CORS Configuration:** Backend allows origin `http://${HOST}:3030` - update if frontend port differs

2. **Credentials:** Always include `credentials: 'include'` in fetch/axios for cookie-based auth

3. **Image Handling:**
   - QR Code: Display directly as `<img src={qrCodeBase64} />`
   - Payment Screenshot: `<img src={`data:${mimeType};base64,${screenshot}`} />`

4. **Date Formatting:** Backend returns ISO strings - format in frontend using libraries like `date-fns` or `moment`

5. **Role-Based Rendering:**
   ```javascript
   {user.role === 'EventOrganizer' && <Link to="/admin/events">Manage Events</Link>}
   {user.role === 'PaymentAdmin' && <Link to="/admin/payments">Payments</Link>}
   ```

6. **Loading States:** Handle loading for all API calls to improve UX

7. **Validation:** Implement client-side validation matching backend requirements

8. **Payment Status:** 
   - `PENDING` - Yellow/Warning state
   - `APPROVED` - Green/Success state
   - `REJECTED` - Red/Error state

---

## 🎯 Recommended Development Flow

### **Phase 1: Core Pages**
1. Setup Next.js project with TypeScript (optional)
2. Create Auth Context
3. Build Login/Signup pages
4. Implement Protected Routes
5. Build All Events page (public)

### **Phase 2: User Features**
6. User Dashboard
7. Event Registration flow
8. Profile page with QR code
9. Payment upload page

### **Phase 3: Admin Features**
10. Event Organizer dashboard
11. Create/Edit event forms
12. Payment Admin dashboard
13. Payment approval system

### **Phase 4: Polish**
14. Error handling
15. Loading states
16. Responsive design
17. Toast notifications

---

## 🔗 Quick Reference URLs

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/user/signup` | POST | ❌ | Register user |
| `/api/user/login` | POST | ❌ | Login |
| `/api/user/logout` | POST | ✅ | Logout |
| `/api/user/profile` | GET | ✅ | Get profile + QR |
| `/api/verify` | GET | ❌ | Email verification |
| `/api/event/all` | GET | ❌ | List all events |
| `/api/event/register/:id` | POST | ✅ | Register for event |
| `/api/event/registered-events` | GET | ✅ | My registrations |
| `/api/event/create` | POST | ✅🔑 | Create event (Organizer) |
| `/api/event/my-events` | GET | ✅🔑 | My created events (Organizer) |
| `/api/Upload-Payment-Info` | POST | ✅ | Upload payment |
| `/api/View-All-Payments` | GET | ✅🔑 | View payments (PaymentAdmin) |
| `/api/college/all` | GET | ❌ | List colleges |

Legend:  
✅ = Auth Required  
🔑 = Specific Role Required  
❌ = No Auth

---

## 💡 Frontend Tips

1. **Environment Variables:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

2. **API Service Layer:**
   Create a centralized API service file to avoid repeating fetch logic

3. **Type Safety:**
   Define TypeScript interfaces matching backend models

4. **Form Libraries:**
   Consider `react-hook-form` + `zod` for validation

5. **UI Components:**
   Use component library like Shadcn, Material-UI, or Chakra UI

---

**Last Updated:** February 8, 2026  
**Backend Version:** 1.0  
**Maintained By:** Backend Team

For questions or clarifications, contact the backend team! 🚀
