---
name: database
description: Documentation of the Supabase SQL schema, triggers, and RLS policies for the Recipe App.
---

# Database Skill

## Schema Overview

### Tables
- **`profiles`**: Links `auth.users` to a display name.
  - `id` (UUID, PK, FK to auth.users)
  - `display_name` (Text)
- **`recipes`**: Metadata for each recipe.
  - `id` (UUID, PK)
  - `title` (Text)
  - `description` (Text)
  - `prep_time` (Int), `cook_time` (Int), `servings` (Int)
  - `image_url` (Text)
  - `created_by` (UUID, FK to profiles)
  - `created_at` (Timestamp)
- **`ingredients`**: Numeric amounts and units.
  - `id` (UUID, PK)
  - `recipe_id` (UUID, FK)
  - `amount` (Numeric), `unit` (Text), `name` (Text), `sort_order` (Int)
- **`instructions`**: Step-by-step directions.
  - `id` (UUID, PK)
  - `recipe_id` (UUID, FK)
  - `step_number` (Int), `description` (Text)
- **`tags`**: Categories like "Baking" or "Italian".
  - `id` (UUID, PK), `name` (Text), `category` (Text)
- **`recipe_tags`**: Many-to-Many junction table.

## Automation & Triggers
- **`handle_new_user()`**: A trigger on `auth.users` that automatically creates a record in `public.profiles` upon signup, using the email or provided display name.

## Security (RLS)
- **Read Access**: All tables (`profiles`, `recipes`, `ingredients`, `instructions`, `tags`, `recipe_tags`) have `FOR SELECT` policies allowing public read access (`USING (true)`).
- **Write Access**: 
  - `recipes`: Users can only `INSERT`, `UPDATE`, or `DELETE` recipes where `created_by` matches their `auth.uid()`.
  - `ingredients`/`instructions`: Users can manage these records ONLY if they own the parent recipe (verified via `EXISTS` check on the `recipes` table).

## Storage (Buckets)
- **`recipe-images`**: Public bucket for storing recipe photos.
  - **Path Strategy**: Store images under `recipes/` with unique filenames.
  - **Policies**:
    - `SELECT`: Public access to everyone.
    - `INSERT`: Allowed for authenticated users.
    - `UPDATE`/`DELETE`: Allowed for the owner of the file.
