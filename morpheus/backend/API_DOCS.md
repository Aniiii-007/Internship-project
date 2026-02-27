# Morpheus API Documentation

Base URL: `http://localhost:5000` (or your production API URL)

This document outlines all available backend endpoints, expected payloads, query parameters, auth requirements, and socket events for frontend integration.

---

## 1. Authentication

All protected routes require an HTTP-Only cookie for the `refreshToken` and an `Authorization: Bearer <accessToken>` header.

### `POST /api/auth/signup`
Creates a brand new user account.
- **Payload:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "StrongPassword123!",
    "role": "student" // or "tutor"
  }
  ```
- **Response (201):** User created, returns userId.

### `POST /api/auth/verify-email`
Verifies the user account using the 6-digit OTP sent to their email.
- **Payload:**
  ```json
  {
    "email": "jane@example.com",
    "otp": "123456"
  }
  ```

### `POST /api/auth/resend-otp`
Requests a new OTP email if the previous one expired.
- **Payload:**
  ```json
  {
    "email": "jane@example.com"
  }
  ```

### `POST /api/auth/login`
Authenticates a verified user and issues tokens.
- **Payload:**
  ```json
  {
    "email": "jane@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response (200):** Sets `refreshToken` HTTP-Only cookie. Returns JSON:
  ```json
  {
    "message": "Login successful",
    "accessToken": "ey...",
    "user": { "id": "uuid", "name": "Jane Doe", "email": "...", "role": "student", "isVerified": true }
  }
  ```

### `POST /api/auth/refresh`
Exchanges a valid refresh cookie for a new access token.
- **Auth:** Requires `refreshToken` cookie.
- **Response (200):** `{ "accessToken": "ey..." }`

### `POST /api/auth/logout`
Logs out user and clears `refreshToken` cookie.
- **Auth:** Requires `refreshToken` cookie.

### `GET /api/auth/me`
Fetches the currently authenticated user's base info.
- **Auth:** Bearer Token.

---

## 2. Profiles

### `POST /api/user/complete-profile`
Complete student onboarding.
- **Auth:** Bearer Token (Role: `student`)
- **Payload:**
  ```json
  {
    "grade": "10th",
    "schoolName": "Springfield High",
    "bio": "Optional bio",
    "subjects": [
      { "subjectId": "uuid", "level": "beginner" }
    ]
  }
  ```

### `GET /api/user/profile`
Get current student's full profile including selected subjects.
- **Auth:** Bearer Token (Role: `student`)

### `POST /api/tutor/complete-profile`
Complete tutor onboarding. Uses FormData (multipart/form-data) because of file uploads.
- **Auth:** Bearer Token (Role: `tutor`)
- **FormData fields:**
  - `education`: string
  - `collegeName`: string
  - `marks`: string (CGPA/Percentage)
  - `degreeName`: string
  - `dob`: "YYYY-MM-DD"
  - `city`: string
  - `experienceYears`: number (integer)
  - `introVideo`: File upload (video)
  - `collegeIdCard`: File upload (image)
  - `subjects`: JSON stringified array -> `'[{"subjectId": "uuid", "level": "advanced"}]'`

### `GET /api/tutor/profile`
Get current tutor's profile and subject mappings.
- **Auth:** Bearer Token (Role: `tutor`)

### `GET /api/tutor/documents` (POST)
Upload a generic document as a tutor (image only).
- **Auth:** Bearer Token (Role: `tutor`)
- **FormData body:** `document` (File)

---

## 3. Discovery (Students)

### `GET /api/user/recommendations`
Get personalized tutor recommendations based on student's subjects and levels.
- **Auth:** Bearer Token (Role: `student`)
- **Query Params:** `?page=1&limit=10`
- **Response:** Array of `tutors` with a `recommendationScore`.

### `GET /api/user/search`
Search all approved tutors with filters.
- **Auth:** Bearer Token (Role: `student`)
- **Query Params:** 
  - `page` (default 1)
  - `limit` (default 10)
  - `subjectName` (string)
  - `level` (beginner, medium, advanced)
  - `minExperience` (number)
  - `minRating` (number 1-5)

### `GET /api/user/tutors/:tutorId`
Public profile of a specific tutor, including the subjects they teach and their latest 5 reviews.
- **Auth:** None (Public)

---

## 4. Connections

### `POST /api/connections`
Student requests to connect with a tutor.
- **Auth:** Bearer Token (Role: `student`)
- **Payload:** `{ "tutorId": "uuid" }`

### `PATCH /api/connections/:id`
Tutor accepts or rejects a student's connection request.
- **Auth:** Bearer Token (Role: `tutor`)
- **Payload:** `{ "status": "accepted" }` // or "rejected"

### `GET /api/connections`
List all connections for the current user. Returns populated tutor details for students, and populated student details for tutors.
- **Auth:** Bearer Token

---

## 5. Chat & Messaging

### `POST /api/chat/conversations`
Initiate or retrieve an existing 1:1 chat between a student and tutor.
- **Auth:** Bearer Token (Role: `student` initiates)
- **Payload:** `{ "tutorId": "uuid" }`
- **Response:** Conversation object

### `GET /api/chat/conversations`
Get all active conversations for the current user (inbox).
- **Auth:** Bearer Token

### `GET /api/chat/messages/:conversationId`
Fetch paginated message history for a conversation.
- **Auth:** Bearer Token (must be a participant)
- **Query Params:** `?page=1&limit=50`

### `PATCH /api/chat/messages/:conversationId/read`
Mark all unread messages in the conversation as read (except those sent by self).
- **Auth:** Bearer Token (must be a participant)

---

## 6. Sessions & WebRTC Video Calls

### `GET /api/sessions`
Get all scheduled, active, or completed sessions for the user.
- **Auth:** Bearer Token

### `GET /api/sessions/:id`
Get a specific session's details, including the history of call events (join, leave, mute toggles).
- **Auth:** Bearer Token (participant only)

### `POST /api/sessions/:id/start`
Tutor starts the session. Resolves `mediasoupRoomId`, sets status to `active`, and emits `#session_link` to the chat via Socket.io.
- **Auth:** Bearer Token (Role: `tutor`)

### `POST /api/sessions/:id/complete`
Mark an active session as completed.
- **Auth:** Bearer Token (participant only)

---

## 7. Reviews

### `POST /api/reviews`
Student leaves a star rating and comment after a session completes. Automatically recalculates tutor's overall rating.
- **Auth:** Bearer Token (Role: `student`)
- **Payload:**
  ```json
  {
    "sessionId": "uuid",
    "rating": 5,
    "comment": "Great session!"
  }
  ```

### `GET /api/reviews/tutor/:tutorId`
Fetch paginated reviews for a specific tutor.
- **Auth:** None (Public)
- **Query Params:** `?page=1&limit=20`

---

## 8. Tutor Testing

### `GET /api/tutor/generate-test`
Generates a multiple-choice test for the tutor based on their declared subjects (uses Gemini AI).
- **Auth:** Bearer Token (Role: `tutor`)

### `POST /api/tutor/submit-test`
Submits answers to the generated test. Grades the test and auto-fails the tutor if the score is below 70%.
- **Auth:** Bearer Token (Role: `tutor`)
- **Payload:**
  ```json
  {
    "testId": "uuid",
    "answers": {
      "q1_uuid": "A",
      "q2_uuid": "C"
    }
  }
  ```

---

## 9. Metadata

### `GET /api/subjects`
Gets the static list of predefined subjects available on the platform.
- **Auth:** None (Public)

---

## 10. Admin Routes

All admin routes require a Bearer token belonging to a user with the `admin` role.

### `GET /api/admin/pending-tutors`
Fetch all tutors whose status is `pending` (haven't been approved or rejected yet). Let's admins review new applicants.

### `GET /api/admin/tutors/:id`
Detailed view of a specific tutor, including their subjects, test attempts, and uploaded documents, for review.

### `PATCH /api/admin/tutors/:id/review`
Approve or reject a tutor's application. Automatically sends an email notification to the tutor via Resend.
- **Payload:**
  ```json
  {
    "status": "approved", // or "rejected"
    "remarks": "Your ID card was blurry, please re-upload." // optional
  }
  ```

---

## 11. WebSocket (Socket.io) Events

Connect via `io("http://localhost:5000", { auth: { token: "accessToken" } })`.

### Chat Events
| Event | Direction | Payload Example | Description |
|---|---|---|---|
| `join_conversation` | Client ➡ Server | `{ conversationId: "uuid" }` | Subscribe to a specific chat room |
| `leave_conversation` | Client ➡ Server | `{ conversationId: "uuid" }` | Unsubscribe |
| `send_message` | Client ➡ Server | `{ conversationId, content, type: "text" }` | Sends a chat message. Saved to DB. |
| `send_schedule_request`| Client ➡ Server | `{ conversationId, subjectId, topic, proposedTime }` | Tutor proposes a session time. |
| `respond_to_schedule` | Client ➡ Server | `{ messageId, action: "accept" }` | Student accepts/rejects a proposed time. |
| `typing` | Client ➡ Server | `{ conversationId, isTyping: true }` | Emit typing indicator |
| `new_message` | Server ➡ Client | `{ id, content, senderId... }` | Received when someone posts a message |
| `user_typing` | Server ➡ Client | `{ userId, isTyping }` | Received typing indicator |

### WebRTC Video Call Events
Rooms for calls are namespaced as `call:<sessionId>`.
| Event | Direction | Payload | Description |
|---|---|---|---|
| `join_call` | Client ➡ Server | `{ sessionId }` | Verify participant, join room, log to DB |
| `webrtc_offer` | Client ➡ Server | `{ sessionId, offer }` | Send SDP offer |
| `webrtc_answer` | Client ➡ Server | `{ sessionId, answer }` | Send SDP answer |
| `webrtc_ice_candidate` | Client ➡ Server | `{ sessionId, candidate }` | Send ICE candidate |
| `call_event` | Client ➡ Server | `{ sessionId, eventType: "muted" }` | Mute/unmute/video_on/video_off. Logged to DB. |
| `end_call` | Client ➡ Server | `{ sessionId }` | Complete session, log to DB. |
| `call_peer_joined` | Server ➡ Client | `{ userId, role }` | Notifies that the other participant joined |
| `peer_call_event` | Server ➡ Client | `{ role, eventType }` | Notifies UI to show mute/camera off icons |
| `call_ended` | Server ➡ Client | `{ endedAt }` | Force both clients to leave the call interface |


## 12. AI Chatbot (OCR Integration)

These routes handle persistent 1:1 chat sessions with the Morpheus AI tutor. It supports answering text queries or processing image uploads using Tesseract OCR.

### `POST /api/chatbot/session`
Initiates a new AI chat session.
- **Auth:** Bearer Token
- **Payload:** `{ "title": "Math Homework Questions" }` (Optional)
- **Response:** Returns the newly created `aiChatSession` object.

### `GET /api/chatbot`
Fetches all AI chat sessions for the authenticated user.
- **Auth:** Bearer Token
- **Response:** Returns an array of `aiChatSession` objects ordered by `updatedAt`.

### `GET /api/chatbot/:sessionId`
Fetches the complete message history for a specific AI chat session.
- **Auth:** Bearer Token (must own the session)
- **Response:** Returns an array of `aiChatMessage` objects belonging to the session.

### `POST /api/chatbot/:sessionId/ask`
Asks a question in a specific AI session. Can include an image which will be processed via OCR and uploaded to ImageKit.
- **Auth:** Bearer Token (must own the session)
- **FormData body:** 
  - `question`: string (optional, usually provided if no image is sent, or sent alongside an image)
  - `image`: File (optional, processed through Tesseract OCR for text extraction)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "userMessage": { "id": "...", "role": "user", "content": "Question or OCR text...", "imageUrl": "..." },
      "systemMessage": { "id": "...", "role": "model", "content": "AI generated step-by-step response..." }
    }
  }
  ```

---

## 13. Community Chat

A real-time, AI-moderated global chat room exclusively for Students to discuss educational topics. 

### WebSocket Events (Namespace: default)
| Event | Direction | Payload Example | Description |
|---|---|---|---|
| `join_community_chat` | Client ➡ Server | `None` | Joins the `community_room` namespace (Students only). |
| `send_community_message` | Client ➡ Server | `{ content: "How do I solve problem 24?" }` | Sends a message. Scanned by Groq AI. If toxic/NSFW, it is blocked. |
| `new_community_message`| Server ➡ Client | `{ id, senderId, content, createdAt... }` | Received when a valid message passes AI moderation. |
| `community_message_rejected` | Server ➡ Client | `{ message: "...", reason: "..." }` | Emitted back to the sender if their message was flagged by the AI. |

### REST API `GET /api/community/history`
Fetches a paginated history of the most recently approved community messages. Useful for initial load when navigating to the chat page.
- **Auth:** Bearer Token
- **Query Params:** `?limit=50`
- **Response:** Returns an array (chronologically ordered from oldest to newest) of `communityMessages`, populated with sender details (`sender: { id, name }`).