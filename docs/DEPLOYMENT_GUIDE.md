# Kavach Deployment Guide

Deploying Kavach involves three main components: the MongoDB database (which you already have on Atlas), the Spring Boot backend, and the React frontend.

## 1. Backend Deployment (Render / Railway)

The easiest way to deploy the Spring Boot backend is using a Platform-as-a-Service (PaaS) like Render or Railway.

### Steps:
1. Create an account on [Render](https://render.com) or [Railway](https://railway.app).
2. Connect your GitHub account and select the `kavach` repository.
3. Set the Root Directory to `kavach-backend`.
4. **Build Command:** `mvn clean package -DskipTests`
5. **Start Command:** `java -jar target/kavach-backend-1.0.0.jar`
6. **Environment Variables:** You MUST set the following environment variables in your deployment dashboard:
   - `MONGO_URI`: Your MongoDB Atlas connection string (e.g., `mongodb+srv://kavach_admin:YOUR_PASSWORD@kavachcluster...`)
   - `JWT_SECRET`: A secure, randomly generated 64-character hex string.

Once deployed, copy the backend URL (e.g., `https://kavach-api.onrender.com`).

## 2. Frontend Deployment (Vercel / Netlify)

Vercel is highly recommended for deploying Vite React applications.

### Steps:
1. Go to [Vercel](https://vercel.com) and log in with your GitHub account.
2. Click **Add New Project** and import the `kavach` repository.
3. **Framework Preset:** Vercel should automatically detect Vite.
4. **Root Directory:** Edit this and set it to `kavach-frontend`.
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`
7. **Environment Variables:**
   - If your frontend needs to know the backend URL, you will need to configure it in your frontend API client. Before deploying, ensure your `kavach-frontend/src/api/apiClient.js` points to your deployed backend URL instead of `localhost`.

## 3. Post-Deployment Checklist
- [ ] Ensure the backend is successfully connecting to MongoDB.
- [ ] Verify that CORS is configured in your backend to allow requests from your new Vercel frontend URL. (Update `CorsConfig.java` in the backend if necessary).
- [ ] Test the login functionality to ensure JWT tokens are being issued correctly.
