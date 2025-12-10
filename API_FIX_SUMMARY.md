# JARVIS Report Generation Issue - Root Cause and Fix

## Problem Identified
The JARVIS frontend was unable to generate reports because it was configured to connect to a localhost backend URL (`http://localhost:8002`) instead of the production backend URL.

## Root Causes

1. **Incorrect API URL Configuration**: The `.env` file had `API_URL=http://localhost:8002` instead of the production backend URL
2. **Mismatched Render Configuration**: The `render.yaml` file referenced an incorrect backend URL

## Fixes Implemented

### 1. Updated Environment Configuration (`.env`)
Changed:
```bash
API_URL=http://localhost:8002
VITE_API_URL=http://localhost:8002
```

To:
```bash
API_URL=https://jarvis-backend-nzcg.onrender.com
VITE_API_URL=https://jarvis-backend-nzcg.onrender.com
```

### 2. Updated Render Deployment Configuration (`render.yaml`)
Changed:
```yaml
envVars:
  - key: CORS_ORIGINS
    value: https://jarvis-frontend.onrender.com

# And in the frontend service:
envVars:
  - key: REACT_APP_API_URL
    value: https://jarvis-backend.onrender.com

routes:
  - type: rewrite
    source: /api/*
    destination: https://jarvis-backend.onrender.com/api/
```

To:
```yaml
envVars:
  - key: CORS_ORIGINS
    value: https://jarvis-l8gx.onrender.com

# And in the frontend service:
envVars:
  - key: REACT_APP_API_URL
    value: https://jarvis-backend-nzcg.onrender.com

routes:
  - type: rewrite
    source: /api/*
    destination: https://jarvis-backend-nzcg.onrender.com/api/
```

## Verification Steps

1. Redeploy the application using the updated configuration
2. Visit https://jarvis-l8gx.onrender.com
3. Click "Quick Research"
4. Enter a research topic
5. Click "Search"
6. Observe that the report is generated successfully

## Additional Notes

- The frontend uses the `getApiUrl()` function from `services/config.ts` to construct API endpoints
- This function reads the API URL from environment variables in this priority order:
  1. `API_URL`
  2. `REACT_APP_API_URL`
  3. `VITE_API_URL`
- For production deployments, setting `REACT_APP_API_URL` in the Render configuration is the recommended approach