# KAVACH Backend — Full Implementation Plan

## Goal
Build a **Spring Boot 3** (Java 21) backend with **MongoDB Atlas** and **real JWT authentication** to power all 8 screens of the existing KAVACH React frontend. Demo seed data included for testing.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Java | 21 LTS |
| Framework | Spring Boot | 3.4.4 |
| Database | MongoDB Atlas | Cloud (M0 free tier or above) |
| ORM | Spring Data MongoDB | (via starter) |
| Security | Spring Security + JJWT | 0.12.6 |
| Password hashing | BCrypt | (via Spring Security) |
| Build | Maven | 3.9.x |
| Frontend | React + Vite | (existing) |

---

## Project Structure

```
a:\KAVACH\
├── kavach-backend/                          ← NEW Spring Boot project
│   ├── pom.xml
│   ├── src/main/java/com/kavach/
│   │   ├── KavachApplication.java           ← Entry point
│   │   │
│   │   ├── config/
│   │   │   ├── CorsConfig.java              ← CORS for React dev server
│   │   │   ├── SecurityConfig.java          ← Spring Security + JWT filter chain
│   │   │   └── MongoConfig.java             ← MongoDB auditing config
│   │   │
│   │   ├── model/                           ← MongoDB @Document classes
│   │   │   ├── User.java
│   │   │   ├── Advisory.java
│   │   │   ├── Indicator.java
│   │   │   ├── EnforcementAction.java
│   │   │   ├── ApprovalRequest.java
│   │   │   ├── LedgerRecord.java
│   │   │   └── SystemSettings.java
│   │   │
│   │   ├── repository/                      ← Spring Data MongoDB interfaces
│   │   │   ├── UserRepository.java
│   │   │   ├── AdvisoryRepository.java
│   │   │   ├── IndicatorRepository.java
│   │   │   ├── EnforcementRepository.java
│   │   │   ├── ApprovalRepository.java
│   │   │   ├── LedgerRepository.java
│   │   │   └── SettingsRepository.java
│   │   │
│   │   ├── dto/                             ← Request/Response objects
│   │   │   ├── LoginRequest.java
│   │   │   ├── LoginResponse.java
│   │   │   ├── DashboardStats.java
│   │   │   ├── DashboardEvent.java
│   │   │   ├── AdvisoryStatsDto.java
│   │   │   ├── IndicatorStatsDto.java
│   │   │   ├── EnforcementStatsDto.java
│   │   │   ├── LedgerStatsDto.java
│   │   │   ├── LedgerVerifyResponse.java
│   │   │   ├── LedgerProofResponse.java
│   │   │   ├── MarkReviewedRequest.java
│   │   │   ├── ApprovalActionRequest.java
│   │   │   └── PageResponse.java
│   │   │
│   │   ├── security/                        ← JWT infrastructure
│   │   │   ├── JwtTokenProvider.java        ← Generate/validate JWT tokens
│   │   │   └── JwtAuthFilter.java           ← OncePerRequestFilter
│   │   │
│   │   ├── service/                         ← Business logic
│   │   │   ├── AuthService.java
│   │   │   ├── DashboardService.java
│   │   │   ├── AdvisoryService.java
│   │   │   ├── IndicatorService.java
│   │   │   ├── EnforcementService.java
│   │   │   ├── ApprovalService.java
│   │   │   ├── LedgerService.java           ← Merkle chain SHA-256 logic
│   │   │   └── SettingsService.java
│   │   │
│   │   ├── controller/                      ← REST endpoints
│   │   │   ├── AuthController.java
│   │   │   ├── DashboardController.java
│   │   │   ├── AdvisoryController.java
│   │   │   ├── IndicatorController.java
│   │   │   ├── EnforcementController.java
│   │   │   ├── ApprovalController.java
│   │   │   ├── LedgerController.java
│   │   │   └── SettingsController.java
│   │   │
│   │   └── seed/
│   │       └── DataSeeder.java              ← Demo data on first run
│   │
│   └── src/main/resources/
│       └── application.yml                  ← Atlas URI + JWT config
│
├── src/                                     ← Existing React frontend
│   ├── api/
│   │   └── apiClient.js                     ← NEW: Centralized API client
│   ├── screens/                             ← MODIFY: All 8 screens
│   └── ...
└── vite.config.js                           ← MODIFY: Add /api proxy
```

**Total new files: ~45 Java + 2 config + 1 JS**

---

## Detailed File Specifications

### Phase 1 — Project Bootstrap (4 files)

---

#### [NEW] `kavach-backend/pom.xml`
Already created. Dependencies: `spring-boot-starter-web`, `spring-boot-starter-data-mongodb`, `spring-boot-starter-security`, `spring-boot-starter-validation`, `jjwt-api/impl/jackson 0.12.6`, `lombok`.

---

#### [NEW] `kavach-backend/src/main/resources/application.yml`
```yaml
spring:
  data:
    mongodb:
      uri: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/kavach?retryWrites=true&w=majority
      database: kavach

jwt:
  secret: <64-char-hex-secret>    # Generated at build time
  expiration-ms: 86400000          # 24 hours

server:
  port: 8080
```

> [!IMPORTANT]
> You must provide your MongoDB Atlas connection string. I will use a placeholder that you'll replace with your real Atlas credentials.

---

#### [NEW] `KavachApplication.java`
Standard `@SpringBootApplication` entry point. No custom logic.

---

#### [NEW] `config/CorsConfig.java`
- Allows `http://localhost:5173` (Vite dev server)
- Allows all standard methods (`GET, POST, PUT, PATCH, DELETE, OPTIONS`)
- Allows `Authorization` and `Content-Type` headers

---

### Phase 2 — MongoDB Document Models (7 files)

Each model is a `@Document` class with `@Id String id` (MongoDB auto-generates ObjectId).

---

#### [NEW] `model/User.java`
```java
@Document(collection = "users")
Fields:
  - String id
  - String email          (unique, indexed)
  - String passwordHash   (BCrypt)
  - String displayName
  - String role           ("ADMIN" | "ANALYST" | "OPERATOR")
  - Instant createdAt
```

---

#### [NEW] `model/Advisory.java`
```java
@Document(collection = "advisories")
Fields:
  - String id
  - String source         ("CERT-In" | "CISA KEV" | "NVD Feed" | "Shadowserver")
  - String title
  - String cve            (CVE-YYYY-NNNN or KAV-ADV-YYYY-NNN)
  - String description
  - Instant timestamp
  - String status         ("Pending" | "Verified" | "Reviewed")
  - double confidenceScore
Indexes:
  - @Indexed on source, status, timestamp
```

---

#### [NEW] `model/Indicator.java`
```java
@Document(collection = "indicators")
Fields:
  - String id
  - String type           ("IP address" | "Domain" | "File hash (SHA-256)")
  - String value          (the actual IOC value)
  - String source
  - double confidenceScore (0-100)
  - String status         ("Enforced" | "Verified" | "Needs review" | "Pending")
  - Instant createdAt
  - Instant ttlExpiry     (nullable — for auto-expiry)
Indexes:
  - @Indexed on value (unique), status
```

---

#### [NEW] `model/EnforcementAction.java`
```java
@Document(collection = "enforcement_actions")
Fields:
  - String id
  - Instant timestamp
  - String indicatorValue
  - String tier            ("Tier 1 gateway" | "Edge proxy 02" | etc.)
  - String actionTaken
  - String status          ("Enforced" | "Pending" | "Needs review")
  - Evidence evidence      (embedded subdocument)

Embedded class Evidence:
  - String actor
  - String ruleApplied
  - String duration
  - String checksum
```

---

#### [NEW] `model/ApprovalRequest.java`
```java
@Document(collection = "approval_requests")
Fields:
  - String id
  - String indicatorValue
  - String type            ("Ingress Block" | "Workload Quarantine" | etc.)
  - String threat
  - double confidenceScore
  - String requestedBy
  - Instant requestedAt
  - String status          ("PENDING" | "APPROVED" | "REJECTED")
  - String analystNotes    (nullable)
  - String resolvedBy      (nullable — user who approved/rejected)
  - Instant resolvedAt     (nullable)
```

---

#### [NEW] `model/LedgerRecord.java`
```java
@Document(collection = "ledger_records")
Fields:
  - String id
  - Instant timestamp
  - long blockNumber       (sequential, auto-incremented)
  - String hash            (SHA-256 of: previousHash + blockNumber + description + timestamp)
  - String previousHash    ("0" for genesis block)
  - String description
  - String scope
  - String actor
  - String actorSub
  - String actorIcon
  - String category        ("enforcement" | "policy")
  - String status          ("Verified")
Indexes:
  - @Indexed(unique=true) on blockNumber
```

---

#### [NEW] `model/SystemSettings.java`
```java
@Document(collection = "system_settings")
Fields:
  - String id
  - int confidenceThreshold     (50-100, default 85)
  - Map<String, Boolean> feeds  (certIn, honeynet, stix)
  - Map<String, Boolean> policies (dualAuth, ledgerRepl)
  - Instant updatedAt
  - String updatedBy
```

---

### Phase 3 — Repositories (7 files)

All extend `MongoRepository<T, String>`. Custom query methods:

| Repository | Custom Methods |
|---|---|
| `UserRepository` | `findByEmail(String email)` |
| `AdvisoryRepository` | `findBySourceContainingIgnoreCase(...)`, `countByStatus(...)` |
| `IndicatorRepository` | `countByConfidenceScoreGreaterThan(...)`, `countByStatus(...)` |
| `EnforcementRepository` | `countByStatus(...)` |
| `ApprovalRepository` | `findByStatus(String status)` |
| `LedgerRepository` | `findTopByOrderByBlockNumberDesc()`, `findAllByOrderByBlockNumberAsc()` |
| `SettingsRepository` | (default CRUD only — singleton document) |

All repositories support Spring Data's `Pageable` for paginated queries.

---

### Phase 4 — DTOs (13 files)

| DTO | Purpose | Key Fields |
|---|---|---|
| `LoginRequest` | POST body for `/api/auth/login` | `email`, `password` |
| `LoginResponse` | Response with token | `token`, `displayName`, `role`, `expiresIn` |
| `DashboardStats` | Dashboard metric cards | `advisoriesToday`, `indicatorsVerified`, `actionsEnforced`, `pendingApprovals` |
| `DashboardEvent` | Dashboard event table row | `time`, `event`, `id`, `tier`, `status`, `statusType`, `category` |
| `AdvisoryStatsDto` | Advisory metric cards | `total`, `unreviewed`, `avgTriageMinutes`, `criticalIndicators` |
| `IndicatorStatsDto` | Indicator metric cards | `total`, `highConfidence`, `activeBlocks`, `addedToday` |
| `EnforcementStatsDto` | Enforcement metric cards | `total`, `automatedRate`, `activeTierBlocks`, `manualReviews`, `addedToday` |
| `LedgerStatsDto` | Ledger metric cards | `totalRecords`, `chainIntegrity`, `latestBlock`, `merkleRoot`, `committedToday`, `lastBlockAge` |
| `LedgerVerifyResponse` | Chain verify result | `valid`, `blocksChecked`, `nodesVerified`, `message` |
| `LedgerProofResponse` | Downloadable proof JSON | `chain`, `height`, `merkleRoot`, `consensusNodes`, `timestamp` |
| `MarkReviewedRequest` | Bulk mark advisories | `List<String> ids` |
| `ApprovalActionRequest` | Approve/reject body | `String analystNotes` |
| `PageResponse<T>` | Generic paginated response | `List<T> content`, `int page`, `int size`, `long totalElements`, `int totalPages` |

---

### Phase 5 — JWT Security (3 files)

---

#### [NEW] `security/JwtTokenProvider.java`
- `generateToken(String userId, String email, String role)` → signed JWT using HS512 with secret from `application.yml`
- `validateToken(String token)` → boolean
- `getUserIdFromToken(String token)` → String
- `getEmailFromToken(String token)` → String
- Token payload claims: `sub` (userId), `email`, `role`, `iat`, `exp`

---

#### [NEW] `security/JwtAuthFilter.java`
- Extends `OncePerRequestFilter`
- Extracts `Authorization: Bearer <token>` header
- Validates token via `JwtTokenProvider`
- Sets `UsernamePasswordAuthenticationToken` in `SecurityContextHolder`
- Skips filter for `/api/auth/**` paths

---

#### [NEW] `config/SecurityConfig.java`
```
SecurityFilterChain:
  - CSRF disabled (stateless API)
  - Session management: STATELESS
  - Permit: POST /api/auth/login
  - Authenticate: all other /api/** endpoints
  - Add JwtAuthFilter before UsernamePasswordAuthenticationFilter
  - PasswordEncoder bean: BCryptPasswordEncoder
```

---

### Phase 6 — Services (8 files)

---

#### [NEW] `service/AuthService.java`
```
login(email, password):
  1. Find user by email from MongoDB
  2. BCrypt.matches(password, user.passwordHash)
  3. If valid → JwtTokenProvider.generateToken(...)
  4. Return LoginResponse(token, displayName, role, expiresIn)
  5. If invalid → throw 401 Unauthorized
```

---

#### [NEW] `service/DashboardService.java`
```
getStats():
  - advisoriesToday = count advisories where timestamp >= today midnight
  - indicatorsVerified = count indicators where status in (Verified, Enforced)
  - actionsEnforced = count enforcement_actions where status = "Enforced"
  - pendingApprovals = count approval_requests where status = "PENDING"
  → return DashboardStats

getEvents(filter, page, size):
  - Query enforcement_actions + advisories, merge into DashboardEvent list
  - Filter by category if filter != "all"
  - Sort by timestamp DESC
  - Return PageResponse<DashboardEvent>
```

---

#### [NEW] `service/AdvisoryService.java`
```
getAdvisories(source, search, page, size):
  - Build MongoDB query with optional source filter and text search
  - Pageable sort by timestamp DESC
  → PageResponse<Advisory>

getStats():
  - total, unreviewed (status=Pending), avgTriageMinutes, criticalIndicators
  → AdvisoryStatsDto

markReviewed(List<String> ids):
  - Bulk update: set status="Reviewed" where id in ids
  - Log each to Merkle ledger via LedgerService
```

---

#### [NEW] `service/IndicatorService.java`
```
getIndicators(search, page, size):
  - Text search across type, value, source
  → PageResponse<Indicator>

getStats():
  - total, highConfidence (>90%), activeBlocks (status=Enforced), addedToday
  → IndicatorStatsDto

exportCsv():
  - Query all indicators, format as CSV string
  → byte[] (CSV content)
```

---

#### [NEW] `service/EnforcementService.java`
```
getActions(status, search, page, size):
  - Filter by status, search across indicator/action/tier
  → PageResponse<EnforcementAction>

getStats():
  - total, automatedRate, activeTierBlocks, manualReviews, addedToday
  → EnforcementStatsDto
```

---

#### [NEW] `service/ApprovalService.java`
```
getPendingApprovals():
  - Query where status = "PENDING", sort by requestedAt DESC
  → List<ApprovalRequest>

approve(id, analystNotes, resolvedByUserId):
  1. Set status = "APPROVED", resolvedBy, resolvedAt, analystNotes
  2. Create new EnforcementAction from the approval details
  3. Commit to Merkle ledger via LedgerService
  → updated ApprovalRequest

reject(id, analystNotes, resolvedByUserId):
  1. Set status = "REJECTED", resolvedBy, resolvedAt, analystNotes
  2. Commit rejection to Merkle ledger
  → updated ApprovalRequest
```

---

#### [NEW] `service/LedgerService.java` ⭐ Core Innovation
```
commitRecord(description, scope, actor, actorSub, actorIcon, category):
  1. Find latest record → get its hash and blockNumber
  2. newBlockNumber = latestBlockNumber + 1
  3. dataToHash = previousHash + "|" + newBlockNumber + "|" + description + "|" + timestamp
  4. hash = SHA-256(dataToHash) → hex string
  5. Save new LedgerRecord(blockNumber, hash, previousHash, ...)
  → LedgerRecord

getRecords(category, search, page, size):
  → PageResponse<LedgerRecord>

getStats():
  - totalRecords, chainIntegrity, latestBlock, merkleRoot, committedToday
  → LedgerStatsDto

verifyChainIntegrity():
  1. Load ALL records ordered by blockNumber ASC
  2. For each record (starting from block 1):
     - Recompute expectedHash = SHA-256(record.previousHash + "|" + blockNumber + "|" + description + "|" + timestamp)
     - Compare expectedHash == record.hash
     - Verify record.previousHash == previousRecord.hash
  3. If any mismatch → return { valid: false, failedAtBlock: N }
  → LedgerVerifyResponse

generateProof():
  → LedgerProofResponse (latest merkle root, block height, node list, timestamp)
```

**SHA-256 implementation**: `java.security.MessageDigest.getInstance("SHA-256")` — FIPS 180-4 compliant, no external dependency.

---

#### [NEW] `service/SettingsService.java`
```
getSettings():
  - Load singleton document from system_settings collection
  - If none exists, create with defaults (threshold=85, certIn=true, honeynet=true, stix=false, dualAuth=true, ledgerRepl=true)
  → SystemSettings

updateSettings(threshold, feeds, policies, updatedBy):
  - Validate threshold 50-100
  - Update document in MongoDB
  - Commit change to Merkle ledger
  → SystemSettings
```

---

### Phase 7 — REST Controllers (8 files)

All controllers are under `@RequestMapping("/api/...")` and return JSON.

---

#### [NEW] `controller/AuthController.java`
| Method | Path | Request | Response |
|---|---|---|---|
| `POST` | `/api/auth/login` | `LoginRequest {email, password}` | `LoginResponse {token, displayName, role, expiresIn}` |

**No authentication required** for this endpoint.

---

#### [NEW] `controller/DashboardController.java`
| Method | Path | Params | Response |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | — | `DashboardStats` |
| `GET` | `/api/dashboard/events` | `?filter=all\|enforcement\|advisory&page=0&size=10` | `PageResponse<DashboardEvent>` |

---

#### [NEW] `controller/AdvisoryController.java`
| Method | Path | Params/Body | Response |
|---|---|---|---|
| `GET` | `/api/advisories` | `?source=&search=&page=0&size=20` | `PageResponse<Advisory>` |
| `GET` | `/api/advisories/stats` | — | `AdvisoryStatsDto` |
| `PATCH` | `/api/advisories/mark-reviewed` | `MarkReviewedRequest {ids: [...]}` | `{updated: N}` |

---

#### [NEW] `controller/IndicatorController.java`
| Method | Path | Params | Response |
|---|---|---|---|
| `GET` | `/api/indicators` | `?search=&page=0&size=20` | `PageResponse<Indicator>` |
| `GET` | `/api/indicators/stats` | — | `IndicatorStatsDto` |
| `GET` | `/api/indicators/export` | — | CSV file download (`Content-Type: text/csv`) |

---

#### [NEW] `controller/EnforcementController.java`
| Method | Path | Params | Response |
|---|---|---|---|
| `GET` | `/api/enforcement` | `?status=&search=&page=0&size=20` | `PageResponse<EnforcementAction>` |
| `GET` | `/api/enforcement/stats` | — | `EnforcementStatsDto` |

---

#### [NEW] `controller/ApprovalController.java`
| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/approvals` | — | `List<ApprovalRequest>` |
| `POST` | `/api/approvals/{id}/approve` | `ApprovalActionRequest {analystNotes}` | `ApprovalRequest` (updated) |
| `POST` | `/api/approvals/{id}/reject` | `ApprovalActionRequest {analystNotes}` | `ApprovalRequest` (updated) |

---

#### [NEW] `controller/LedgerController.java`
| Method | Path | Params | Response |
|---|---|---|---|
| `GET` | `/api/ledger` | `?category=&search=&page=0&size=20` | `PageResponse<LedgerRecord>` |
| `GET` | `/api/ledger/stats` | — | `LedgerStatsDto` |
| `POST` | `/api/ledger/verify` | — | `LedgerVerifyResponse` |
| `GET` | `/api/ledger/proof` | — | `LedgerProofResponse` (JSON download) |

---

#### [NEW] `controller/SettingsController.java`
| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/settings` | — | `SystemSettings` |
| `PUT` | `/api/settings` | `SystemSettings` (partial) | `SystemSettings` (updated) |

---

### Phase 8 — Data Seeder (1 file)

#### [NEW] `seed/DataSeeder.java`
- Implements `CommandLineRunner`
- Checks if `users` collection is empty → if so, seeds everything
- **Seeds:**

| Collection | Count | Details |
|---|---|---|
| `users` | 1 | `analyst.lead@defense.internal` / BCrypt("kavach2025"), role=ADMIN |
| `advisories` | 4 | Same data currently in AdvisoriesScreen (CERT-In, CISA KEV, NVD Feed, Shadowserver) |
| `indicators` | 4 | Same data currently in IndicatorsScreen (IPs, domain, file hash) |
| `enforcement_actions` | 4 | Same data currently in EnforcementScreen |
| `approval_requests` | 2 | Same data currently in ApprovalsScreen |
| `ledger_records` | 4 | Same data currently in LedgerScreen — **with valid Merkle chain** (each hash computed from previous) |
| `system_settings` | 1 | threshold=85, certIn=true, honeynet=true, stix=false, dualAuth=true, ledgerRepl=true |

---

### Phase 9 — Frontend Integration (10 files modified)

---

#### [MODIFY] `vite.config.js`
Add server proxy so all `/api` calls route to Spring Boot:
```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

---

#### [NEW] `src/api/apiClient.js`
```js
- Stores JWT token in localStorage after login
- export async function apiGet(path) → fetch with Authorization header
- export async function apiPost(path, body) → fetch POST with Authorization header
- export async function apiPut(path, body) → fetch PUT
- export async function apiPatch(path, body) → fetch PATCH
- export async function login(email, password) → POST /api/auth/login, store token
- export function logout() → clear token from localStorage
- export function isAuthenticated() → check if token exists and not expired
- Auto-redirect to login on 401 response
```

---

#### [MODIFY] `src/App.jsx`
- Replace `useState(false)` auth with `isAuthenticated()` from apiClient
- Pass `login()` / `logout()` functions to screens

---

#### [MODIFY] `src/screens/LoginScreen.jsx`
- `handleSubmit` → call `login(email, password)` from apiClient
- On success → `onLoginSuccess()`
- On failure → show error message from backend

---

#### [MODIFY] `src/screens/DashboardScreen.jsx`
- `useEffect` → `apiGet('/api/dashboard/stats')` for metric cards
- `useEffect` → `apiGet('/api/dashboard/events?filter=...')` for event table
- Filter buttons update the API query parameter

---

#### [MODIFY] `src/screens/AdvisoriesScreen.jsx`
- `useEffect` → `apiGet('/api/advisories?source=...&search=...&page=...')` for table
- `useEffect` → `apiGet('/api/advisories/stats')` for metric cards
- "Mark reviewed" → `apiPatch('/api/advisories/mark-reviewed', {ids: [...]})`, then refresh

---

#### [MODIFY] `src/screens/IndicatorsScreen.jsx`
- `useEffect` → `apiGet('/api/indicators?search=...&page=...')` for table
- `useEffect` → `apiGet('/api/indicators/stats')` for metric cards
- "Export CSV" → `apiGet('/api/indicators/export')` → trigger download

---

#### [MODIFY] `src/screens/EnforcementScreen.jsx`
- `useEffect` → `apiGet('/api/enforcement?status=...&search=...')` for table
- `useEffect` → `apiGet('/api/enforcement/stats')` for metric cards

---

#### [MODIFY] `src/screens/ApprovalsScreen.jsx`
- `useEffect` → `apiGet('/api/approvals')` for pending queue
- "Authorize" → `apiPost('/api/approvals/{id}/approve', {analystNotes})`, then refresh
- "Reject" → `apiPost('/api/approvals/{id}/reject', {analystNotes})`, then refresh

---

#### [MODIFY] `src/screens/LedgerScreen.jsx`
- `useEffect` → `apiGet('/api/ledger?category=...&search=...')` for table
- `useEffect` → `apiGet('/api/ledger/stats')` for metric cards
- "Verify integrity" → `apiPost('/api/ledger/verify')` → show result
- "Download proof" → `apiGet('/api/ledger/proof')` → trigger JSON download

---

#### [MODIFY] `src/screens/SettingsScreen.jsx`
- `useEffect` → `apiGet('/api/settings')` → populate form state
- "Save settings" → `apiPut('/api/settings', {threshold, feeds, policies})`, show confirmation

---

## Verification Plan

### Build & Run
```bash
# Terminal 1 — Backend
cd kavach-backend
mvn clean package -DskipTests
java -jar target/kavach-backend-1.0.0.jar

# Terminal 2 — Frontend
cd ..
npm run dev
```

### Manual Verification Checklist
- [ ] Login with `analyst.lead@defense.internal` / `kavach2025` → JWT returned, stored in localStorage
- [ ] Unauthorized API call without token → 401
- [ ] Dashboard loads real stats from MongoDB
- [ ] Advisories table populates from `/api/advisories`, pagination works
- [ ] Mark reviewed → updates MongoDB, reflected on refresh
- [ ] Indicators search and export CSV work
- [ ] Enforcement table with status filter works
- [ ] Approval queue: approve/reject → creates enforcement action + ledger record
- [ ] Ledger: verify integrity → walks full Merkle chain, returns valid
- [ ] Settings: save → persists to MongoDB, reload shows saved values
- [ ] All metric cards show live computed values from MongoDB

---

## Execution Order

| Step | Files | Est. Time |
|---|---|---|
| 1 | `pom.xml`, `application.yml`, `KavachApplication.java`, `CorsConfig.java`, `MongoConfig.java` | ★ |
| 2 | All 7 model classes | ★ |
| 3 | All 7 repository interfaces | ★ |
| 4 | All 13 DTOs | ★ |
| 5 | `JwtTokenProvider.java`, `JwtAuthFilter.java`, `SecurityConfig.java` | ★★ |
| 6 | All 8 service classes | ★★★ |
| 7 | All 8 controller classes | ★★ |
| 8 | `DataSeeder.java` | ★ |
| 9 | Build & verify backend compiles | ★ |
| 10 | `vite.config.js` proxy, `apiClient.js`, wire all 8 screens | ★★★ |
| 11 | End-to-end test | ★ |
