# Paycor onboarding wizard

A chat-style, step-by-step version of the Dynamis "Connecting to Your Payroll System: Paycor" guide.

```sh
npm run dev    # local dev server
npm run build  # production build to dist/
```

## Content

All copy comes from [`src/content/wizard.json`](src/content/wizard.json). That file uses the Figma guide as its only source. To change wording, edit the JSON, not the JS.

| Field | Purpose |
|---|---|
| `guide` | Page title band (eyebrow + provider name) |
| `assistant.name` | Sender label shown above bot messages |
| `support` | "Need help?" panel: heading, message, email |
| `ui` | Back label and progress strings (`{current}`, `{total}` are filled in) |
| `screens[]` | Ordered screens. Each one has `id`, `type` (`intro`, `step`, `complete`), `title`, `messages[]` and `nextLabel` |
| `screens[].number` | Step number. Only `step` screens have one, and only they count toward "Step X of 4" |
| `screens[].image` | Screenshot key (mapped to a file in `src/index.js`), `alt`, `width`, `height` |
| `screens[].note` | Optional highlighted aside, such as the "not listed" fallback |

Messages support `**bold**`. Email addresses become `mailto:` links automatically.

## UX flow

1. **Overview** (progress: "Overview", bar empty). The assistant explains what the connection does. Next: "Let's start". No Back button.
2. **Step 1 of 4: Enter Your Provider.** Search for the provider, pick the match, click Connect your Payroll. Shows the screenshot, plus a note to email support if the payroll system isn't listed.
3. **Step 2 of 4: Approve Permissions.** Approve data sharing. Explains Finch's role. Shows the screenshot.
4. **Step 3 of 4: Log in to Paycor.** Enter Paycor email and password. Logging in completes the connection. Shows the screenshot.
5. **Step 4 of 4: Confirmation Screen.** Describes the confirmation screen. Shows the screenshot. Next: "I see it, finish".
6. **Complete** (progress: "Complete", bar full). Short wrap-up. Next: "Start over" returns to Overview.

Behavior on every screen:
- Only one screen is visible at a time. When you move forward, the reply you picked shows as a user bubble, like a chat log.
- Back goes to the previous screen and is hidden on Overview.
- Each screen updates the URL hash (`#step-2`), so refreshing keeps your place and links can point to a step.
- After you navigate, focus moves to the new screen's heading, and the chat region is announced politely to screen readers.
- The "Need help?" panel with the support email is always visible. It sits beside the wizard on desktop and below it on narrow screens.
- Bot bubbles fade in one after another unless the user prefers reduced motion.
