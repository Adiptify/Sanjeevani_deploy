# Sanjeevani Deployment Guide (Render)

This guide explains how to deploy the Sanjeevani AI application to [Render](https://render.com) efficiently.

## Prerequisites
- A Render account (Free tier is fine).
- Your code pushed to a GitHub or GitLab repository.

## Step-by-Step Deployment

### 1. Create a New Web Service
- Log in to your Render Dashboard.
- Click **New +** and select **Web Service**.
- Connect your GitHub/GitLab repository and select the `Sanjeevani` project.

### 2. Configure Service Settings

When prompted, use the following settings for the best performance (Blueprint will handle most of these if you use the `render.yaml` file, but here is the manual setup if needed):

| Option | Value |
| :--- | :--- |
| **Name** | `sanjeevni-ai` (or your preferred name) |
| **Environment** | `Node` |
| **Region** | Select the one closest to your users (e.g., Singapore or US East) |
| **Branch** | `main` (or your production branch) |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | `Free` (or a higher tier if needed) |

### 3. Add Environment Variables
Render needs the following keys from your `.env` file. Go to the **Environment** tab in your Render service and add:

- `MONGODB_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A secure random string for tokens.
- `OPENAI_API_KEY`: Your OpenAI API key.
- `NEXT_PUBLIC_APP_URL`: Set this to your Render URL (e.g., `https://sanjeevni-ai.onrender.com`).

### 4. Advanced Settings (Optional but Recommended)
- **Health Check Path**: `/api/health`
- **Auto-Deploy**: Enabled (this will redeploy whenever you push to GitHub).

## Why these settings?
- **Standalone Build**: We've optimized the project to use Next.js "standalone" mode, which significantly reduces the server size and memory usage.
- **Node Version**: We've pinned the Node version to ensure consistency between your local machine and the server.

---

### Questions?
If you encounter any build errors, check the **Logs** tab in Render. Common issues are usually missing environment variables or incorrect Node.js versions.
