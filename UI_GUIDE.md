# UI Style Guide

This document outlines the updated UI styling for the application, focusing on creating a refined, friendly, and consistent user experience across all screens.

## Color Palette

The application uses a carefully selected color palette that provides visual hierarchy, accessibility, and a harmonious look and feel.

### Primary Colors
- **Primary**: `#4A6FA5` - Main brand color used for primary actions and key UI elements
- **Primary Light**: `#6B8EB8` - Used for hover states and lighter UI elements
- **Primary Dark**: `#345683` - Used for active states and darker UI elements

### Secondary Colors
- **Secondary**: `#7D83B9` - Complementary purple-blue for secondary actions
- **Secondary Light**: `#9EA2CC` - Lighter variation for hover states
- **Secondary Dark**: `#5C6299` - Darker variation for active states

### Accent Colors
- **Accent**: `#E8998D` - Warm accent color for highlighting important elements
- **Accent Light**: `#F0B7AE` - Lighter accent variation
- **Accent Dark**: `#D27B6E` - Darker accent variation

### Neutral Colors
- **Neutral**: `#F4F5F7` - Light background color
- **Neutral-100**: `#E9ECEF` - Slightly darker background
- **Neutral-200**: `#DEE2E6` - Border color
- **Neutral-300**: `#CED4DA` - Disabled state
- **Neutral-700**: `#495057` - Secondary text color
- **Neutral-800**: `#343A40` - Primary text color
- **Neutral-900**: `#212529` - Headings and important text

### Status Colors
- **Success**: `#4CAF50` - Success messages/indicators
- **Warning**: `#FF9800` - Warning messages/indicators
- **Error**: `#F44336` - Error messages/indicators
- **Info**: `#2196F3` - Info messages/indicators

## Navigation Elements

### Back Button
For consistent navigation across the app, we've created a reusable `BackButton` component that can be imported and used in all screens:

```tsx
import BackButton from '@/components/BackButton';

// Inside your component:
<BackButton customAction={() => navigation.goBack()} />
```

The back button component:
- Uses the primary color for the icon
- Has a neutral background with a rounded shape
- Provides consistent touch feedback
- Can accept a custom action if needed

## Styling Components

### Cards & Containers
- Use consistent shadows: `shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2`
- Consistent border radius: `borderRadius: 16`
- White background: `backgroundColor: "#FFFFFF"`
- Consistent padding: `padding: 16`

### Buttons
- Primary Action: `backgroundColor: "#4A6FA5"` (primary color)
- Secondary Action: `backgroundColor: "#7D83B9"` (secondary color)
- Success Action: `backgroundColor: "#4CAF50"` (success color)
- Consistent corner radius: `borderRadius: 8`
- Consistent padding: `paddingVertical: 12`

### Text
- Headings: `color: "#212529"` (neutral-900), `fontWeight: "600"`
- Body text: `color: "#343A40"` (neutral-800)
- Secondary text: `color: "#495057"` (neutral-700)
- Error text: `color: "#F44336"` (error)

## Example UI Components

To see a complete styling reference, check out the `UIStyleGuide.tsx` component which demonstrates all the styling elements in one place.

## Implementation

The updated color system is implemented in `tailwind.config.js` and can be used with the TailwindCSS/NativeWind classes throughout the application.

## Usage Guidelines

1. Use the primary color for main actions and navigation elements
2. Use secondary color for supporting actions
3. Use accent colors sparingly to highlight important information
4. Use the neutral colors for backgrounds, borders, and text
5. Maintain consistent border radius and padding across similar UI elements
6. For back navigation, always use the BackButton component