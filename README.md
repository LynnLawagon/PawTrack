# PawTrack — Pet Management System

A responsive pet management web app converted from the original C# Windows Forms + MySQL project. This version uses **HTML, CSS, JavaScript, and browser Local Storage**, so it can be deployed as a static site on Vercel. No Laragon, MySQL server, backend, or build step is required.

## Features

- Add, view, search, update, and delete pet records
- Upload, replace, and remove pet photos
- Pet ID is generated automatically
- Dashboard counts for all pets, dogs, cats, and pets with photos
- Search by pet name and filter by pet type
- Export and import JSON backups
- Responsive layout for desktop, tablet, and mobile

## Run locally

### Option 1: Open directly

Double-click `index.html` to open it in a modern browser. The app does not need a server for normal use.

### Option 2: Use VS Code Live Server

1. Open this folder in Visual Studio Code.
2. Install the **Live Server** extension if you do not already have it.
3. Right-click `index.html` and choose **Open with Live Server**.

## Deploy to Vercel

1. Extract the ZIP file.
2. Create a GitHub repository and upload `index.html`, `styles.css`, `app.js`, and `README.md` to the repository root.
3. Sign in to [Vercel](https://vercel.com/) using GitHub.
4. Choose **Add New → Project**, then import your repository.
5. For Framework Preset, select **Other**.
6. Leave Build Command and Output Directory empty (or use `.` as the output directory if Vercel requires one). There is no build command.
7. Click **Deploy**.

You can also use the Vercel CLI from this folder with `vercel` and follow its prompts.

## How Local Storage works

- Records are stored in the browser under the key `pawtrack_pets_v1`.
- Photos are resized only by the browser's own file-size limit validation; uploaded images are stored as Base64 data URLs.
- Data remains available after refreshing or reopening the site in the **same browser profile and on the same device**.
- Each browser/device has its own separate data. Records are not shared with other users and do not sync between devices.
- Clearing browser site data, using private/incognito mode, or removing browser data can erase saved records.
- Browser Local Storage has limited capacity (often around 5 MB per site). This app limits each uploaded photo to 1.5 MB, but many large photos can still fill the available storage.
- Use **Export backup** regularly. Save the downloaded JSON file somewhere safe. Use **Import backup** to restore it. Import replaces the current list with the backup contents.

## Important notes

- This version no longer uses the MySQL database or the SQL file from the original desktop version. You do not need to start Laragon for this web version.
- Local Storage is suitable for a personal/demo app. It is not a secure multi-user database and should not be used for sensitive information.
- Anyone using the same browser profile on the same device may be able to access the saved records. Do not store confidential details.
- Deploying to Vercel hosts the app files only; Vercel does not store each user's Local Storage data. The data stays in each visitor's browser.

## Project files

```text
pawtrack/
├── index.html
├── styles.css
├── app.js
└── README.md
```
