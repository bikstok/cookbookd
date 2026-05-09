# Shared Recipe App - Frontend Agents Guide

## Technologies
- **Vue 3** (v3.5.32) - Composition API with `<script setup>`
- **Vite** (v8.0.4) - Build tool
- **TypeScript** (v6.0.2) - Strict typing
- **Tailwind CSS v4** (v4.2.2) - CSS-first styling
- **ShadCn Vue** - UI components
- **Supabase** (v2.105.1) - Backend, Auth, and Storage
- **Vercel** - Deployment & Hosting
- **Fuse.js** - Lightweight fuzzy search for frontend-side searching

## Database Schema (Recipe Catalog)

### Tables
1. **`profiles`**: Maps `auth.users` to display names.
   - Columns: `id` (UUID, PK), `display_name` (Text).
2. **`recipes`**: Main recipe metadata.
   - Columns: `id` (UUID, PK), `title` (Text), `description` (Text), `prep_time` (Int), `cook_time` (Int), `servings` (Int), `image_url` (Text), `created_by` (UUID, FK to profiles), `created_at` (Timestamp).
3. **`ingredients`**: Numeric amounts for UI scaling.
   - Columns: `id` (UUID, PK), `recipe_id` (UUID, FK), `amount` (Numeric), `unit` (Text), `name` (Text), `sort_order` (Int).
4. **`instructions`**: Step-by-step directions.
   - Columns: `id` (UUID, PK), `recipe_id` (UUID, FK), `step_number` (Int), `description` (Text).
5. **`tags`**: Categories (e.g., "French", "Italian").
   - Columns: `id` (UUID, PK), `name` (Text), `category` (Text).
6. **`recipe_tags`**: Many-to-Many junction.

## Key Features & Logic
- **Instant Frontend Search**: Load recipe metadata (titles, tags, ingredient names) on initial app mount. Use **Fuse.js** for fuzzy matching. This ensures zero-latency searching and handles typos gracefully.
- **Serving Scaler**: Ingredient amounts must be reactive to a `targetServings` multiplier: `displayAmount = (baseAmount / baseServings) * targetServings`.
- **Creator Attribution**: Display the `display_name` from the `profiles` table for each recipe.

## Workflow Rules
1. **Strict TypeScript**: No `any`. Use interfaces in `src/types/`.
2. **Data Access Pattern**:
   - Fetch "Searchable Summaries" (Title, Tags, Ingredient Names) for the main catalog upfront.
   - Lazy-load full instructions, detailed amounts, and comments only when a specific recipe is opened to save bandwidth.
3. **Component Architecture**: Use ShadCn Vue for base UI. Place feature components in `src/components/recipes/`.
4. **Styling**: Use Tailwind 4 semantic variables (`bg-background`, `text-foreground`).
5. **Project Structure**: Follow the structure defined in `skills/vue/references/project-structure.md`.
