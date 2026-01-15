# Reminders App UI Components

Beautiful, fully functional reminder app UI built with React, Next.js, and Tailwind CSS.

## 🎨 Features

### Dashboard

- **Stats Cards** - Overview of total, active, completed, and overdue reminders
- **Search** - Real-time search across title and description
- **Filters** - Toggle between All, Active, and Completed reminders
- **Responsive Design** - Works beautifully on mobile and desktop

### Reminder Cards

- **Visual Status** - Color-coded completion and overdue states
- **Quick Actions** - Edit and delete buttons on each card
- **Checkbox** - Toggle completion status with a single click
- **Timestamps** - Formatted date and time display
- **Overdue Indicators** - Red border and badge for overdue reminders

### Create/Edit Modal

- **Form Validation** - Required fields with proper validation
- **Date Picker** - Native datetime-local input
- **Edit Mode** - Pre-populated form for editing existing reminders
- **Responsive** - Mobile-friendly modal design

## 📁 Components

### `ReminderCard.tsx`

Displays individual reminder with:

- Title, description, and timestamp
- Completion checkbox
- Edit and delete actions
- Overdue and completed badges
- Strike-through styling for completed items

### `ReminderModal.tsx`

Modal form for creating/editing reminders:

- Title input (required)
- Description textarea (optional)
- Date & time picker (required)
- Cancel and Save/Update buttons

### `dashboard/page.tsx`

Main dashboard with:

- Header with logo and user button
- Statistics overview
- Search and filter controls
- Reminders list
- Empty state

## 🎯 Current State (Mock Data)

The app currently uses **mock data** for demonstration. It includes:

- 4 sample reminders
- Full CRUD operations (Create, Read, Update, Delete)
- State management with React hooks
- Real-time filtering and search

## 🔌 API Integration (Next Step)

To integrate with your backend API, update these functions in `dashboard/page.tsx`:

```typescript
// Replace mock data with API calls
const [reminders, setReminders] = useState<Reminder[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchReminders();
}, []);

const fetchReminders = async () => {
  const { getToken } = useAuth();
  const token = await getToken();

  const data = await reminderApi.getAll(token);
  setReminders(data);
  setLoading(false);
};

const handleSave = async (reminderData) => {
  const { getToken } = useAuth();
  const token = await getToken();

  if (editingReminder) {
    await reminderApi.update(token, editingReminder.id, reminderData);
  } else {
    await reminderApi.create(token, reminderData);
  }

  await fetchReminders();
  setIsModalOpen(false);
};

// Similar updates for handleDelete and handleToggleComplete
```

## 🎨 Styling

The UI uses:

- **Tailwind CSS** for utility-first styling
- **Custom colors** - Indigo for primary actions
- **Shadows** - Subtle elevation for cards and modals
- **Transitions** - Smooth hover and click effects
- **Responsive** - Mobile-first design approach

## 🚀 Running the App

```bash
# Start development server
pnpm dev

# Open browser
open http://localhost:5173
```

## 📊 Features Overview

### Implemented ✅

- Create new reminders
- Edit existing reminders
- Delete reminders
- Mark as complete/incomplete
- Search functionality
- Filter by status (All, Active, Completed)
- Statistics dashboard
- Responsive design
- Overdue detection
- Empty states

### Ready for API Integration 🔌

- All CRUD operations use state management
- Ready to replace with async API calls
- Error handling structure in place
- Loading states can be easily added

## 🎭 Mock Data

Current sample reminders include:

1. **Team Meeting** - Future meeting
2. **Finish Project Proposal** - Due today
3. **Doctor Appointment** - Upcoming appointment
4. **Buy Groceries** - Completed task (overdue)

## 💡 Tips

### Adding Loading States

```typescript
const [loading, setLoading] = useState(false);

// Show loading indicator
{
  loading && <div>Loading...</div>;
}
```

### Adding Toast Notifications

Install a toast library like `react-hot-toast`:

```bash
pnpm install react-hot-toast
```

Then add notifications for actions:

```typescript
import toast from "react-hot-toast";

toast.success("Reminder created!");
toast.error("Failed to delete reminder");
```

### Adding Animations

Install Framer Motion:

```bash
pnpm install framer-motion
```

Animate list items:

```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  <ReminderCard ... />
</motion.div>
```

## 🐛 Known Limitations (Mock Mode)

- Data doesn't persist (resets on page reload)
- No server-side validation
- No error handling for failed operations
- No loading states during operations
- No pagination (all reminders loaded at once)

These will be addressed when integrating with the backend API!

## 📝 Next Steps

1. **Connect to Backend**

   - Replace mock data with API calls
   - Add error handling
   - Implement loading states

2. **Enhance UX**

   - Add toast notifications
   - Add loading skeletons
   - Add confirmation dialogs

3. **Additional Features**
   - Recurring reminders
   - Categories/tags
   - Priority levels
   - File attachments
   - Reminder notifications

## 🎉 You're Ready!

The UI is fully functional and ready to use. Simply integrate it with your backend API to have a complete reminder management application!
