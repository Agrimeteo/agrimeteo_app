# Fixes Applied for Crops Display Issue

## Problems Identified

### 🔴 **Problem #1: Incorrect Database Column Names in createCrop**
**Location:** `backend/controllers/cropController.ts` (lines 32-40)

**Issue:** The controller was sending incorrect column names to the database:
```typescript
// ❌ WRONG - before
const cropData = {
    name: cropType.name,              // Column doesn't exist in 'crops' table
    crop_type_id: cropType.id ?? null, // Column doesn't exist, type is wrong
    location: region,
    area: numericArea,
    planting_date: plantingDate,
    expected_harvest: harvestDate,
    notes,
    suitability_score: suitability.score,
    suitability_reasons: suitability.reasons,
    area_warning: suitability.areaWarning
};
```

**Why This Caused Problems:**
- The `crops` table expects `crop_type` (TEXT) not `crop_type_id`
- The `crops` table doesn't have a `name` column - the crop name goes in `crop_type`
- When invalid columns are sent, Supabase either ignores them or throws errors
- This caused crops to not be created properly in the database

**Database Schema (crops table):**
```sql
CREATE TABLE public.crops (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  crop_type TEXT NOT NULL,          -- ✓ Use this for crop name
  planting_date DATE,
  expected_harvest DATE,
  status TEXT DEFAULT 'planted',
  area REAL,
  location TEXT,
  notes TEXT,
  suitability_score INTEGER,        -- ✓ Will be set correctly
  suitability_reasons TEXT[],       -- ✓ Will be set correctly  
  area_warning BOOLEAN,             -- ✓ Will be set correctly
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**✅ FIX APPLIED:**
```typescript
// ✅ CORRECT - after
const cropData = {
    crop_type: cropType.name,  // Use the TEXT column correctly
    location: region,
    area: numericArea,
    planting_date: plantingDate,
    expected_harvest: harvestDate,
    notes,
    suitability_score: suitability.score,
    suitability_reasons: suitability.reasons,
    area_warning: suitability.areaWarning
};
```

---

### 🟡 **Problem #2: Response Field Mapping**
**Location:** `backend/controllers/cropController.ts` (lines 49-52)

**Issue:** While the response mapping was mostly correct, it needed to use `crop.crop_type` instead of `cropType.name`:

**✅ FIX APPLIED:**
```typescript
// Was using:
name: cropType.name,

// Now uses:
name: crop.crop_type,
```

This ensures the frontend `CropManagement` component receives the correct `name` field for:
1. Display purposes
2. Image mapping via `getCropImage(crop.name)`

---

### 🟢 **Problem #3: Limited Crop Image Aliases**
**Location:** `apps/app/src/utils/cropImages.ts`

**Issue:** The crop image mapping only had limited aliases, so new crops (with different name variations) wouldn't find their images:

**✅ FIX APPLIED:**
Added comprehensive aliases including English variations:
```typescript
const aliases: Record<string, string> = {
  // French + English variations
  mais: 'mais', maïs: 'mais', corn: 'mais', maize: 'mais',
  ble: 'ble', blé: 'ble', wheat: 'ble',
  soja: 'soja', soy: 'soja', soybean: 'soja',
  cacao: 'cacao', cocoa: 'cacao',
  banane: 'banane', banana: 'banane', plantain: 'banane',
  tomate: 'tomate', tomato: 'tomate', tomatoes: 'tomate',
  riz: 'riz', rice: 'riz',
  ananas: 'ananas', pineapple: 'ananas',
  arachide: 'arachide', peanut: 'arachide', groundnut: 'arachide',
  avocat: 'avocat', avocado: 'avocat',
  ail: 'ail', garlic: 'ail',
  carotte: 'carotte', carrot: 'carotte',
  choux: 'choux', chou: 'choux', cabbage: 'choux',
  haricot: 'haricot', bean: 'haricot', beans: 'haricot',
  oignon: 'oignon', onion: 'oignon', onions: 'oignon',
  papaye: 'papaye', papaya: 'papaye', papayas: 'papaye',
  pasteque: 'pasteque', pastèque: 'pasteque', watermelon: 'pasteque',
  patate: 'patate', sweet_potato: 'patate', yam: 'patate',
  'pomme de terre': 'pomme de terre', pomme_de_terre: 'pomme de terre',
  potato: 'pomme de terre', potatoes: 'pomme de terre',
};
```

**Also Improved:** The matching algorithm to support word-boundary matching:
```typescript
export const getCropImage = (cropName?: string | null) => {
  if (!cropName) return firstImage;

  const normalizedInput = normalizeCropName(cropName);
  const alias = aliases[normalizedInput] ?? normalizedInput;

  // Direct match
  if (imageMap[alias]) return imageMap[alias];

  // Partial/word match
  const match = Object.entries(imageMap).find(
    ([key]) => 
      alias.includes(key) || 
      key.includes(alias) ||
      key.split(' ').some(word => normalizedInput.includes(word)) ||
      normalizedInput.split(' ').some(word => key.includes(word))
  );
  
  return match ? match[1] : firstImage;
};
```

Now even if a crop name doesn't have an exact image, it will try to match partial words, and if that fails, shows a default image instead of breaking.

---

## Impact Summary

| Issue | Impact | Before | After |
|-------|--------|--------|-------|
| Wrong column names | Crops not created | ❌ No crops visible | ✅ Crops appear |
| Response mapping | Name field missing | ❌ Images don't load | ✅ Images load via getCrop Image() |
| Limited image aliases | Some crops have no image | 🟡 Default image shown | ✅ Better image matching |

---

## Files Modified

1. **`backend/controllers/cropController.ts`**
   - Line 32-40: Fixed `cropData` object field names
   - Line 49-52: Fixed response mapping to use `crop.crop_type`

2. **`apps/app/src/utils/cropImages.ts`**
   - Lines 15-60: Expanded aliases dictionary
   - Lines 61-85: Improved `getCropImage()` matching algorithm

---

## Testing Instructions

### 1. Rebuild and Deploy

```bash
# Backend
cd backend
npm run build

# Frontend
cd apps/app
npm run build
```

### 2. Test Crop Creation

1. Open the app and go to `/add-crop`
2. Fill in the form:
   - Crop Name: `Maïs` (or `mais`, `corn`, `maize`)
   - Region: `Centre`
   - Area: `5` hectares
   - Planting Date: Today
   - Harvest Date: 6 months from now
3. Click "Save Crop"

### 3. Verify Crop Appears

1. Navigate to `/crops` page
2. **Expected Result:** Your newly created crop should appear in a card with:
   - ✅ Crop name displayed
   - ✅ Region badge showing "Centre"
   - ✅ Area showing "5 ha"
   - ✅ Planting date visible
   - ✅ **Image is displayed** (matching image from `image_culture` folder)
   - ✅ Suitability score showing 9/10 for maize in Centre region

### 4. Test Various Crop Names

Try creating crops with different name variations to verify image mapping:
- "Maïs" → Uses mais.jpg
- "Corn" → Uses mais.jpg
- "Tomato" → Uses tomate.jpg
- "Tomate" → Uses tomate.jpg
- "Haricot" → Uses haricot.jpg
- "Bean" → Uses haricot.jpg

### 5. Database Verification (Optional)

If you have Supabase access, verify the `crops` table directly:

```sql
SELECT id, user_id, crop_type, location, area, suitability_score 
FROM public.crops 
WHERE crop_type = 'Maïs'
ORDER BY created_at DESC;
```

Expected columns populated:
- ✅ `crop_type`: "Maïs"
- ✅ `location`: "Centre"
- ✅ `area`: 5.0
- ✅ `suitability_score`: 9
- ✅ `suitability_reasons`: ["Good rainfall", "Suitable soil", "Optimal temperature"]

---

## Additional Notes

### Image Folder Structure
The images are located in:
- **Root:** `image_culture/`
- **Files:** `.jpg` images with crop names
  - Example: `mais.jpg`, `tomate.jpg`, `riz.jpg`, etc.

### How Image Loading Works
1. Frontend build time: `import.meta.glob()` loads all images from `image_culture` folder
2. Crop name is normalized (accents removed, lowercase)
3. Compared against alias map or partial match against available images
4. Fallback image (alphabetically first) shown if no match

### Known Limitations
- Only `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` images are supported
- Image files must be in the `image_culture` folder at the root
- Crop names are case-insensitive but accent-sensitive in the database (stored as entered)
- Frontend normalization handles accents, so "Maïs" and "Mais" both map correctly

---

## Rollback Instructions (If Needed)

If you need to revert these changes:

```bash
git checkout HEAD -- \
  backend/controllers/cropController.ts \
  apps/app/src/utils/cropImages.ts
```

---

## Future Improvements

Consider implementing:
1. **Admin interface** to manage crop-image mappings
2. **Bulk image uploader** for new crop types
3. **A/B testing** for fallback image selection
4. **Image validation** on upload to ensure quality
5. **Cache busting strategy** for image updates

