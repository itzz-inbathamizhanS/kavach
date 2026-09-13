# Kavach: Interview Cheat Sheet

If an interviewer or recruiter asks you about your Kavach project, here is exactly how you should answer them to sound incredibly professional, technical, and competent.

---

## 1. "What was your contribution to this project?"
**How to answer:** Focus on the fact that you built the entire system end-to-end (Full-Stack & DevOps).

> "I was the sole Full-Stack Developer and DevOps engineer for Kavach. 
> 
> On the **backend**, I built a robust REST API using **Java and Spring Boot**. I implemented stateless security using **JWT (JSON Web Tokens)** and connected it to a **MongoDB** cluster using Spring Data. I also wrote background services (`@Scheduled` tasks) that ingest real-world cybersecurity vulnerabilities directly from the US Government's CISA KEV database.
> 
> On the **frontend**, I built a highly responsive Single Page Application using **React, Vite, and Tailwind CSS**. I designed it to be a real-time cyber-defense dashboard that aggregates global threats and allows analysts to enforce security actions.
> 
> Finally, for **DevOps**, I containerized the Java backend by writing a custom **Dockerfile** and deployed it permanently to **Render**. I deployed the React frontend to **Vercel** and secured all database passwords and JWT secrets using Environment Variables so that the public GitHub repository remains completely clean."

---

## 2. "How is the Threat Score calculated?"
**How to answer:** Be honest that it is a simulation, but explain the *real* data you used, and explain how you *would* do it in a multi-million dollar enterprise.

> "For the scope of this project, the Threat Score (AbuseIPDB Score) is a **simulated heuristic algorithm** layered on top of real live data. 
> 
> When an analyst clicks on an IP address, the React frontend makes a live, real-time HTTP request to the `ipapi.co` API to fetch the actual geolocation, ISP, and ASN of that IP address in milliseconds. Because real Threat Intelligence APIs (like CrowdStrike or AbuseIPDB) cost thousands of dollars a month, I simulated the actual 'Score' using a randomized high-severity algorithm (generating a critical score between 70 and 100) and simulated the 'recent reports' count. 
> 
> **However, if I were to deploy this at an enterprise scale**, the backend would calculate the Threat Score by aggregating feeds from VirusTotal and AbuseIPDB. The math would weigh factors like:
> 1. The number of recent abuse reports in the last 24 hours.
> 2. Whether the IP is flagged as a TOR exit node or known VPN.
> 3. Its presence on known botnet blacklists.
> 
> By combining those three factors, the backend would generate a deterministic score from 0 to 100."

---

## Key Buzzwords to Remember (Use these in your interview!):
*   **"Stateless Authentication"** (When talking about JWT).
*   **"Containerized"** (When talking about Docker).
*   **"NoSQL"** (When talking about MongoDB).
*   **"Edge Network"** (When talking about Vercel).
*   **"Environment Variables"** (When talking about hiding your passwords from GitHub).

---

## 3. "How do your certifications relate to this project?"
**How to answer:** This is where you connect your credentials directly to the code you wrote. Kavach is the *perfect* physical proof of your certifications!

> "I built this project specifically to apply the knowledge from my two certifications into a real-world, production environment.
>
> 1. **MongoDB Java Developer Path:** I didn't want to just pass a test; I wanted to build something real. So I used Java and Spring Boot as the core engine for Kavach, and connected it to a MongoDB cluster using Spring Data. I designed the NoSQL document models (for Threat Advisories and Enforcements) based on the exact best practices I learned in the certification path.
> 
> 2. **Palo Alto Networks Certified Cybersecurity Apprentice:** This certification gave me the foundational knowledge of how network defense actually works. When I built Kavach, I applied those concepts directly. For example, I understood what an Indicator of Compromise (IoC) is, why the CISA KEV database is important, and how Role-Based Access Control (RBAC) works. Kavach is basically my Palo Alto cybersecurity knowledge translated into functioning Java and React code."
