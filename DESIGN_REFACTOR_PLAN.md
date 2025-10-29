# Black & White Design Refactor Plan
## Shadcn/UI Aesthetic Implementation

## Overview
Converting entire frontend from pink/purple theme to clean black/white design with shadcn/ui principles.

---

## Design Principles (Shadcn/UI)

### Color Palette
- **Primary**: Black (#000000) or Gray-900
- **Secondary**: White (#FFFFFF)
- **Borders**: Gray-200 (#E5E7EB)
- **Text Primary**: Gray-900 (#111827)
- **Text Secondary**: Gray-600 (#4B5563)
- **Backgrounds**: White or Gray-50 (#F9FAFB)
- **Hover States**: Gray-100 (#F3F4F6)
- **Active States**: Gray-900 or Black

### Component Patterns
1. **Buttons**
   - Primary: `bg-black text-white hover:bg-gray-900`
   - Secondary: `bg-white border border-gray-300 hover:bg-gray-100`
   - Ghost: `hover:bg-gray-100`

2. **Cards**
   - Background: `bg-white`
   - Border: `border border-gray-200`
   - Shadow: `shadow-sm` (subtle)

3. **Chat Messages**
   - User: `bg-black text-white` (sender)
   - Bot: `bg-gray-100 text-gray-900` (receiver)
   - No gradients

4. **Headers**
   - Background: `bg-white border-b border-gray-200`
   - Or: `bg-gray-50 border-b border-gray-200`

5. **Icons**
   - Color: `text-gray-900` or `text-black`

6. **Focus/Active States**
   - Ring: `ring-2 ring-gray-900`
   - Outline: `outline-none`

---

## Files to Refactor (5 files total)

### 1. **index.css** - Design Tokens
**Changes:**
```css
/* OLD */
--primary: 326 78% 68%; /* pink */
--ring: 326 78% 68%;
--sidebar-primary: 326 78% 68%;
--sidebar-ring: 326 78% 68%;

/* NEW */
--primary: 0 0% 9%; /* gray-900/black */
--ring: 0 0% 9%;
--sidebar-primary: 0 0% 9%;
--sidebar-ring: 0 0% 9%;
```

**Impact:** Global theme colors affect all shadcn components

---

### 2. **ChatInterface.tsx** - Main Chat Page
**Current Issues:**
- Pink/purple gradient header
- Purple bot icon
- Pink/purple gradients on avatars
- Pink/purple user message bubbles
- Purple hover states
- Pink/purple send button

**Refactor To:**
```typescript
// Header
from: bg-gradient-to-r from-pink-50 to-purple-50
to:   bg-white border-b border-gray-200

// Bot icon
from: text-purple-600
to:   text-black

// Bot avatar
from: bg-gradient-to-r from-pink-500 to-purple-500
to:   bg-black

// User messages
from: bg-gradient-to-r from-pink-500 to-purple-500 text-white
to:   bg-black text-white

// Bot messages
Keep: bg-gray-100 text-gray-900 (already good)

// Loading state avatar
from: bg-gradient-to-r from-pink-500 to-purple-500
to:   bg-black

// Suggested questions hover
from: hover:bg-purple-50 hover:border-purple-300
to:   hover:bg-gray-100 hover:border-gray-300

// Send button
from: bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600
to:   bg-black hover:bg-gray-900
```

---

### 3. **ChatBot.tsx** - Floating Chat Widget
**Current Issues:**
- Pink/purple gradient floating button
- Pink/purple header
- Pink/purple user messages
- Pink/purple send button

**Refactor To:**
```typescript
// Floating button
from: bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600
to:   bg-black hover:bg-gray-900

// Header
from: bg-gradient-to-r from-pink-500 to-purple-500
to:   bg-black (matches bot identity)

// User messages
from: bg-gradient-to-r from-pink-500 to-purple-500
to:   bg-black text-white

// Send button
from: bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600
to:   bg-black hover:bg-gray-900
```

---

### 4. **Index.tsx** - Landing Page
**Current Issues:**
- Pink/purple/blue gradient backgrounds

**Refactor To:**
```typescript
// Loading screen
from: bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50
to:   bg-gray-50 or bg-white

// Loading spinner
from: bg-gradient-to-r from-pink-500 to-purple-500
to:   bg-black (or animate with border-gray-900)

// Landing page background
from: bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50
to:   bg-white or bg-gray-50
```

---

### 5. **SymptomLogger.tsx** - Health Tracking
**Current Issues:**
- Pink flow indicator
- Purple mood indicator

**Refactor To:**
```typescript
// Light flow
from: bg-pink-300
to:   bg-gray-300

// Anxious mood
from: bg-purple-300
to:   bg-gray-400
```

---

## Additional Shadcn/UI Improvements

### Typography
- Use consistent font weights (400, 500, 600, 700)
- Ensure proper text hierarchy
- Use text-sm, text-base, text-lg consistently

### Spacing
- Consistent padding: p-4, p-6, p-8
- Consistent gaps: gap-2, gap-4, gap-6
- Consistent margins: mb-4, mb-6, mb-8

### Borders
- All borders: `border-gray-200`
- Consistent border-radius: rounded-lg, rounded-xl

### Shadows
- Use sparingly: `shadow-sm`, `shadow-md`
- Cards: `shadow-sm`
- Modals: `shadow-lg`

### Hover States
- Buttons: `hover:bg-gray-100` (light) or `hover:bg-gray-900` (dark)
- Cards: `hover:shadow-md` (subtle lift)
- Links: `hover:underline`

---

## Implementation Order

1. **CSS Tokens** (index.css) - Foundation for everything
2. **ChatInterface** - Most complex component
3. **ChatBot** - Similar to ChatInterface
4. **Index page** - Simple background changes
5. **SymptomLogger** - Simple color swaps
6. **Review & Test** - Ensure consistency

---

## Testing Checklist

After refactoring, verify:
- [ ] No pink/purple colors anywhere
- [ ] All buttons are black/white
- [ ] All hover states are gray
- [ ] Chat messages have proper contrast
- [ ] Text is readable (black on white, white on black)
- [ ] Borders are subtle gray
- [ ] No gradients (shadcn doesn't use them)
- [ ] Consistent spacing throughout
- [ ] Mobile responsive (test on small screens)
- [ ] Dark mode works (if implemented)

---

## Expected Result

A clean, minimal, professional design that:
- ✅ Uses only black, white, and shades of gray
- ✅ Follows shadcn/ui design patterns
- ✅ Has excellent readability and contrast
- ✅ Feels modern and polished
- ✅ Is consistent across all pages
- ✅ Maintains all functionality
- ✅ Looks professional for a health app
