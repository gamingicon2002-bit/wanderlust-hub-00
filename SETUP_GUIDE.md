# 🚀 Admin Panel Setup Guide

## Step 1: Login to Admin Panel

1. Open your app and navigate to `/admin/login`
2. Use these credentials:
   - **Email:** `admin@travel.com`
   - **Password:** `Travel@2024`
3. You'll be redirected to the Admin Dashboard

## Step 2: Add Content via Admin Panel

### Packages
1. Click **Packages** tab → **Add Package**
2. Fill in: Name, Destination, Duration, Price, Description
3. Add **Main Image URL** (paste any public image URL)
4. Add additional images (one URL per line)
5. Add itinerary items (one per line)
6. Toggle **Featured** to show on homepage
7. Click **Save**

### Vehicles
1. Click **Vehicles** tab → **Add Vehicle**
2. Fill in: Name, Type (car/tempo/bus), Capacity, Price per km
3. Add image URL, description, and features (one per line)
4. Click **Save**

### Destinations
1. Click **Destinations** tab → **Add Destination**
2. Fill in: Name, Best Time to Visit, Description
3. Add image URL and highlights (one per line)
4. Click **Save**

### Special Offers
1. Click **Offers** tab → **Add Offer**
2. Fill in: Title, Description, Discount %, Valid dates
3. Add image URL, toggle **Active**
4. Click **Save**

### Gallery
1. Click **Gallery** tab → **Add Image**
2. Paste image URL, add title and category
3. Set sort order for display order
4. Click **Save**

## Step 3: View Your Site

- Go to `/` (homepage) — Featured packages appear here
- Go to `/packages` — All packages listed
- Go to `/vehicles` — All vehicles listed
- Go to `/destinations` — All destinations listed
- Go to `/offers` — Active special offers
- Go to `/gallery` — Photo gallery

## Image Tips

- Use **direct image URLs** (ending in .jpg, .png, .webp)
- Free image sources: [Unsplash](https://unsplash.com), [Pexels](https://pexels.com)
- Right-click an image → "Copy image address" to get the URL

## Database Structure

| Table | Purpose |
|-------|---------|
| `packages` | Tour packages with pricing, itinerary |
| `vehicles` | Fleet vehicles with capacity, features |
| `destinations` | Travel destinations with highlights |
| `special_offers` | Promotional offers with dates |
| `gallery` | Photo gallery with categories |
| `user_roles` | Admin role management (RBAC) |

## Security

- All tables have **Row Level Security (RLS)** enabled
- Public users can **read** all content
- Only **admin** users can create, update, or delete content
- Admin role is verified server-side via `has_role()` function
