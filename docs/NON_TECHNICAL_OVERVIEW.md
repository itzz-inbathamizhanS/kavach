# The Kavach Product Overview

While the previous document explained the *code*, this document explains the **product**. What is Kavach? Why did we build it? Who is it for?

## What is Kavach?
**Kavach** (meaning "Armor" or "Shield") is a **Cyber-Defense Dashboard and Threat Intelligence Platform**. 

Imagine the security command center of a massive enterprise company, a military defense grid, or a government agency. Security analysts sit in front of screens watching for hackers, malware, and data breaches. Kavach is the software running on those screens. 

It is designed to be the central "pane of glass" that a Chief Information Security Officer (CISO) or a Lead Security Analyst looks at to understand the current security posture of their organization.

## Why is it used? (The Problem it Solves)
Modern companies are under constant attack by automated bots, phishing campaigns, and hackers. Security teams have too much data to look at—firewall logs, login attempts, server health, and global threat databases.

If a team has to check 10 different systems to see if they are being hacked, they will be too slow to stop the attack. 

**Kavach solves this by bringing everything into one place:**
1. It aggregates global threats (like the CISA KEV database).
2. It monitors real-time login attempts and server traffic.
3. It allows analysts to block malicious IPs or isolate compromised servers instantly.

## Core Features (How it works for the User)

### 1. The Global Dashboard (The "Command Center")
When an analyst logs in, they immediately see a high-level overview:
*   **System Status:** Is the grid secure, or are we under attack?
*   **Threat Scores:** A calculation of how dangerous the current environment is.
*   **Live Event Feed:** A real-time scrolling list of things happening on the network (e.g., "Suspicious login attempt from Russia blocked").

### 2. Threat Intelligence (The "Radar")
Kavach has a background service that actively pulls data from the **CISA KEV (Cybersecurity and Infrastructure Security Agency - Known Exploited Vulnerabilities)** catalog. 
If a new vulnerability is discovered in the real world (like a new Windows exploit), Kavach downloads that data and warns the security team so they can patch their servers before hackers use it against them.

### 3. Active Enforcement (The "Weapons")
Kavach doesn't just *watch*; it acts. 
If the system detects a malicious IP address trying to brute-force a password, Kavach will automatically generate an **Enforcement Action** (like dropping all traffic from that IP). The analyst can view these enforcements and approve or deny them.

### 4. Immutable Ledger (The "Black Box")
In cybersecurity, hackers often try to delete logs to cover their tracks. Kavach features a cryptographic **Ledger**. Every time a major security event happens, it is mathematically signed and saved. Even if an admin goes rogue, they cannot silently modify the history of what happened on the grid without breaking the cryptographic signature.

## Summary
Kavach is not a consumer app like Facebook or Instagram. It is a highly specialized, enterprise-grade security tool built for cyber-defense teams to monitor, analyze, and neutralize active threats against their network infrastructure.
