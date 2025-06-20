# PostHog Analytics Implementation

This document describes the PostHog analytics implementation for the AutoVad car marketplace web application.

## Overview

PostHog analytics has been integrated to track user behavior and interactions throughout the application. All events are sent to PostHog with detailed properties for comprehensive analysis.

## Configuration

PostHog is configured in `instrumentation-client.ts` with the following settings:
- API Host: `/ingest` (proxied through Next.js)
- UI Host: `https://eu.posthog.com`
- Page view capture: On history change
- Page leave capture: Enabled
- Exception capture: Enabled
- Debug mode: Enabled in development

## Analytics Events

### 1. Authentication Events (`auth_action`)

**Tracked in:** `AuthForm.tsx`, `useAuth.ts`

**Properties:**
- `method`: 'email' | 'google'
- `action`: 'register' | 'login' | 'logout'
- `success`: boolean
- `error`: string (optional)
- `timestamp`: ISO string

**Examples:**
```typescript
trackAuth({
  method: 'email',
  action: 'login',
  success: true,
});

trackAuth({
  method: 'google',
  action: 'register',
  success: false,
  error: 'User already exists',
});
```

### 2. Search Events (`search_performed`)

**Tracked in:** `CarFilters.tsx`

**Properties:**
- `query`: string
- `filters`: Record<string, any> (current filter state)
- `results_count`: number
- `timestamp`: ISO string

**Example:**
```typescript
trackSearch({
  query: 'BMW X5',
  filters: { make: 'BMW', year: '2020', priceRange: '50k - 100k' },
  resultsCount: 15,
});
```

### 3. Filter Events (`filter_applied`)

**Tracked in:** `CarFilters.tsx`

**Properties:**
- `filter_type`: string (make, year, fuel_type, body_type, location, price_range)
- `filter_value`: any
- `previous_filters`: Record<string, any>
- `timestamp`: ISO string

**Example:**
```typescript
trackFilter({
  filterType: 'make',
  filterValue: 'BMW',
  previousFilters: { make: 'All', year: '2020' },
});
```

### 4. Car View Events (`car_viewed`)

**Tracked in:** `CarCard.tsx`, `CarPost.tsx`

**Properties:**
- `car_id`: string
- `car_title`: string
- `car_brand`: string
- `car_model`: string
- `car_year`: number
- `car_price`: number
- `source`: 'search' | 'browse' | 'liked' | 'recommendation'
- `timestamp`: ISO string

**Example:**
```typescript
trackCarView({
  carId: 'car-123',
  carTitle: 'BMW X5 2020',
  carBrand: 'BMW',
  carModel: 'X5',
  carYear: 2020,
  carPrice: 75000,
  source: 'search',
});
```

### 5. Like Events (`car_liked`)

**Tracked in:** `CarCard.tsx`, `CarPost.tsx`

**Properties:**
- `car_id`: string
- `car_title`: string
- `action`: 'like' | 'unlike'
- `timestamp`: ISO string

**Example:**
```typescript
trackLike({
  carId: 'car-123',
  carTitle: 'BMW X5 2020',
  action: 'like',
});
```

### 6. Share Events (`car_shared`)

**Tracked in:** `CarPost.tsx`

**Properties:**
- `car_id`: string
- `car_title`: string
- `platform`: 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'copy_link'
- `timestamp`: ISO string

**Example:**
```typescript
trackShare({
  carId: 'car-123',
  carTitle: 'BMW X5 2020',
  platform: 'copy_link',
});
```

### 7. Comment Events (`comment_action`)

**Tracked in:** `CarPost.tsx`

**Properties:**
- `car_id`: string
- `car_title`: string
- `comment_length`: number (optional)
- `action`: 'add' | 'edit' | 'delete'
- `timestamp`: ISO string

**Example:**
```typescript
trackComment({
  carId: 'car-123',
  carTitle: 'BMW X5 2020',
  commentLength: 150,
  action: 'add',
});
```

### 8. Car Post Events (`car_post_action`)

**Tracked in:** `carService.ts`

**Properties:**
- `car_id`: string (optional for create)
- `car_title`: string
- `car_brand`: string
- `car_model`: string
- `car_year`: number
- `car_price`: number
- `has_images`: boolean
- `has_videos`: boolean
- `images_count`: number
- `videos_count`: number
- `action`: 'create' | 'edit' | 'delete'
- `success`: boolean
- `error`: string (optional)
- `timestamp`: ISO string

**Example:**
```typescript
trackCarPost({
  carId: 'car-123',
  carTitle: 'BMW X5 2020',
  carBrand: 'BMW',
  carModel: 'X5',
  carYear: 2020,
  carPrice: 75000,
  hasImages: true,
  hasVideos: false,
  imagesCount: 5,
  videosCount: 0,
  action: 'create',
  success: true,
});
```

## Utility Methods

The analytics module also provides utility methods:

### User Identification
```typescript
Analytics.identify(userId, properties);
Analytics.setUserProperties(properties);
```

### Page Views
```typescript
Analytics.trackPageView(pageName, properties);
```

### Error Tracking
```typescript
Analytics.trackError(error, context);
```

## Implementation Details

### Intersection Observer for Car Views
Car view events are tracked using Intersection Observer to detect when a car post comes into view, ensuring accurate view tracking without requiring user clicks.

### Debounced Search Tracking
Search events are tracked when the search query changes, providing insights into user search behavior.

### Filter State Tracking
Filter events track both the current filter value and previous filter state, enabling analysis of filter usage patterns.

### Error Handling
All analytics calls are wrapped in try-catch blocks to prevent analytics errors from affecting the user experience.

## PostHog Dashboard Setup

To set up dashboards in PostHog, create the following insights:

1. **User Engagement**
   - Car views per user
   - Search frequency
   - Filter usage patterns

2. **Conversion Funnel**
   - Registration → Login → Car View → Like → Share

3. **Content Performance**
   - Most viewed cars
   - Most liked cars
   - Most shared cars

4. **User Behavior**
   - Search queries
   - Filter combinations
   - Session duration

## Privacy Considerations

- All events include timestamps for temporal analysis
- Car IDs are tracked for engagement analysis
- No personally identifiable information is sent in event properties
- User identification is handled separately through PostHog's identify method

## Testing

Analytics events can be tested in development mode by:
1. Opening browser developer tools
2. Checking the Network tab for requests to `/ingest`
3. Verifying event properties in the request payload
4. Using PostHog's debug mode to see events in real-time 