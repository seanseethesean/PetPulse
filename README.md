# 🐾 PetPulse

**PetPulse** is a full-stack web app that helps pet owners organize their pets’ care routines, track expenses, and connect with other pet lovers through an integrated social platform.  
Built with **React, Firebase, Express, and Socket.IO**, PetPulse combines pet management tools with real-time chat and community engagement.

---

## 🌐 Live Demo
🔗 [PetPulse Web App](https://pet-pulse.vercel.app/)  
🎥 [Feature Demo (MS3 Video)](youtube.com/watch?si=pOk8kuWknOD8Ygdl&v=2VZPEnKjHuo&feature=youtu.be)

> ⚠️ **Note:** The backend is hosted on Render’s free tier — loading may take a few seconds if inactive.  
> 🖥️ Please access via desktop; the UI is not yet optimized for mobile.

---

## 🎯 Motivation

Pet ownership is growing rapidly — with 66% of U.S. households owning pets as of 2024 — yet many owners struggle to manage daily care, rising costs, and social engagement.

PetPulse bridges this gap by offering an all-in-one platform where users can:
- Manage pet routines and reminders  
- Track health and expenses  
- Connect with other pet owners  
- Share experiences and chat in real time  

---

## 🧩 Aim

To build an intuitive, engaging web app that empowers pet owners to become more responsible caregivers through:
- **Timely reminders** for health and care schedules  
- **Comprehensive pet profiles** with logs and records  
- **Community features** for interaction, sharing, and support  

---

## 🐕‍🦺 Key Features

- 🐶 **Pet Profiles:** Manage multiple pets with unique schedules and data  
- 📅 **Task & Reminder Management:** Add, edit, and track daily care activities  
- 💰 **Expense Tracking:** Record and review expenses for transparency  
- 📔 **Pet Journal:** Log milestones, observations, or vet visits  
- 💬 **Social Page & Chat:** Connect, post, follow users, and chat with mutual followers (Socket.IO)  
- 📍 **Nearby Services:** Discover nearby vets, groomers, and pet shops via Google Maps API  

---

## 🧠 User Stories

- “As a pet owner, I want to set reminders for vaccinations and vet visits.”  
- “As a multi-pet owner, I want separate profiles for each pet.”  
- “As a social pet lover, I want to post photos and chat with others.”  
- “As a pet sitter, I want to view the pet’s care history for continuity.”  

---

## ⚙️ Tech Stack

### 🖥️ Frontend
- **ReactJS:** Component-based UI for dynamic, responsive pages  
- **React Router:** Smooth, single-page navigation  
- **React Hooks (useState, useEffect):** Efficient state management  

### ☁️ Backend
- **Firebase Authentication:** Secure email/Google sign-in  
- **Cloud Firestore:** Real-time database for users, pets, expenses, and journals  
- **Cloud Functions (planned):** Automated triggers for reminders and notifications  

### ⚡ Real-Time Communication
- **Socket.IO:** Enables instant chat between mutual followers; no page reloads needed  

### 🚀 Deployment
- **Frontend:** Vercel  
- **Backend:** Render (Node/Express)  
- **CI/CD:** Auto-deployment from GitHub  

---

## 🧪 Testing

- Implemented **unit and integration tests** with Jest and React Testing Library  
- Achieved **>90% coverage** on core modules including `ExpenseTracker`, `TaskChecklist`, and `Chat`  

---

## 🏗️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/petpulse.git
   cd petpulse
   
2. **Install dependencies**
   npm install

3. **Set up Firebase**
  Create a Firebase project
  Enable Authentication and Firestore
  Add your Firebase web config to a .env file as needed by your codebase

4. **Run locally**
  npm start
