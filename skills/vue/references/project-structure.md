# Project Structure

## Directory Layout
- `src/components/ui/`: Atomic ShadCn components.
- `src/components/recipes/`: Feature-specific recipe components.
- `src/composables/`: Reusable business logic (e.g., `useRecipeScaling`).
- `src/types/`: Centralized TypeScript definitions.
- `src/lib/`: API clients (Supabase) and utilities.

## Rules
1. **Logic in Composables**: Complex math (like scaling) or API calls belong in composables.
2. **Atomic UI**: Don't modify `src/components/ui/` files directly; wrap them if needed.
3. **Data Fetching Strategy**: 
   - Use a specialized composable (e.g., `useRecipeSearch`) to fetch and index all recipe metadata via Fuse.js.
   - Separate "Summary" interfaces (for the list) from "Full" interfaces (for the detail page) in `src/types/` to prevent over-fetching.
