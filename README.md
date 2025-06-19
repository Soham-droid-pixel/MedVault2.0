# 🏥 MedVault – Smart Medical Record & Appointment Manager

**MedVault** is a secure, full-stack web application to manage medical records and appointments with built-in reminders and sharing features.

---

## 🚀 Key Features

- 🔐 Secure login & signup with JWT auth
- 📁 Upload, view & search medical records
- 📅 Manage doctor/hospital appointments
- ⏰ Email reminders before appointments (1, 3, and 7 days)
- 📤 Share records via WhatsApp and Email (no QR)
- ☁️ Cloud storage with Cloudinary
- 📦 Built using React, Node.js, Express & MongoDB

---

## ⚙️ Tech Stack

- **Frontend:** React + Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Others:** Cloudinary, Nodemailer, JWT, Axios

---

## 🔧 Getting Started

### Backend Setup

```bash
cd backend
npm install
npm run dev
````

Add a `.env` file with:

```
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email
EMAIL_PASS=your_password_or_app_password
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Ensure `baseURL` in `api/axios.js` is:

```js
baseURL: 'http://localhost:5000/api'
```

---

## 📬 Email Scheduler

Sends automatic email reminders:

* 7 days before the appointment
* 3 days before
* 1 day before

---

## 🤝 Author

**Soham Kalgutkar**
Computer Engineering | Passionate Full-Stack Developer

---

```

Let me know if you want a section for deployment instructions or contributing.
```
