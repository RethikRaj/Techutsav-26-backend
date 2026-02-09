# 📱 Detailed Frontend Implementation Guide - Techutsav '26

## 🏗️ Architecture Overview

**Backend:** Node.js + Express API (Port 8080)  
**Frontend:** Next.js SPA (Separate Deployment)  
**Base URL:** `http://${HOST}:8080/api`  
**Authentication:** Cookie-based (HttpOnly cookies with JWT)

---

## 🎨 Page-by-Page Implementation Guide

### **1. Landing Page (`/`)**

#### **Page Sections:**

**🔴 Hero Section**
- Title: "Techutsav '26" 
- Subtitle: "Annual Tech Festival"
- Date: March FEb 27, 2026
- CTA Buttons: "View Events", "Register Now"

**🟠 Event Highlights (Top 3 Events)**
- **Data Source:** `GET /api/event/all`
- **Filter Logic:**
```javascript
// Get first 3 events, sorted by date
const highlightEvents = allEvents
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .slice(0, 3);
```
- **Display:** Event poster, name, department, date

**🟡 Statistics Section**
- **Total Events:** `allEvents.length`
- **Total Registrations:** Sum of all user registrations (client calculation)
- **Participating Colleges:** Unique count from user registrations

**🟢 About Section**
- Static content about Techutsav

#### **API Calls Required:**
```javascript
useEffect(() => {
  // Get all events for highlights
  fetch('/api/event/all', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      setAllEvents(data.data.events);
      setEventCount(data.data.events.length);
    });
}, []);
```

---

### **2. All Events Page (`/events`)**

#### **Page Sections:**

**🔴 Filter Sidebar**
- **Department Filter:** Extract unique departments from events
- **Category Filter:** Online/Offline
- **Team Event Filter:** Solo/Team events
- **Date Range:** Filter by event date

```javascript
// Extract filter options from events
const departments = [...new Set(events.map(e => e.department))];
const categories = ['All', 'Online', 'Offline'];
const eventTypes = ['All', 'Solo Events', 'Team Events'];

// Filter logic
const filteredEvents = events.filter(event => {
  const departmentMatch = selectedDepartment === 'All' || event.department === selectedDepartment;
  const categoryMatch = selectedCategory === 'All' || event.category === selectedCategory;
  const typeMatch = selectedEventType === 'All' || 
    (selectedEventType === 'Solo Events' && !event.isTeamEvent) ||
    (selectedEventType === 'Team Events' && event.isTeamEvent);
  
  return departmentMatch && categoryMatch && typeMatch;
});
```

**🟠 Search Bar**
- Search by event name, description, or department
```javascript
const searchedEvents = filteredEvents.filter(event =>
  event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
  event.department.toLowerCase().includes(searchTerm.toLowerCase())
);
```

**🟡 Events Grid**
- **Layout:** 3 columns on desktop, 1 on mobile
- **Each Card Shows:**
  - Event poster (`posterUrl`)
  - Event name
  - Department badge
  - Category badge (Online/Offline)
  - Date & Time
  - Team/Solo indicator
  - "View Details" button
  - "Register" button (if authenticated)

**🟢 Sort Options**
```javascript
const sortEvents = (events, sortBy) => {
  switch(sortBy) {
    case 'date-asc':
      return events.sort((a, b) => new Date(a.date) - new Date(b.date));
    case 'date-desc':
      return events.sort((a, b) => new Date(b.date) - new Date(a.date));
    case 'name-asc':
      return events.sort((a, b) => a.name.localeCompare(b.name));
    case 'department':
      return events.sort((a, b) => a.department.localeCompare(b.department));
    default:
      return events;
  }
};
```

#### **API Calls Required:**
```javascript
useEffect(() => {
  // Get all events
  fetch('/api/event/all', { credentials: 'include' })
    .then(res => res.json())
    .then(data => setEvents(data.data.events));
    
  // Get user's registered events (if logged in)
  if (isAuthenticated) {
    fetch('/api/event/registered-events', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setRegisteredEvents(data.data.events.map(e => e._id)));
  }
}, [isAuthenticated]);
```

---

### **3. Event Details Page (`/events/[eventId]`)**

#### **Page Sections:**

**🔴 Event Header**
- Event poster (large)
- Event name
- Department
- Category badge
- Date & Time
- Venue (if offline)

**🟠 Event Information Grid**
- **Description:** Full event description
- **Rules:** `ruleDescription` field
- **Prizes:** `prizesInfo` field
- **Contact:** `orgContact` (organizer contact)
- **Team Info:** Show max team size if `isTeamEvent` is true

**🟡 Registration Section**
- Check if user is already registered
- Show appropriate button state
```javascript
const isRegistered = registeredEvents.includes(eventId);
const buttonText = isRegistered ? 'Already Registered' : 'Register Now';
const buttonDisabled = isRegistered;
```

**🟢 Action Buttons**
- **Register/Already Registered Button**
- **Download Rulebook:** Link to `ruleBookUrl`
- **Share Event:** Copy event URL

#### **API Calls Required:**
```javascript
useEffect(() => {
  // Get specific event details
  fetch('/api/event/all', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      const event = data.data.events.find(e => e._id === eventId);
      setEvent(event);
    });
    
  // Check if user is registered
  if (isAuthenticated) {
    fetch('/api/event/registered-events', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const isReg = data.data.events.some(e => e._id === eventId);
        setIsRegistered(isReg);
      });
  }
}, [eventId, isAuthenticated]);

// Registration handler
const handleRegister = async () => {
  const res = await fetch(`/api/event/register/${eventId}`, {
    method: 'POST',
    credentials: 'include'
  });
  const data = await res.json();
  if (data.status === 200) {
    setIsRegistered(true);
    toast.success('Registered successfully!');
  }
};
```

---

### **4. User Dashboard (`/dashboard`)**

#### **Page Sections:**

**🔴 Welcome Header**
- User's name from `user.name`
- Quick stats: Registered events count, Payment status

**🟠 Quick Actions Grid**
- **View Profile** → `/profile`
- **Browse Events** → `/events`
- **My Events** → `/my-events`
- **Upload Payment** → `/payment`

**🟡 Recent Registrations (Last 3)**
- **Data Source:** `GET /api/event/registered-events`
- **Filter Logic:**
```javascript
const recentRegistrations = registeredEvents
  .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
  .slice(0, 3);
```

**🟢 Payment Status Summary**
- **Data Source:** User profile (`GET /api/user/profile`)
- **Display:** Payment count, status breakdown
```javascript
const paymentSummary = {
  total: paymentInfo?.length || 0,
  approved: paymentInfo?.filter(p => p.status === 'APPROVED').length || 0,
  pending: paymentInfo?.filter(p => p.status === 'PENDING').length || 0,
  rejected: paymentInfo?.filter(p => p.status === 'REJECTED').length || 0
};
```

#### **API Calls Required:**
```javascript
useEffect(() => {
  // Get user profile with payment info
  fetch('/api/user/profile', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      setUserProfile(data.data);
      setPaymentInfo(data.data.paymentInfo || []);
    });
    
  // Get registered events
  fetch('/api/event/registered-events', { credentials: 'include' })
    .then(res => res.json())
    .then(data => setRegisteredEvents(data.data.events));
}, []);
```

---

### **5. User Profile Page (`/profile`)**

#### **Page Sections:**

**🔴 Profile Information Card**
- Name, Email, Phone, College, Year, Department
- **Data Source:** `GET /api/user/profile`

**🟠 QR Code Section**
- Display QR code for event check-in
- **Data Source:** `qrCode` field from profile API
```javascript
<img 
  src={userProfile.qrCode} 
  alt="User QR Code" 
  className="w-64 h-64"
/>
```

**🟡 Payment History Table**
- **Data Source:** `paymentInfo` from profile
- **Columns:** Transaction ID, Amount, Type, Status, Date
```javascript
const paymentRows = paymentInfo?.map(payment => ({
  txnId: payment.TXNID,
  amount: `₹${payment.amount}`,
  type: payment.passType,
  status: payment.status,
  date: new Date(payment.createdAt).toLocaleDateString(),
  statusColor: {
    'APPROVED': 'green',
    'PENDING': 'yellow', 
    'REJECTED': 'red'
  }[payment.status]
}));
```

**🟢 Event Registrations Summary**
- Total registered events
- Link to detailed view (`/my-events`)

#### **API Calls Required:**
```javascript
useEffect(() => {
  // Single API call gets everything needed
  fetch('/api/user/profile', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      setUserProfile(data.data);
      setPaymentHistory(data.data.paymentInfo || []);
    });
}, []);
```

---

### **6. My Registered Events (`/my-events`)**

#### **Page Sections:**

**🔴 Stats Header**
- Total registered events
- Upcoming events count
- Past events count

**🟠 Filter Tabs**
```javascript
const filterEvents = (events, filter) => {
  const now = new Date();
  switch(filter) {
    case 'all':
      return events;
    case 'upcoming':
      return events.filter(e => new Date(e.date) >= now);
    case 'past':
      return events.filter(e => new Date(e.date) < now);
    case 'online':
      return events.filter(e => e.category === 'Online');
    case 'offline':
      return events.filter(e => e.category === 'Offline');
    default:
      return events;
  }
};
```

**🟡 Events List/Grid**
- **Data Source:** `GET /api/event/registered-events`
- **Each Card Shows:**
  - Event poster (thumbnail)
  - Event name & department
  - Registration date
  - Event date & time
  - Category & venue
  - Registration status
  - "View Details" button

**🟢 Search and Sort**
```javascript
// Search functionality
const searchRegisteredEvents = registeredEvents.filter(event =>
  event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  event.department.toLowerCase().includes(searchTerm.toLowerCase())
);

// Sort options
const sortOptions = [
  { value: 'reg-date-desc', label: 'Registration Date (Latest)' },
  { value: 'reg-date-asc', label: 'Registration Date (Oldest)' },
  { value: 'event-date-asc', label: 'Event Date (Upcoming)' },
  { value: 'event-date-desc', label: 'Event Date (Latest)' },
  { value: 'name-asc', label: 'Event Name (A-Z)' }
];
```

#### **API Calls Required:**
```javascript
useEffect(() => {
  fetch('/api/event/registered-events', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      setRegisteredEvents(data.data.events);
      setTotalCount(data.data.totalRegisteredEvents);
    });
}, []);
```

---

### **7. Payment Upload Page (`/payment`)**

#### **Page Sections:**

**🔴 Payment Instructions**
- Bank details for payment
- Payment types: EVENT, PAPER, IDEATHON
- Amount information per type

**🟠 Upload Form**
- **Transaction ID:** Text input (required, unique)
- **Amount:** Number input (required)
- **Pass Type:** Dropdown (EVENT/PAPER/IDEATHON)
- **Screenshot:** File input (image only)

**🟡 Form Validation**
```javascript
const validateForm = () => {
  const errors = {};
  
  if (!txnId.trim()) errors.txnId = 'Transaction ID is required';
  if (!amount || amount <= 0) errors.amount = 'Valid amount is required';
  if (!passType) errors.passType = 'Pass type is required';
  if (!screenshot) errors.screenshot = 'Payment screenshot is required';
  
  // File validation
  if (screenshot) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(screenshot.type)) {
      errors.screenshot = 'Only JPG, JPEG, PNG files allowed';
    }
    if (screenshot.size > 5 * 1024 * 1024) { // 5MB limit
      errors.screenshot = 'File size must be less than 5MB';
    }
  }
  
  return errors;
};
```

**🟢 Previous Payments List**
- **Data Source:** Payment history from profile
- Show last 3 payments with status
- Link to view all in profile

#### **API Calls Required:**
```javascript
// Form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('screenshot', screenshot);
  formData.append('TXNID', txnId);
  formData.append('amount', amount);
  formData.append('passType', passType);
  
  try {
    const res = await fetch('/api/Upload-Payment-Info', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    
    const data = await res.json();
    if (data.status === 201) {
      toast.success('Payment uploaded successfully!');
      setTxnId('');
      setAmount('');
      setPassType('');
      setScreenshot(null);
    }
  } catch (error) {
    toast.error('Upload failed. Please try again.');
  }
};

// Load previous payments
useEffect(() => {
  fetch('/api/user/profile', { credentials: 'include' })
    .then(res => res.json())
    .then(data => setPreviousPayments(data.data.paymentInfo || []));
}, []);
```

---

### **8. Event Organizer Dashboard (`/admin/events`)**

#### **Page Sections:**

**🔴 Stats Overview**
- **Total Events Created:** Count of organizer's events
- **Total Registrations:** Sum across all events
- **Recent Activity:** New registrations today

**🟠 Quick Actions**
- **Create New Event** → `/admin/events/create`
- **View All Events** → Stay on same page
- **Export Data** → Download registrations CSV

**🟡 My Events Table**
- **Data Source:** `GET /api/event/my-events`
- **Columns:** Event Name, Department, Category, Registrations, Date, Actions
- **Actions:** Edit, View Details, View Registrations

```javascript
// Get registration count per event (client-side calculation needed)
// Note: This requires a new API endpoint or modification to existing one
const eventsWithStats = myEvents.map(event => ({
  ...event,
  registrationCount: 0 // Would need separate API call or backend modification
}));
```

**🟢 Filter and Search**
```javascript
// Filter by category, department, date range
const filteredMyEvents = myEvents.filter(event => {
  const categoryMatch = filterCategory === 'All' || event.category === filterCategory;
  const departmentMatch = filterDepartment === 'All' || event.department === filterDepartment;
  const dateMatch = !dateRange.start || new Date(event.date) >= new Date(dateRange.start);
  
  return categoryMatch && departmentMatch && dateMatch;
});
```

#### **API Calls Required:**
```javascript
useEffect(() => {
  // Get organizer's events
  fetch('/api/event/my-events', { credentials: 'include' })
    .then(res => res.json())
    .then(data => setMyEvents(data.data.events));
    
  // TODO: Need new API endpoint for registration counts per event
  // GET /api/event/:eventId/registrations-count
}, []);
```

---

### **9. Payment Admin Dashboard (`/admin/payments`)**

#### **Page Sections:**

**🔴 Payment Statistics**
- **Total Payments:** All payments count
- **Pending Reviews:** Payments with status 'PENDING'
- **Approved Today:** Payments approved today
- **Total Revenue:** Sum of approved payments

```javascript
const paymentStats = useMemo(() => {
  const total = allPayments.length;
  const pending = allPayments.filter(p => p.status === 'PENDING').length;
  const approvedToday = allPayments.filter(p => 
    p.status === 'APPROVED' && 
    new Date(p.updatedAt).toDateString() === new Date().toDateString()
  ).length;
  const revenue = allPayments
    .filter(p => p.status === 'APPROVED')
    .reduce((sum, p) => sum + p.amount, 0);
    
  return { total, pending, approvedToday, revenue };
}, [allPayments]);
```

**🟠 Filter Controls**
- **Status Filter:** All, Pending, Approved, Rejected
- **Pass Type Filter:** All, EVENT, PAPER, IDEATHON
- **Date Range Filter:** Last 7 days, Last 30 days, Custom
- **College Filter:** Dropdown of all colleges

**🟡 Payments Table**
- **Data Source:** `GET /api/View-All-Payments`
- **Columns:** 
  - User Info (Name, Email, College)
  - Transaction Details (TXNID, Amount, Type)
  - Screenshot (thumbnail with modal)
  - Status with action buttons
  - Dates (Created, Updated)

```javascript
// Filter logic
const filteredPayments = allPayments.filter(payment => {
  const statusMatch = statusFilter === 'All' || payment.status === statusFilter;
  const typeMatch = typeFilter === 'All' || payment.passType === typeFilter;
  const collegeMatch = collegeFilter === 'All' || payment.userId.collegeId === collegeFilter;
  
  return statusMatch && typeMatch && collegeMatch;
});

// Search functionality
const searchedPayments = filteredPayments.filter(payment =>
  payment.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  payment.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  payment.TXNID.toLowerCase().includes(searchTerm.toLowerCase())
);
```

**🟢 Bulk Actions**
- **Bulk Approve:** Select multiple pending payments
- **Bulk Reject:** Select multiple pending payments
- **Export:** Download filtered payments as CSV

#### **API Calls Required:**
```javascript
useEffect(() => {
  // Get all payments (admin only)
  fetch('/api/View-All-Payments', { credentials: 'include' })
    .then(res => res.json())
    .then(data => setAllPayments(data.data));
    
  // Get colleges for filter dropdown
  fetch('/api/college/all', { credentials: 'include' })
    .then(res => res.json())
    .then(data => setColleges(data.data));
}, []);

// Update payment status
const updatePaymentStatus = async (paymentId, status) => {
  try {
    const res = await fetch(`/api/Update-Payment-Status/${paymentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status })
    });
    
    const data = await res.json();
    if (data.status === 200) {
      // Update local state
      setAllPayments(prev => 
        prev.map(p => p._id === paymentId ? { ...p, status } : p)
      );
      toast.success(`Payment ${status.toLowerCase()} successfully`);
    }
  } catch (error) {
    toast.error('Failed to update payment status');
  }
};
```

---

## 🧩 Reusable Components Guide

### **EventCard Component**
```javascript
const EventCard = ({ event, isRegistered, onRegister, showRegisterButton = true }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="border rounded-lg p-4 shadow-md">
      <img src={event.posterUrl} alt={event.name} className="w-full h-48 object-cover rounded" />
      
      <div className="mt-3">
        <h3 className="font-bold text-lg">{event.name}</h3>
        <p className="text-sm text-gray-600">{event.department}</p>
        
        <div className="flex gap-2 mt-2">
          <span className={`px-2 py-1 text-xs rounded ${
            event.category === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {event.category}
          </span>
          
          {event.isTeamEvent && (
            <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
              Team (Max {event.maxTeamSize})
            </span>
          )}
        </div>
        
        <div className="mt-2 text-sm">
          <p><strong>Date:</strong> {formatDate(event.date)}</p>
          <p><strong>Time:</strong> {event.time}</p>
          {event.venue && <p><strong>Venue:</strong> {event.venue}</p>}
        </div>
        
        <div className="mt-4 flex gap-2">
          <Link href={`/events/${event._id}`} className="btn btn-outline">
            View Details
          </Link>
          
          {showRegisterButton && (
            <button
              onClick={() => onRegister(event._id)}
              disabled={isRegistered}
              className={`btn ${isRegistered ? 'btn-disabled' : 'btn-primary'}`}
            >
              {isRegistered ? 'Registered' : 'Register'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

### **PaymentStatusBadge Component**
```javascript
const PaymentStatusBadge = ({ status }) => {
  const statusConfig = {
    'PENDING': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    'APPROVED': { color: 'bg-green-100 text-green-800', icon: '✅' },
    'REJECTED': { color: 'bg-red-100 text-red-800', icon: '❌' }
  };

  const config = statusConfig[status] || statusConfig['PENDING'];

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {status}
    </span>
  );
};
```

### **SearchAndFilter Component**
```javascript
const SearchAndFilter = ({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFilterChange,
  sortBy,
  onSortChange 
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(filters).map(([key, { options, value }]) => (
          <select
            key={key}
            value={value}
            onChange={(e) => onFilterChange(key, e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ))}
        
        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="date-asc">Date (Upcoming)</option>
          <option value="date-desc">Date (Latest)</option>
          <option value="department">Department</option>
        </select>
      </div>
    </div>
  );
};
```

---

## 📊 Data Management Patterns

### **Custom Hooks for API Calls**

```javascript
// useEvents.js
export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/event/all', { credentials: 'include' });
      const data = await response.json();
      
      if (data.status === 200) {
        setEvents(data.data.events);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
};

// useUserRegistrations.js
export const useUserRegistrations = () => {
  const { isAuthenticated } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/event/registered-events', { 
        credentials: 'include' 
      });
      const data = await response.json();
      
      if (data.status === 200) {
        setRegistrations(data.data.events);
      }
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const registerForEvent = async (eventId) => {
    try {
      const response = await fetch(`/api/event/register/${eventId}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.status === 200) {
        // Refresh registrations
        await fetchRegistrations();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Registration failed' };
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  return { 
    registrations, 
    loading, 
    refetch: fetchRegistrations, 
    registerForEvent,
    isRegistered: (eventId) => registrations.some(r => r._id === eventId)
  };
};
```

### **Client-Side Data Processing Utils**

```javascript
// utils/dataProcessing.js

export const processEventsData = (events) => {
  return {
    // Get unique departments for filters
    departments: [...new Set(events.map(e => e.department))],
    
    // Get events by category
    onlineEvents: events.filter(e => e.category === 'Online'),
    offlineEvents: events.filter(e => e.category === 'Offline'),
    
    // Get team vs solo events
    teamEvents: events.filter(e => e.isTeamEvent),
    soloEvents: events.filter(e => !e.isTeamEvent),
    
    // Get upcoming events
    upcomingEvents: events.filter(e => new Date(e.date) >= new Date()),
    
    // Get events by department
    eventsByDepartment: events.reduce((acc, event) => {
      acc[event.department] = acc[event.department] || [];
      acc[event.department].push(event);
      return acc;
    }, {})
  };
};

export const processPaymentData = (payments) => {
  return {
    totalAmount: payments.reduce((sum, p) => sum + (p.status === 'APPROVED' ? p.amount : 0), 0),
    
    byStatus: {
      pending: payments.filter(p => p.status === 'PENDING'),
      approved: payments.filter(p => p.status === 'APPROVED'),
      rejected: payments.filter(p => p.status === 'REJECTED')
    },
    
    byType: payments.reduce((acc, payment) => {
      acc[payment.passType] = acc[payment.passType] || [];
      acc[payment.passType].push(payment);
      return acc;
    }, {}),
    
    recentPayments: payments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  };
};

export const searchAndFilterEvents = (events, { searchTerm, department, category, eventType, sortBy }) => {
  let filtered = events;

  // Search
  if (searchTerm) {
    filtered = filtered.filter(event =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Filter by department
  if (department && department !== 'All') {
    filtered = filtered.filter(event => event.department === department);
  }

  // Filter by category
  if (category && category !== 'All') {
    filtered = filtered.filter(event => event.category === category);
  }

  // Filter by event type
  if (eventType && eventType !== 'All') {
    if (eventType === 'Team Events') {
      filtered = filtered.filter(event => event.isTeamEvent);
    } else if (eventType === 'Solo Events') {
      filtered = filtered.filter(event => !event.isTeamEvent);
    }
  }

  // Sort
  if (sortBy) {
    filtered = sortEvents(filtered, sortBy);
  }

  return filtered;
};

const sortEvents = (events, sortBy) => {
  switch(sortBy) {
    case 'date-asc':
      return [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    case 'date-desc':
      return [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
    case 'name-asc':
      return [...events].sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return [...events].sort((a, b) => b.name.localeCompare(a.name));
    case 'department':
      return [...events].sort((a, b) => a.department.localeCompare(b.department));
    default:
      return events;
  }
};
```

---

## 🔍 Complete Page Implementation Examples

### **Events Page Full Implementation**

```javascript
// pages/events.js
import { useState, useEffect, useMemo } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useUserRegistrations } from '../hooks/useUserRegistrations';
import { useAuth } from '../contexts/AuthContext';
import { processEventsData, searchAndFilterEvents } from '../utils/dataProcessing';
import EventCard from '../components/EventCard';
import SearchAndFilter from '../components/SearchAndFilter';
import LoadingSpinner from '../components/LoadingSpinner';

const EventsPage = () => {
  const { isAuthenticated } = useAuth();
  const { events, loading, error } = useEvents();
  const { registrations, registerForEvent, isRegistered } = useUserRegistrations();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEventType, setSelectedEventType] = useState('All');
  const [sortBy, setSortBy] = useState('date-asc');

  // Process events data for filters
  const eventData = useMemo(() => processEventsData(events), [events]);

  // Apply filters and search
  const filteredEvents = useMemo(() => {
    return searchAndFilterEvents(events, {
      searchTerm,
      department: selectedDepartment,
      category: selectedCategory,
      eventType: selectedEventType,
      sortBy
    });
  }, [events, searchTerm, selectedDepartment, selectedCategory, selectedEventType, sortBy]);

  // Filter configurations
  const filters = {
    department: {
      options: ['All', ...eventData.departments],
      value: selectedDepartment
    },
    category: {
      options: ['All', 'Online', 'Offline'],
      value: selectedCategory
    },
    eventType: {
      options: ['All', 'Solo Events', 'Team Events'],
      value: selectedEventType
    }
  };

  const handleFilterChange = (filterType, value) => {
    switch(filterType) {
      case 'department':
        setSelectedDepartment(value);
        break;
      case 'category':
        setSelectedCategory(value);
        break;
      case 'eventType':
        setSelectedEventType(value);
        break;
    }
  };

  const handleRegister = async (eventId) => {
    const result = await registerForEvent(eventId);
    // Handle result (show toast, etc.)
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Events</h1>
      
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={handleFilterChange}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredEvents.length} of {events.length} events
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <EventCard
            key={event._id}
            event={event}
            isRegistered={isAuthenticated && isRegistered(event._id)}
            onRegister={handleRegister}
            showRegisterButton={isAuthenticated}
          />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No events found matching your criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedDepartment('All');
              setSelectedCategory('All');
              setSelectedEventType('All');
            }}
            className="mt-4 btn btn-primary"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
```

---

