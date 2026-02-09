# UI Design Conventions - Todo App Frontend

## Color Theme
- **Primary**: #4F46E5 (Indigo) - Main actions, buttons, highlights
- **Secondary**: #FBBF24 (Amber) - Accents and secondary elements
- **Background**: #F3F4F6 (Light Gray) - Page background
- **Card Background**: #FFFFFF (White) - Task cards and forms
- **Text Colors**: 
  - #111827 (Dark) - Primary text
  - #6B7280 (Gray) - Secondary text
  - #9CA3AF (Light Gray) - Placeholder text

## Priority Color Coding
- **High Priority**: #EF4444 (Red)
- **Medium Priority**: #FBBF24 (Amber/Yellow)
- **Low Priority**: #10B981 (Green)

## Component Styling Guidelines

### Task Cards
- White background with shadow (`shadow-md`)
- Rounded corners (`rounded-lg`)
- Hover effect: elevated shadow (`hover:shadow-lg`)
- Smooth transitions (`transition-all duration-300`)
- Completed tasks: reduced opacity (60%)
- Priority badges: rounded pills with color-coded backgrounds

### Forms
- White background with larger shadow (`shadow-lg`)
- Rounded corners (`rounded-lg`)
- Input fields:
  - Border with focus ring (`focus:ring-2 focus:ring-indigo-500`)
  - Rounded (`rounded-lg`)
  - Padding: `px-4 py-3`
  - Placeholder text in gray-400

### Buttons
- Gradient backgrounds for primary actions (`bg-gradient-to-r from-indigo-500 to-indigo-600`)
- Hover states with darker gradients
- Smooth transitions (`transition-all duration-200`)
- Shadow effects (`shadow-md hover:shadow-lg`)
- Icon buttons for actions (✓, ✎, ✕)

### Layout
- Max width container: `max-w-5xl mx-auto`
- Consistent padding: `px-4 py-8`
- Responsive spacing with gap utilities
- Scrollable task list with max height

## Responsive Design
- Mobile-first approach
- Grid layouts for form fields (`grid grid-cols-2 gap-4`)
- Flexible containers with proper padding
- Touch-friendly button sizes (minimum `py-2.5`)

## Animations & Transitions
- All interactive elements have `transition-all`
- Duration: 200ms for buttons, 300ms for cards
- Smooth hover effects on all clickable elements
- Focus rings for accessibility

## Accessibility
- Proper label associations
- Focus states on all interactive elements
- Semantic HTML structure
- Color contrast ratios meet WCAG standards
- Keyboard navigation support

## Filter System
- Three states: All, Active, Completed
- Active filter highlighted with primary color
- Inactive filters: white background with hover state
- Task counts displayed in each filter button

## Empty States
- Centered content with icon
- Helpful messaging
- Contextual suggestions based on filter state
