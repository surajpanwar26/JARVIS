# Render Deployment Checklist

## Configuration Updates Made

1. **Updated render.yaml**:
   - Added explicit CORS_ORIGINS environment variable for backend
   - Set REACT_APP_API_URL to the backend service URL
   - Updated route destination to use explicit backend URL
   - Maintained auto-deploy setting

2. **Verified Backend CORS Configuration**:
   - Backend already correctly configured to read CORS_ORIGINS from environment variables
   - Fallback to localhost origins for development

3. **Verified Dependencies**:
   - All required dependencies (gunicorn, uvicorn, itsdangerous) present in requirements.txt

4. **Frontend Configuration**:
   - Config service correctly handles environment variables for API URL
   - Proper fallback mechanism for development vs production

## Pre-Deployment Steps

1. **Set Environment Variables in Render Dashboard**:
   - GOOGLE_API_KEY
   - GROQ_API_KEY
   - TAVILY_API_KEY (optional)
   - MONGODB_URI
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - SESSION_SECRET_KEY
   - JWT_SECRET_KEY

2. **Update OAuth Redirect URIs** (if using Google OAuth):
   - Add deployed URLs to Google Cloud Console OAuth credentials

3. **Custom Domain Setup** (optional):
   - Add custom domain in Render dashboard
   - Update DNS records with domain registrar

## Post-Deployment Verification

1. **Health Check**:
   - Visit `/health` endpoint to verify all services are working
   - Check that API keys are properly configured

2. **Functionality Testing**:
   - Test quick research functionality
   - Test deep research functionality
   - Test document analysis (if applicable)
   - Verify image loading in reports

3. **CORS Verification**:
   - Ensure frontend can communicate with backend without CORS errors

## Troubleshooting

1. **If Health Check Fails**:
   - Verify all API keys are set correctly
   - Check MongoDB connection

2. **If Frontend Can't Reach Backend**:
   - Verify REACT_APP_API_URL is set correctly
   - Check CORS configuration

3. **If Build Fails**:
   - Check dependencies in requirements.txt
   - Verify build commands in render.yaml