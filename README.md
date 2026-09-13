# Kavach

## Overview
Kavach is an advanced Threat Intelligence and Security Posture Management platform designed to ingest, analyze, and mitigate cyber threats in real-time. By leveraging automated threat intelligence feeds, robust indicator tracking, and immutable ledger capabilities, Kavach provides security operations centers (SOC) and incident response teams with a comprehensive suite of tools for proactive defense.

## Key Capabilities
- **Threat Ingestion and Processing:** Automated ingestion of threat intelligence data and advisories.
- **Indicator of Compromise (IoC) Tracking:** Monitor, manage, and analyze critical indicators.
- **Enforcement and Orchestration:** Execute automated or manual enforcement actions across infrastructure.
- **Immutable Ledger:** Audit trail tracking for critical system actions and approvals.
- **Real-Time Dashboard:** Centralized visibility into security events and system health.

## Technology Stack
- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Java Spring Boot
- **Database:** MongoDB
- **Security:** JWT-based authentication, Spring Security

## Repository Structure
- `kavach-backend/`: Contains the Spring Boot application, services, and API controllers.
- `kavach-frontend/`: Contains the React-based user interface.
- `docs/`: Comprehensive project documentation.

## Getting Started

### Prerequisites
- Java Development Kit (JDK) 17 or higher
- Node.js 18 or higher
- MongoDB instance (local or remote)
- Maven

### Backend Setup
1. Navigate to the backend directory: `cd kavach-backend`
2. Configure the MongoDB connection in `src/main/resources/application.yml`
3. Start the application: `mvn spring-boot:run`
The backend will run on `http://localhost:8080`.

### Frontend Setup
1. Navigate to the frontend directory: `cd kavach-frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
The frontend will run on `http://localhost:5173`.

## Documentation
For further details on the system design and project scope, please refer to the documentation in the `docs` directory:
- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Architecture](docs/ARCHITECTURE.md)
