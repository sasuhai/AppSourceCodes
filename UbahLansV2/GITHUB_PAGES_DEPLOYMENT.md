# 🚀 GitHub Pages Deployment with Secure API Key

This guide shows you how to deploy UbahLans to GitHub Pages while keeping your API key secure using GitHub Secrets.

## ✅ What This Does

- **Keeps API key secure** - Never exposed in your code
- **Uses GitHub Secrets** - Stored encrypted in GitHub
- **Auto-deploys** - Every push to `main` triggers deployment
- **Free** - GitHub Pages is free for public repos

---

## 📋 Setup Steps

### Step 1: Remove API Key from Code

**IMPORTANT:** Before committing, remove the API key from `app.js`:

1. Open `app.js`
2. Find line 7:
   ```javascript
   GEMINI_API_KEY: window.ENV?.GEMINI_API_KEY || '',
   ```
3. Change it to:
   ```javascript
   GEMINI_API_KEY: window.ENV?.GEMINI_API_KEY || '',
   ```
4. **Save the file**

### Step 2: Add API Key to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Name: `GEMINI_API_KEY`
6. Value: `YOUR_ACTUAL_GEMINI_API_KEY_HERE`
7. Click **Add secret**

### Step 3: Enable GitHub Pages

1. In your repo, go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Click **Save**

### Step 4: Commit and Push

```bash
# Add all files
git add .

# Commit with a message
git commit -m "Add GitHub Actions deployment with secure API key"

# Push to GitHub
git push origin main
```

### Step 5: Wait for Deployment

1. Go to the **Actions** tab in your GitHub repo
2. You'll see a workflow running
3. Wait for it to complete (takes 1-2 minutes)
4. Once done, your site will be live at:
   ```
   https://yourusername.github.io/UbahLansV2/
   ```

---

## 🔒 Update Google API Key Restrictions

Once deployed, update your API key restrictions:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your API key
3. Under **Application restrictions**, select **HTTP referrers**
4. Add these referrers:
   ```
   https://yourusername.github.io/*
   http://localhost:*
   ```
5. Under **API restrictions**, select **Restrict key**
6. Check only: **Generative Language API**
7. Click **Save**

---

## 🧪 Testing Locally

For local testing, you can temporarily add the key back:

1. Open `app.js`
2. Change line 7 to:
   ```javascript
   GEMINI_API_KEY: window.ENV?.GEMINI_API_KEY || 'YOUR_KEY_HERE',
   ```
3. **DON'T COMMIT THIS!**
4. Test locally with `python3 -m http.server 8000`
5. Remove the key before committing

---

## 🔄 How It Works

1. **You push code** to GitHub (without API key in code)
2. **GitHub Actions runs** the workflow
3. **Workflow creates `env.js`** with your API key from Secrets
4. **Workflow updates `index.html`** to load `env.js`
5. **Site deploys** to GitHub Pages
6. **Your app loads** and reads the key from `window.ENV.GEMINI_API_KEY`

---

## 📁 Files Created

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- This guide

---

## ⚠️ Important Notes

1. **Never commit the API key** to your repository
2. **Always use GitHub Secrets** for sensitive data
3. **Set HTTP referrer restrictions** on your Google API key
4. **Monitor usage** in Google Cloud Console
5. **Rotate keys** if you suspect exposure

---

## 🆘 Troubleshooting

### Deployment fails
- Check the **Actions** tab for error messages
- Make sure you added the `GEMINI_API_KEY` secret
- Verify the secret name is exactly `GEMINI_API_KEY`

### API key not working on deployed site
- Wait 1-2 minutes after deployment
- Check browser console for errors
- Verify the secret was added correctly
- Make sure HTTP referrer restrictions include your GitHub Pages URL

### Local testing not working
- Temporarily add the key back to `app.js` (don't commit!)
- Or create a local `env.js` file (add to `.gitignore`)

---

## 🎉 You're Done!

Your app is now deployed securely to GitHub Pages with the API key protected! 🔒

**Live URL:** `https://yourusername.github.io/UbahLansV2/`

---

## 📚 Next Steps

1. Test your deployed site
2. Share the URL with others
3. Monitor API usage in Google Cloud Console
4. Consider setting up usage quotas and billing alerts

---

**Need help?** Check the GitHub Actions logs in the **Actions** tab of your repository.
