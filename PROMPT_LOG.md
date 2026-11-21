# CivicLens — Development Prompt Log

This document logs all major requirements and instructions provided during the development of CivicLens.

---

## Phase 1 — Scaffold & Architecture

**Objective:** Establish a clean, working MERN-stack project architecture.

**Frontend requirements:**
- React with Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React icons
- Pages: Home/Citizen Portal, Submit Complaint, Complaint Submission Success, Municipal Officer Dashboard, Complaint Details
- Components: Navbar, Sidebar, Button, Input, Modal, Complaint Card, Loading State, Error State, Empty State

**Backend requirements:**
- Node.js
- Express.js
- Environment configuration
- CORS
- JSON parsing
- Centralised error handling
- Health-check endpoint: GET /api/health

**Folder structure:**
- Modular structure separating: Routes, Controllers, Models, Services, Middleware, Configuration, Utilities

**Design:**
- Dark navy foundation
- Blue accent colours
- Premium SaaS styling
- Poppins and Inter typography
- Responsive layouts

**Completion criteria:**
- Frontend starts successfully
- Backend starts successfully
- Frontend can communicate with backend
- All pages are reachable
- No critical console errors
- Environment configuration is prepared

---

## Phase 2 — Backend Foundation & MongoDB Persistence

**Objective:** Build the complete backend foundation and MongoDB persistence layer.

**MongoDB connection:**
- Configure MongoDB Atlas using MONGODB_URI
- Use Mongoose and create a reusable database connection module

**Complaint model:**
- description: String, required
- originalLanguage: String
- imageUrl: String, optional
- category: Enum
- severity: Enum
- reason: String
- department: String
- status: Pending / In Progress / Resolved
- Support processing/review state for AI failure
- createdAt, updatedAt

**Category enum:** Roads, Waste, Water, Electricity, Trees, Drainage

**Severity enum:** Critical, High, Medium, Low

**Image upload:**
- Optional image upload using Multer
- Accept supported image formats
- Validate file type
- Apply reasonable file size limits
- Never trust filenames supplied by users
- Provide local-development image handling
- Support Cloudinary as optional production storage provider
- Make uploaded image bytes available to AI processing service

**REST APIs:**
- POST /api/complaints
- GET /api/complaints
- GET /api/complaints/:id
- GET /api/complaints/stats

**Engineering requirements:**
- Use controllers and route modules
- Implement consistent response formats
- Add input validation
- Add proper HTTP status codes
- Handle database failures
- Prevent duplicate request processing where practical
- Do not expose credentials
- Do not return placeholder data as actual database records

---

## Phase 3 — AI Complaint Analysis Service

**Objective:** Build a reliable AI complaint-analysis service using the Google Gemini API.

**AI input:**
- Accept citizen complaint text
- English or regional-language text
- Optional uploaded photograph
- AI must understand original complaint without requiring translation
- When photograph supplied, analyse as additional evidence
- Never invent details not supported by complaint or image

**Classification:**
- Return exactly one of: Roads, Waste, Water, Electricity, Trees, Drainage

**Severity assessment:**
- Return exactly one of: Critical, High, Medium, Low
- Assess: threat to human life, risk of injury, number of people affected, location context, extent of damage, urgency
- Generate short, understandable explanation for severity
- Do not classify every complaint as Critical
- Make severity proportional to evidence

**Department mapping:**
- Deterministic backend mapping:
  - Roads → Road Maintenance Department
  - Waste → Sanitation Department
  - Water → Water Supply Department
  - Electricity → Electrical Department
  - Trees → Tree Management Department
  - Drainage → Drainage Department
- Do not depend on AI to invent department names

**AI response structure:**
```json
{
  "category": "Electricity",
  "severity": "Critical",
  "reason": "An exposed electrical wire near a school presents an immediate safety risk.",
  "department": "Electrical Department",
  "originalLanguage": "English",
  "confidence": 0.95
}
```

**AI reliability:**
- API timeout handling
- Invalid JSON handling
- Gemini API error handling
- Category and severity validation
- Appropriate fallback and human-review handling
- Secure environment-variable configuration
- Do not create fake AI responses when API credentials are missing

**Integration:**
- Connect AI service to POST /api/complaints
- Flow: Citizen input → Backend → Gemini AI → Validate result → Department mapping → MongoDB

**Test requirements:**
- Critical electrical complaint
- Road complaint
- Garbage complaint
- Water complaint
- Regional language complaint
- Image-based complaint
- Verify actual Gemini responses are being used

---

## Phase 4 — Citizen-Facing Complaint Reporting Experience

**Objective:** Build the complete citizen-facing complaint reporting experience and connect it to the backend.

**Citizen home page:**
- CivicLens branding
- Clear introduction to the platform
- Prominent Report an Issue button
- How It Works section
- Supported complaint categories
- Responsive navigation

**Complaint submission form:**
- Complaint description textarea
- Language selector (if needed)
- Optional photograph upload
- Image preview
- Remove image option
- Submit Complaint button
- Accept complaints in English or regional languages
- Interface should not force citizens to write in English

**Validation:**
- Required text validation
- Reasonable text length limits
- Supported image formats
- Image size limits
- Clear validation messages

**Backend integration:**
- Use Axios to submit multipart/form-data to POST /api/complaints
- Connect the actual API
- Do not use simulated AI results

**Processing state:**
- Show meaningful states:
  - Submitting complaint
  - Analysing complaint with AI
  - Generating priority ticket
  - Complaint successfully submitted
  - Processing failure
- Prevent accidental multiple submissions

**Successful submission page:**
- Display: Complaint ID, Detected category, Severity, Severity explanation, Assigned department, Submission confirmation

---

## Phase 5 — Municipal Officer Dashboard

**Objective:** Build a premium municipal officer dashboard connected to the actual MongoDB-backed APIs.

**Dashboard overview:**
- Display statistics: Total complaints, Critical complaints, High complaints, Medium complaints, Low complaints
- Use actual backend statistics

**Complaint management table:**
- Display: Complaint ID, Complaint description, Category, Severity, Severity reasoning, Assigned department, Submission date, Current status

**Priority ordering (mandatory):**
- Sort tickets using: Critical → High → Medium → Low
- Ensure sorting happens on the backend
- Frontend preserves the returned priority order

**Filters:**
- Filter by category
- Filter by severity
- Filter by department
- Search by complaint description or ID
- Filters must work with actual complaint records

**Complaint details:**
- When officer selects a complaint, show:
  - Full original complaint
  - Uploaded image (when available)
  - AI classification
  - Severity
  - AI-generated explanation
  - Assigned department
  - Submission timestamp
  - Processing and review information

**Visual design:**
- Premium administrative interface with:
  - Collapsible sidebar
  - Statistics cards
  - Professional complaint table
  - Severity badges
  - Search and filter controls
  - Responsive layouts
  - Loading, empty and error states

**Restrictions:**
- Do not populate main dashboard with fabricated complaints
- May provide clearly labelled development-only seed script
- All displayed records must originate from the database
- Do not build complicated authentication unless time permits

---

## Phase 6 — Integration Audit

**Objective:** Perform a complete integration audit of the application. Do not add major new features. Focus on making all existing functionality reliable.

**Mandatory feature verification:**
1. Citizens can submit free-text complaints in English or regional languages and optionally attach a photograph
2. AI classifies complaints into Roads, Waste, Water, Electricity, Trees or Drainage
3. AI assigns Critical, High, Medium or Low severity and provides a one-line reason
4. Tickets are routed to the appropriate department
5. The dashboard displays actual complaints in severity-priority order

**End-to-end testing:**
- Citizen submits complaint → Backend receives input → Gemini analyses complaint → Backend validates AI response → Department is assigned → Complaint is stored in MongoDB → Dashboard receives complaint → Ticket appears at the correct priority

**Error testing:**
- Empty complaint
- Invalid image
- Oversized image
- Invalid complaint ID
- Gemini API failure
- MongoDB connection failure
- Malformed AI response
- Network interruption
- Duplicate submission

**Security review:**
- API key exposure
- Environment-variable configuration
- Input validation
- File upload restrictions
- CORS configuration
- Error responses
- Sensitive information in logs

**Performance and UI review:**
- Mobile responsiveness
- Loading indicators
- Dashboard refresh behaviour
- Long complaint text
- Empty dashboard
- Error presentation

**Fix all significant defects:**
- Do not merely report bugs
- Fix issues that can be resolved within the existing architecture
- Rerun tests and report unresolved limitations honestly

**Final report:**
- Provide feature-by-feature verification table: Feature | Test performed | Result | Remaining issues
- Do not claim 100% completion without evidence

---

## Phase 7 — Final Submission & Demonstration

**Objective:** Prepare the application for final submission and demonstration.

**README.md:**
- Project name
- Problem statement
- Problem interpretation
- Proposed solution
- Key features
- Technology stack
- System architecture
- Application workflow
- AI integration details
- API documentation
- Database schema
- Installation instructions
- Environment-variable setup
- Local development instructions
- Deployment instructions
- Limitations and future improvements

**Environment configuration:**
- Create .env.example files without real credentials
- Document variables: MONGODB_URI, GEMINI_API_KEY, PORT, CLIENT_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- Do not commit real .env files or secret keys

**Deployment preparation:**
- Prepare React frontend for Vercel
- Prepare Express backend for Render or another suitable Node hosting provider
- MongoDB Atlas database
- Configure: Production API base URL, CORS, Environment variables, Image storage configuration, Health-check endpoint
- If deployment credentials unavailable, provide exact deployment instructions

**Final UI polish:**
- Check: Application branding, Consistent typography, Navigation, Responsive design, Dashboard presentation, Error and loading states

**Demonstration preparation:**
- Prepare a realistic demonstration sequence covering all five mandatory requirements
- Recommend sample complaints and expected AI outputs
- Do not create fabricated live results

**Final submission report:**
- Final folder structure
- Implemented features
- API endpoint list
- Database information
- AI integration explanation
- Local run instructions
- Deployment status and URL (if successfully deployed)
- Known limitations
- Testing results
- Demo instructions
- Ensure GitHub repository contains source code and README setup instructions are accurate
- Do not create fake GitHub commits, backdate commits or claim deployment occurred without verifying it

---

## UI/UX Design Instructions

**Design philosophy:**
- Minimal and uncluttered
- Easy to understand at first glance
- Straight to the point
- Professional but visually attractive
- Clear typography and readable content
- Consistent spacing and alignment
- Minimal unnecessary animations
- Avoid excessive gradients, shadows and glassmorphism
- Prioritise usability over decoration

**Visual identity and theme system:**
- Light Theme — Default:
  - Primary: Deep Navy #172554
  - Secondary: Blue #2563EB
  - Accent: Cyan #06B6D4
  - Background: Light Gray #F8FAFC
  - Surface: White #FFFFFF
  - Main Text: #0F172A
  - Secondary Text: #64748B
  - Borders: #E2E8F0
- Dark Theme — Optional:
  - Primary: #60A5FA
  - Secondary: #3B82F6
  - Accent: #22D3EE
  - Background: #0B1220
  - Surface: #111C30
  - Main Text: #F1F5F9
  - Secondary Text: #94A3B8
  - Borders: #25334A
- Theme switching: Light/Dark toggle with localStorage persistence
- Severity colours: Critical (Red), High (Orange), Medium (Blue/Amber), Low (Green)
- Typography: Poppins for headings, Inter for body text

**Citizen interface:**
- Navigation: CivicLens logo, Home, Report an Issue, About, Theme toggle, "Report a Problem" button
- Hero: "Your City. Your Voice. Better Living." with supporting text and CTAs
- How It Works: Report → Analyse → Route (3 steps)
- Complaint submission: Heading "Report a Civic Issue", description textarea, language selector, "Upload Photos (Optional)", image preview, remove option, Submit Complaint button
- Processing states: Receiving complaint, Analysing with AI, Generating priority ticket, Saving complaint
- Success screen: "Your complaint has been registered." with Complaint ID, category, severity, reason, department

**Municipal Officer Dashboard:**
- Sidebar: Overview, All Complaints, Critical Issues, Department Categories, Settings (optional)
- Header: "Municipal Overview", supporting text, current date, refresh action, theme toggle
- Statistics cards: Total Complaints, Critical, High, Medium and Low (4 cards)
- Complaint table: Complaint ID, Description, Category, Severity, Assigned Department, Submitted Date
- Filters: Search, Category, Severity, Department
- Complaint details: Original complaint, photo, AI classification, severity, reasoning, department, timestamp

**Component design rules:**
- Reusable components: Navbar, Sidebar, ThemeToggle, Button, Input, Textarea, ImageUploader, SeverityBadge, CategoryBadge, StatisticCard, ComplaintTable, ComplaintDetails, LoadingIndicator, EmptyState, ErrorMessage, ConfirmationDialog
- Centralised theme variables or design tokens
- Consistent sizing, spacing, colours and typography

**Interaction and experience:**
- Responsive layouts
- Functional Light/Dark theme switching
- Clear button hover states
- Accessible form labels
- Visible focus states
- Loading indicators
- Success and error messages
- Empty-state illustrations or simple icons
- Mobile-friendly complaint submission
- Readable tables on smaller screens
- Avoid unnecessary animations and modal popups
- Ensure theme switch does not reset form data, navigate away, or interrupt submission

**Technical implementation:**
- React + Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Central theme provider or equivalent
- CSS variables or Tailwind theme configuration for both themes
- localStorage to preserve selected theme
- Proper responsive breakpoints
- UI works on desktop, tablet and mobile

**Final quality expectations:**
1. Inspect every page
2. Check visual consistency
3. Remove unnecessary decorative elements
4. Verify all navigation links
5. Test form validation
6. Verify photo upload is optional
7. Verify label reads exactly "Upload Photos (Optional)"
8. Test Light/Dark theme switching on every page
9. Verify theme persistence after refreshing
10. Check text and badge contrast in both themes
11. Verify API integration
12. Check responsive layouts
13. Fix console errors
14. Ensure all five mandatory features remain functional

---

## Additional Feature Requests (Post-Phase 7)

### Location Field
- Add address or location bar to complaint form
- Make it functional (stored in MongoDB, displayed in UI, searchable)

### UI Text Adjustments
- Make submit page heading black in light mode
- Make primary button text black in light mode
- Remove "(Optional)" from Location field label
- Make submit page text black in light mode (labels, support, placeholders)

### Folder Rename
- Rename main folder from `p2p` to `CivicLens`

### Deployment
- Push to GitHub
- Deploy backend on Render
- Deploy frontend on Vercel
- Configure MongoDB Atlas for production
- Maintain prompt log (this document)

---

## Current Status

- ✅ All 7 phases completed
- ✅ UI/UX redesign with light/dark themes
- ✅ Location field added
- ✅ Folder renamed to CivicLens
- ✅ Git repo initialized with clean history
- ⏳ GitHub push pending (requires user credentials)
- ⏳ Render deployment pending (requires user account)
- ⏳ Vercel deployment pending (requires user account)
- ⏳ Production MongoDB Atlas configuration pending
