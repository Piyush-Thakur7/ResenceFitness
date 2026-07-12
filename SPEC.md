# Spec: AI Coach Chat Panel

Expose a new "AI Coach" chat panel within the application dashboard, allowing users to converse in real-time with an AI personal trainer powered by Gemini 3.5.

## Proposed Changes:
1. **API Endpoint (`src/app/api/chat-coach/route.js`)**:
   - Create a new API route `/api/chat-coach` that receives the user's chat history and profile.
   - Inject the profile details (age, height, weight, injuries, goals, conditioning, diet preference) as a system instruction to Gemini.
   - Use the standard Google Gen AI SDK to stream or generate the response.
2. **AI Coach Tab Panel (`src/components/AICoachSection.js`)**:
   - Create a clean, premium, dark-mode chat interface with scrollable message logs, typing indicators, and motivational template helper chips (e.g., "Customize my workout for lower back pain", "High-protein veg ideas").
3. **Register Tab in Navigation (`src/app/page.js`)**:
   - Add `"coach"` as an option in `activeTab`.
   - Update Sidebar navigation options in `page.js` to render the "AI Coach" button with a nice chat icon.
   - Render `<AICoachSection profile={profile} />` under the active tab conditional.

## Verification Plan:
- Execute `npm.cmd run build` to verify clean compilation.
- Commit changes and push to trigger automated deployment.
