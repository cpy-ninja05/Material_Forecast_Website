# 🚀 Render Deployment - Fix "Not Found" Error

## ✅ Confirmed Working Locally

The `_redirects` file is correctly configured and works in localhost. The issue is **Render-specific**.

## 🔍 The Problem with Render Static Sites

Render static sites need **explicit configuration** to handle SPA routing. The `_redirects` file alone may not be enough.

## ✅ Solution: Configure Render Dashboard Manually

### Option 1: Update Render Dashboard Settings (Easiest)

1. **Go to Render Dashboard:**
   - https://dashboard.render.com
   - Select your **frontend service** (material-forecast-website)

2. **Go to Settings:**
   - Scroll down to **"Redirects/Rewrites"** section
   - Or look for **"Routes"** section

3. **Add This Route Rule:**
   ```
   Source: /*
   Destination: /index.html
   Type: Rewrite (200)
   ```

4. **Save and Redeploy**

---

### Option 2: Use render.yaml Configuration

I've created a `render.yaml` file in your project root. To use it:

1. **Go to Render Dashboard**
2. **Create New → Blueprint**
3. **Connect your GitHub repo**
4. **Select `render.yaml`**
5. **Deploy**

The `render.yaml` includes:
```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

---

### Option 3: Add Headers File (Alternative)

If `_redirects` isn't working, Render might need a `_headers` file:

Create `frontend/public/_headers`:
```
/*
  X-Robots-Tag: all
```

---

## 🔧 Render Build Settings

**Verify these settings in your Render dashboard:**

### Frontend Service Settings:
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Auto-Deploy:** Yes

### Important: Ensure Render Rebuilds

After pushing `_redirects`:
1. Check Render dashboard
2. Verify build was triggered
3. Check build logs - should show files copied to `dist/`
4. Look for `_redirects` in the output

---

## 🧪 Debug: Check Deployed Files

To verify `_redirects` is actually deployed:

1. **Go to Render Dashboard**
2. **Your Frontend Service → Shell** (if available)
3. Run: `ls -la /opt/render/project/src/dist/`
4. **Should see `_redirects` file**

Or check build logs for:
```
Copying files to dist/...
  _redirects
  index.html
  assets/...
```

---

## 🎯 Render-Specific Quirks

### Issue 1: Render Ignores `_redirects` for Static Sites

**Solution:** Use the dashboard "Routes" configuration instead

### Issue 2: `_redirects` Works for Netlify but Not Render

**Solution:** Render uses different syntax. Need to configure in dashboard or use `render.yaml`

### Issue 3: Build Succeeds but Routes Don't Work

**Solution:** Clear Render cache and trigger manual deploy:
- Dashboard → Service → Manual Deploy → Clear build cache & deploy

---

## 📋 Quick Fix Steps

Since it works locally, do this:

### Step 1: Force Render to Reconfigure

```bash
# 1. Add render.yaml to git
git add render.yaml
git commit -m "Add render.yaml with SPA routing config"
git push origin main
```

### Step 2: Manual Deploy on Render

1. Go to Render Dashboard
2. Click "Manual Deploy" → "Clear build cache & deploy"
3. Wait for build to complete

### Step 3: If Still Not Working - Dashboard Config

1. Dashboard → Your Frontend Service → Settings
2. Scroll to "Redirects/Rewrites" or "Routes"
3. Add manually:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`
4. Save and deploy

---

## 🆘 Alternative: Switch to Hash Router

If all else fails, change React Router to use hash routing (works everywhere):

```jsx
// In main.jsx or App.jsx
import { HashRouter } from 'react-router-dom';

// Change from:
<BrowserRouter>...</BrowserRouter>

// To:
<HashRouter>...</HashRouter>
```

URLs will look like: `https://yoursite.com/#/projects`

---

## ✅ Verification

After applying the fix:

1. Visit: `https://material-forecast-website.onrender.com/projects`
2. Reload page (F5)
3. Should load correctly ✅

Test all routes:
- `/teams`
- `/suppliers`
- `/inventory`
- `/forecasting`

---

## 📞 Support

If none of these work, Render's support can help:
- https://render.com/docs/deploy-vite
- https://render.com/docs/redirects-rewrites

Render's Vite documentation specifically mentions this issue!

---

## 🎯 Most Likely Solution

**Go to Render Dashboard → Settings → Add Rewrite Rule:**
```
/* → /index.html (Rewrite)
```

This is the most reliable way for Render static sites!

