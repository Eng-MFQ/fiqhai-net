# Project: موسوعة الفقه الإسلامي (Islamic Fiqh Encyclopedia) - Agentix

> **Professional Handover Documentation**  
> An advanced, AI-powered platform designed to provide intelligent search, conversational agents, and a comprehensive digital encyclopedia for Islamic Fiqh (Jurisprudence).

---

## 📖 About The Project

The Project **موسوعة الفقه الإسلامي** (Islamic Fiqh Encyclopedia) is a cutting-edge web application tailored to assist users in researching, exploring, and engaging with deep Islamic texts. Powered by **Agentix AI**, the application brings state-of-the-art semantic search and intelligent chatting capabilities directly to historical, complex Fiqh books.

The platform is designed with a modern, responsive user interface using **React** and **Material-UI (MUI)**, offering an elegant experience across all devices.

## ✨ Key Features

- **🤖 Agentix Chat Book:** An intelligent, context-aware AI chat assistant that converses directly with users about specific Fiqh volumes. It retains conversation history, understands complex queries, and cites its sources.
- **🔍 Advanced Book Search:** Fast, semantic searching across historical texts, leveraging vector databases to fetch highly relevant results instantly.
- **Secure Authentication:** Robust user authentication with role-based access control. Differentiates between regular users and Administrative users (e.g., "Nabil - Admin").
- **👥 Admin Dashboard:** Dedicated interfaces for managing users, monitoring system settings, and overseeing platform usage.
- **📱 Responsive & Accessible UI:** A mobile-first, beautifully themed interface featuring custom Arabic typography, fluid animations, and intuitive navigation.

## 🛠 Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) powered by [Vite](https://vitejs.dev/)
- **UI & Styling:** [Material-UI (MUI) v6](https://mui.com/), Emotion, Framer Motion
- **Markdown Rendering:** `react-markdown` with GFM support for rendering rich AI responses
- **Icons:** Material Icons, FontAwesome, Lucide React

### Backend Integration
- **API Communication:** Built via `fetch` & `axios` connecting to the Python-based backend hosted on Render (`https://fiqhinet-api.onrender.com`).
- **Endpoints Provided:** Secure user management (`/users`), intelligent chat (`/book/chat`), and initialization workflows.

## 🚀 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

Ensure you have the following installed to run the application:
- **Node.js**: (v18.0.0 or higher recommended)
- **npm** or **yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd nabil-fiqh-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment variables:**
   Create a `.env` file in the root directory (if required) to specify local API settings. By default, the app manages API execution contexts via `src/api.jsx` mapping to the live backend.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   > The application will typically be available at `http://localhost:5173`.

### Building for Production

To create an optimized production build:
```bash
npm run build
```
This generates a `dist/` folder ready to be deployed to Vercel, Netlify, or your preferred hosting platform.

## 📁 Project Structure

```text
nabil-fiqh-app/
├── public/                 # Static assets
├── src/
│   ├── Agentic/            # AI Agent Interfaces, Chat, Search, and UI Helpers
│   ├── auth/               # Authentication flows, Admin Panels, Settings
│   ├── api.jsx             # Network configurations & API endpoint mapping
│   ├── App.jsx             # Main Application routing and shell
│   └── main.jsx            # React Entry point
├── package.json            # Project dependencies and operational scripts
└── vite.config.js          # Vite configuration
```

## 🔐 Admin Access

To access the User Management and Settings elements, login through the portal using the designated Admin credentials config (`src/auth/AuthContext.jsx`):
- **Email:** `fiqhbook0@gmail.com`
- **Password:** *(Provided securely)* 

Administrators have exclusive rights to manage platform users and update internal Fiqh book configurations.

---

### *Handover Note to Client*
*This codebase has been architected for scalability, clean maintenance, and high performance. The modular component structure ensures that as your requirements grow—be it integrating more books or expanding user capacities—the foundation will support rapid iterations securely.*
