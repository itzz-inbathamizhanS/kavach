# KAVACH: From Zero to Production

This document explains exactly what the Kavach project is, how it was built from the ground up, and how the code actually works behind the scenes.

## 1. What is Kavach?
Kavach (meaning "Armor" or "Shield") is a **Cyber-Defense Dashboard application**. It is designed to look and feel like a high-tech military or enterprise security grid. 
It consists of two completely separate pieces of software that talk to each other:
1. **The Frontend (Client):** What the user sees in their web browser (built with React).
2. **The Backend (Server):** The engine that processes data, handles security, and talks to the database (built with Java & Spring Boot).

---

## 2. The Frontend (React + Vite + Tailwind)
The frontend is located in the `kavach-frontend/` folder. It is a Single Page Application (SPA).

### How it works:
Instead of loading a new HTML page every time you click a button, the frontend loads exactly *one* HTML file (`index.html`). JavaScript (React) takes over and instantly draws the different screens (like the Login page or the Dashboard) directly in the browser. 

### Key Technologies:
*   **Vite:** The lightning-fast build tool that bundles all your JavaScript files into an optimized package for the browser.
*   **React:** The library used to build the user interface using reusable "Components".
*   **Tailwind CSS:** A utility-first styling framework. Instead of writing separate CSS files, we style elements directly in the code (e.g., `<div className="bg-primary text-white">`).

### The Code Flow:
1. **`main.jsx`**: The entry point of the app. It injects React into the `index.html`.
2. **`App.jsx`**: Controls the routing. If you aren't logged in, it shows `LoginScreen.jsx`. If you are, it shows `DashboardScreen.jsx`.
3. **`apiClient.js`**: This is the messenger. Whenever the frontend needs data (like logging in or fetching alerts), this file sends an HTTP request over the internet to your Backend.

---

## 3. The Backend (Java + Spring Boot + MongoDB)
The backend is located in the `kavach-backend/` folder. It is the "brain" of the application.

### How it works:
The backend sits on a server (Render) and listens 24/7 for requests from the frontend. It enforces security rules, runs background tasks (like searching for new threats), and reads/writes to the database.

### Key Technologies:
*   **Spring Boot:** A massive Java framework that sets up a web server (Tomcat) and provides the tools to create APIs incredibly fast.
*   **MongoDB:** A NoSQL database hosted on MongoDB Atlas. Instead of tables and rows, it stores data as JSON-like documents.
*   **JWT (JSON Web Tokens):** The security mechanism. When you log in, the server gives you a digital "token". You must show this token with every subsequent request to prove you are authenticated.

### The Code Flow:
1. **Controllers (`src/main/java/.../controller/`)**: These are the entry doors. For example, `AuthController.java` listens specifically for requests sent to `/api/auth/login`. 
2. **Services (`src/main/java/.../service/`)**: The heavy lifters. The controller hands the request to the service (e.g., `AuthService.java`). The service contains the actual business logic (like verifying passwords).
3. **Repositories (`src/main/java/.../repository/`)**: The database managers. The service asks the repository (e.g., `UserRepository.java`) to fetch the user from MongoDB. Spring Data MongoDB writes all the database queries for you automatically.

---

## 4. How the Pieces Connect (The Full Loop)

Let's look at exactly what happens when you log in:

1. **User Action:** You type your email and password on the React website and click "Log In".
2. **Frontend Request:** `apiClient.js` packages your email and password into a JSON object and sends a `POST` request to `https://kavach-5her.onrender.com/api/auth/login`.
3. **Backend Receives:** Spring Boot receives the request. `AuthController.java` intercepts it and hands it to `AuthService.java`.
4. **Database Check:** `AuthService.java` asks MongoDB: "Do you have a user with this email?" and checks if the password matches.
5. **Token Creation:** If the password is correct, `JwtTokenProvider.java` generates a cryptographic JWT token.
6. **Backend Responds:** Spring Boot sends the JWT token back to the frontend.
7. **Frontend Updates:** React receives the token, saves it in the browser's memory, and switches the screen from the Login page to the Dashboard page!

---

## 5. Why Deploy Them Separately?
You might wonder why we deployed the Frontend to **Vercel** and the Backend to **Render**.

*   **Vercel** is an Edge network designed specifically for static files and frontend frameworks like React. It distributes your website's HTML/JS to servers all over the planet, so the website loads instantly for anyone, anywhere. However, it cannot run a long-running Java server.
*   **Render** (and Docker) is designed to run full server applications (like Java). It keeps your Spring Boot application running 24/7 so it can execute background tasks (like simulating cyber threats) and keep an active connection to your MongoDB database.

By separating them, you get the absolute best performance and security for both sides of your codebase!
