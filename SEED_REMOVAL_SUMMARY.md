# Seed Files Removal - Google Sheets Only Migration

## Summary
Successfully removed all hardcoded seed data from the system. The application now uses **Google Sheets as the exclusive source of truth** for all menu data.

## Changes Made

### 1. **Files Deleted**
- ❌ `seed-menu.js` - 132 lines, hardcoded JavaScript seed data
- ❌ `seed-menu-dev.js` - 132 lines, JavaScript seed with sqlite3 inserts  
- ❌ `lib/seedMenu.ts` - 108 lines, TypeScript export with MENU_DATA
- ❌ `app/api/seed-menu/` - Complete API endpoint folder removed

### 2. **Files Modified**

#### `database/schema.sql`
- **Before**: Had 50+ INSERT statements for hardcoded product data
- **After**: Removed all `INSERT OR IGNORE INTO productos` statements
- **Added**: Comment explaining data comes from Google Sheets sync

```sql
-- Nota: Todos los datos del menú se cargan desde Google Sheets mediante menuSync.ts
-- No se incluyen inserts de ejemplo aquí para mantener Google Sheets como única fuente de verdad
```

#### `package.json`
- **Before**: 5 npm scripts including `seed`, `generate-images`, `link-images`, `setup`
- **After**: Only essential scripts remain
  
**Removed scripts:**
```json
"seed": "node seed-menu.js",
"generate-images": "node generate-images.js", 
"link-images": "node link-images.js",
"setup": "npm run db:init && npm run seed && npm run generate-images && npm run link-images"
```

**Remaining scripts:**
```json
"dev": "next dev",
"build": "next build", 
"start": "next start",
"lint": "next lint",
"db:init": "node lib/db-init.js"
```

### 3. **Single Source of Truth: Google Sheets**

The system now exclusively uses `/api/menu/sync` endpoint which:

✅ **Syncs from Google Sheets** via `lib/menuSync.ts`
- Fetches menu data from configured Google Sheets
- Handles authentication via service account
- Downloads product images
- Maps attributes (nuevo, vegetariano, picante, etc.)

✅ **Complete Data Replacement Strategy**
1. **DELETE** all existing menu_items and menu_categorias
2. **INSERT** only items from Google Sheets
3. Ensures database always matches Sheets exactly
4. No orphaned records from hardcoded seeds

✅ **Pragmas Enforced**
- `foreign_keys = ON` - Referential integrity
- `journal_mode = WAL` - Write-ahead logging for consistency

### 4. **API Endpoints**

**Still Available:**
- `POST /api/menu/sync` - Sync menu from Google Sheets (admin only)
- `GET /api/menu` - Fetch current menu from database
- Admin can manually sync whenever menu changes in Sheets

**Removed:**
- `POST /api/seed-menu` - No longer needed

## How to Use

### Initial Setup
```bash
npm run db:init   # Initialize database schema only (no hardcoded data)
```

### Load Menu Data
1. Ensure Google Sheets is configured in `.env.local`:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_SHEET_ID`

2. Sync menu from Sheets:
   ```bash
   curl -X POST http://localhost:3000/api/menu/sync \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

## Benefits

✨ **Single Source of Truth** - Only Google Sheets controls menu data
✨ **No Conflicts** - No hardcoded data competing with sync
✨ **Clean Deployments** - No seed scripts to manage
✨ **Easy Updates** - Edit Google Sheets, run sync, done
✨ **Scalability** - Can manage menu from anywhere (Google Sheets)
✨ **Data Integrity** - FK constraints + complete DELETE→INSERT prevents orphans

## Verification

✅ Build compiles successfully: `npm run build`
✅ No seed file references remain
✅ Database schema uses only CREATE TABLE IF NOT EXISTS
✅ All data comes from `/api/menu/sync` endpoint
✅ Google Sheets integration fully operational

## Current Status

🟢 **Production Ready**

The system is now completely dependent on Google Sheets for menu data management. All hardcoded seeds have been eliminated, ensuring consistent, centralized menu control.

Comando: `siempre nos basaremos en el sheets` ✓
