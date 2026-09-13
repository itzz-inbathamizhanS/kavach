# System Architecture: Kavach

## High-Level Architecture
Kavach is built on a modern decoupled architecture, separating the client-side presentation layer from the backend business logic and data persistence layers. The architecture is designed for scalability, maintainability, and secure data handling.

## Components

### 1. Presentation Layer (Frontend)
- **Framework:** React powered by Vite.
- **Styling:** TailwindCSS for responsive and modular design.
- **State Management:** React Context API for global state (e.g., ThemeContext, Authentication).
- **Communication:** Axios or Fetch API client for RESTful communication with the backend.
- **Structure:** Modularized into `components`, `screens`, `contexts`, and `api`.

### 2. Application Layer (Backend)
- **Framework:** Java Spring Boot.
- **Security:** Spring Security with JSON Web Token (JWT) integration for stateless authentication and authorization.
- **API Design:** RESTful controllers exposing endpoints for frontend consumption.
- **Business Logic:** Dedicated service classes (`ThreatIngestionService`, `EnforcementService`, `LedgerService`, etc.) encapsulate business rules.
- **Data Access:** Spring Data MongoDB repositories for abstracting database operations.

### 3. Data Layer
- **Primary Database:** MongoDB. Chosen for its flexible schema design, allowing dynamic storage of diverse threat intelligence data structures and JSON-heavy logs.
- **Collections:** Separate collections for Users, Indicators, Advisories, Approvals, EnforcementActions, and LedgerRecords.

## Data Flow
1. **Threat Ingestion:** The `ThreatIngestionService` periodically polls or receives webhooks from external threat intelligence providers. The data is normalized and stored in MongoDB.
2. **Client Request:** The user authenticates via the frontend. A JWT is issued and stored securely.
3. **API Interaction:** The frontend sends a request (e.g., view active advisories) with the JWT in the Authorization header.
4. **Security Filter:** The backend `JwtAuthFilter` intercepts the request, validates the token, and establishes the security context.
5. **Business Processing:** The request reaches the respective Controller, which delegates to a Service. The Service queries the Repository.
6. **Response:** Data is formatted as a Data Transfer Object (DTO) and returned to the client as a JSON response.

## Security Considerations
- **Authentication:** Enforced strictly via JWT.
- **CORS Configuration:** Configured in `CorsConfig` to only allow requests from trusted frontend origins.
- **Audit Logging:** The `LedgerService` provides non-repudiation by logging critical state changes and approvals.
