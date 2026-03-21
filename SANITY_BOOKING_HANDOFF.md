# Sanity CMS Schema Handoff: Dynamic Booking System

Hello Agent! You have been tasked with building the Sanity CMS schema for a decoupled frontend application. **You do not have access to the frontend repository.**

Your objective is to create three specific Sanity schemas (`bookingCategory`, `bookingPackage`, `bookingAddOn`) that perfectly map to the frontend's strict TypeScript interfaces.

---

## The Target TypeScript Interfaces (Frontend)

The frontend relies strictly on the following types. Your Sanity schemas must be designed so that when the frontend queries the data, it matches this shape exactly:

```typescript
export type BookingAddOn = {
  id: string; // Will map to Sanity Slug
  name: string;
  price: number;
  description?: string;
};

export type BookingPackage = {
  id: string; // Will map to Sanity Slug
  name: string;
  price: number;
  duration?: string;
  description?: string;
  includes: string[];
};

export type BookingCategory = {
  id: string; // Will map to Sanity Slug
  name: string;
  shortName: string;
  description: string;
  image: string; // Will map to the resolved image URL
  packages: BookingPackage[];
  addOns?: BookingAddOn[];
};
```

---

## Required Sanity Schemas to Create

Please create the following three schema files in your Sanity repository:

### 1. `bookingCategory` (Document)

This must be a top-level document type in the Sanity Studio.

- `name` (String): Full name of the category (e.g., "Wedding Videography").
- `slug` (Slug): Generated from `name`. (The frontend will use `slug.current` as the `id`).
- `shortName` (String): A highly condensed version (e.g., "Wedding Video").
- `description` (Text): A 1-2 sentence compelling description.
- `image` (Image): Standard Sanity image field.
- `packages` (Array): An array of `bookingPackage` objects.
- `addOns` (Array): An array of `bookingAddOn` objects (Optional).

### 2. `bookingPackage` (Object)

This should be defined as a reusable `object` type (not a document) since packages exclusively belong to their parent category.

- `name` (String): Name of the package (e.g., "Gold Package").
- `slug` (Slug): Generated from `name`. (The frontend uses this as the `id`).
- `price` (Number): The numeric flat price of the package in USD.
- `duration` (String, Optional): Timeframe or scope label (e.g., "4-5 minute highlight reel").
- `description` (Text, Optional): A short descriptive summary.
- `includes` (Array of Strings): A distinct list of features/deliverables included in the package.

### 3. `bookingAddOn` (Object)

This should also be a reusable `object` type within the `bookingCategory` document.

- `name` (String): Name of the add-on (e.g., "Drone Footage", "Extra Hour").
- `slug` (Slug): Generated from `name`. (The frontend uses this as the `id`).
- `price` (Number): Numeric price in USD.
- `description` (String, Optional): Context label, typically used for variable pricing like "From $50/hr".

---

## Implementation Instructions for Sanity Agent

1. **Create Types:** Build the three schemas above in the Sanity studio environment and ensure they are successfully exported and added to the `schemaTypes` array.
2. **Review Validation:** Make sure required fields (like `name`, `price`, `slug`, `includes`) have standard Sanity validation (`Rule => Rule.required()`).
3. **No Frontend Work:** You do not need to write GROQ fetch wrappers or UI code, as the frontend repository will handle data hydration separately. Just focus on producing the flawless Studio schemas!
