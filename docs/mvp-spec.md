# Paadum Meen — MVP SPEC

## 1\. Product Summary

**Paadum Meen** is a browser-based, portrait-mode interactive kiosk experience built around an animated Batticaloa singing fish mascot.

The kiosk is primarily for **MakerSpace by DreamSpace** and the wider **DreamSpace ecosystem**. It helps children, library visitors, and community members learn about MakerSpace, DreamSpace Academy, DreamSpace initiatives, Batticaloa, and the Batticaloa Public Library through natural speech interaction.

The visitor talks to the fish by holding the **Space** key. The fish listens, thinks, and responds with voice using a direct speech-to-speech AI model.

The MVP should feel presentable, alive, locally rooted, and simple enough to build quickly.

---

## 2\. MVP Objective

The MVP should demonstrate:

1. A visually appealing animated fish mascot.  
2. Voice-only visitor interaction.  
3. Direct speech-to-speech AI conversation.  
4. A topic-limited public-kiosk experience.  
5. A clear DreamSpace-first identity with Batticaloa cultural flavor.

The MVP is not a full chatbot platform, admin dashboard, library catalogue assistant, or general-purpose AI companion.

---

## 3\. Target Context

### 3.1 Physical Context

The app is intended to run as a kiosk-style experience in a public/community setting such as:

* MakerSpace by DreamSpace  
* DreamSpace Academy spaces  
* Batticaloa Public Library  
* Public demonstrations  
* Community learning events

### 3.2 Device Context

The MVP is designed for:

* Desktop browser  
* Portrait 9:16 display layout  
* Keyboard available for visitor interaction  
* Mouse available only for admin control  
* External or built-in microphone  
* Speaker output

No mobile, tablet, touch-first, or multi-device support is required for MVP.

---

## 4\. Target Users

### 4.1 Primary Users

* Children visiting the space  
* Students  
* Library visitors  
* Community members  
* First-time visitors to DreamSpace or MakerSpace

### 4.2 Admin User

An admin or facilitator may use the mouse to reset the session manually when needed.

The admin is not expected to manage content, settings, or system behavior through the UI in the MVP.

---

## 5\. Core User Interaction

### 5.1 Visitor Interaction

The visitor has only one interaction:

**Hold Space to talk. Release Space to stop talking.**

There is no text input, mouse interaction, touch interaction, or visible visitor-facing button.

### 5.2 Admin Interaction

The admin has one interaction:

**Reset Session** button

The reset button is visible in the app but intended only for the admin/facilitator using a mouse.

---

## 6\. Conversation Scope

The fish should mainly talk about DreamSpace and MakerSpace topics.

### 6.1 Primary Topics

The fish should prioritize:

1. MakerSpace by DreamSpace  
2. DreamSpace Academy  
3. DreamSpace initiatives and entities  
4. Learning, creativity, technology, innovation, and community impact connected to DreamSpace

### 6.2 Secondary Topics

The fish may also answer questions about:

1. Batticaloa  
2. Batticaloa Public Library  
3. Kallady Bridge  
4. The cultural idea of Batticaloa’s singing fish

### 6.3 Out-of-Scope Questions

The fish should not behave like a general-purpose AI assistant.

If users ask unrelated questions, the fish should politely guide them back to MakerSpace, DreamSpace, Batticaloa, or the Public Library.

Example fallback behavior:

“I can mainly talk about MakerSpace, DreamSpace, Batticaloa, and the Public Library. Ask me about one of those.”

---

## 7\. AI Behavior

### 7.1 AI Interaction Model

The MVP uses a **direct speech-to-speech AI model**.

The interaction should not be designed as a separate speech-to-text → text generation → text-to-speech pipeline.

Expected behavior:

1. Visitor holds Space and speaks.  
2. App sends speech/audio to AI model.  
3. AI model responds with streamed voice output.  
4. App plays the AI voice response through the speaker.  
5. Fish speaking animation plays during the response.  
6. If the AI model provides subtitles/transcript, the app displays them.

### 7.2 System Prompt

The AI behavior, personality, allowed topics, facts, and refusal behavior should be controlled by a strong system prompt.

The system prompt should define:

* Mascot identity  
* DreamSpace-first role  
* Allowed topics  
* Out-of-scope behavior  
* Child-friendly tone  
* Public-kiosk safety expectations  
* Short answer style  
* Multilingual behavior expectations

### 7.3 Guardrails

For MVP, guardrails rely on the strong system prompt only.

No output filter, moderation layer, transcript classifier, or custom response validator is required for MVP.

This is intentional because direct speech-to-speech output filtering may add unnecessary complexity at MVP stage.

---

## 8\. Session Behavior

### 8.1 Session Context

The app may keep short conversation context during an active visitor session.

The session should not be treated as long-term memory.

### 8.2 Idle Reset

After the AI finishes speaking, if there is no new visitor speech for **30 seconds**, the app should:

1. Return the fish to idle/resting state.  
2. Clear the conversation context.  
3. Keep the system prompt active.  
4. Clear visible subtitles/transcript if shown.  
5. Resume floating suggested-question bubbles.

This keeps cost down, protects privacy, and prevents one visitor’s conversation from affecting the next visitor.

### 8.3 Manual Reset

When the admin clicks **Reset Session**, the app should:

1. Stop any active listening.  
2. Stop any active AI response if possible.  
3. Clear the active conversation context.  
4. Keep the system prompt active.  
5. Return the fish to idle state.  
6. Clear visible subtitles/transcript if shown.  
7. Resume floating suggested-question bubbles.

---

## 9\. Visual Direction

### 9.1 Screen Format

The app should use a portrait **9:16** composition.

The screen should feel like a kiosk display, not a normal website.

### 9.2 Background

The visual world should be based on Batticaloa’s river identity.

Required background elements:

* River setting  
* Kallady Bridge in the background  
* Full moon  
* Twinkling stars  
* Gentle water movement  
* Bubbles

The background should be calm, magical, and locally recognizable.

### 9.3 Mascot

The mascot is the **singing fish of Batticaloa**.

The fish should be a 2D layered animated character, not a full 3D model.

The fish should support programmatic movement through layered parts such as:

* Body  
* Tail  
* Fins  
* Eyes  
* Mouth  
* Shadow  
* Music notes

The mascot should feel alive through simple animations:

* Gentle bobbing  
* Tail movement  
* Fin movement  
* Eye movement/blinking  
* Mouth movement during speech  
* Swimming forward and backward

### 9.4 Music Notes

Music symbols should fade in and float upward from the fish’s mouth, especially during idle and speaking states.

They should support the “singing fish” identity without making the screen noisy.

---

## 10\. Suggested Question Bubbles

Since the visitor can only interact through speech, suggested questions must be visual hints only.

They should appear as floating bubbles, not clickable buttons.

Example bubble text:

* “Ask me about MakerSpace”  
* “What can I build here?”  
* “Tell me about DreamSpace Academy”  
* “What is a makerspace?”  
* “How can students learn technology?”  
* “What happens at DreamSpace?”  
* “Ask me about Batticaloa”  
* “Tell me about Kallady Bridge”

The bubbles should:

* Float gently  
* Fade in and out  
* Rotate across supported UI languages  
* Be visible during idle state  
* Fade away or dim during listening/thinking/speaking states

---

## 11\. Language Support

The UI should support:

* English  
* Tamil  
* Sinhala

The AI model is expected to handle multilingual speech interaction.

The MVP needs a simple language selector to switch the available text between the three languages. The suggested question bubbles may rotate or display multilingual instructions.

Subtitles may be shown if the AI model provides them.

---

## 12\. App States

The app should be designed around clear visual states.

### 12.1 Idle State

Default resting state.

Behavior:

* Fish rests slightly in the background.  
* Fish gently bobs in the water.  
* Tail and fins move subtly.  
* Background water, bubbles, moon, and stars animate gently.  
* Suggested question bubbles float on screen.  
* Instruction tells user to hold Space and speak.

### 12.2 Listening State

Triggered while the visitor holds Space.

Behavior:

* Fish reacts to the user.  
* Fish comes slightly forward or becomes visually attentive.  
* Smooth audio visualizer appears.  
* Suggested question bubbles fade or dim.  
* Screen clearly shows that the app is listening.

### 12.3 Thinking State

Triggered after the visitor releases Space and before the AI response starts.

Behavior:

* Fish moves to the front.  
* Thinking animation starts.  
* Small bubbles, dots, or subtle music-note animation may appear.  
* Screen shows that the fish is preparing a response.

### 12.4 Speaking State

Triggered when the AI audio response starts streaming.

Behavior:

* Fish mouth animates while audio plays.  
* Mouth movement should loosely follow output audio amplitude if possible.  
* Music notes float from the fish’s mouth.  
* Fish body may bob gently with the rhythm of speaking.  
* Subtitles appear if available.

### 12.5 Returning State

Triggered after the AI finishes speaking.

Behavior:

* Fish remains attentive briefly.  
* If no new speech occurs within 30 seconds, fish swims back to idle/resting position.  
* Session context is cleared.  
* Suggested question bubbles return.

### 12.6 Error State

Triggered if microphone, audio, model connection, or response generation fails.

Behavior:

* Fish shows a simple error/recovery animation.  
* App gives a short, non-technical message.  
* App should return to idle or allow admin reset.

Example message:

“Something went wrong. Please try again.”

---

## 13\. Listening Visualizer

During listening state, the app should display a simple smooth sound visualizer.

Visualizer direction:

* Similar to voice recorder visualizers  
* Rounded vertical bars or smooth waveform  
* Responds to microphone input amplitude  
* Smooth and calm  
* Not flashy  
* Clearly indicates that the mic is active

The visualizer should disappear when listening ends.

---

## 14\. Subtitles

Voice response is mandatory.

Subtitles are optional and should be shown only if the AI model provides reliable text or transcript output.

Subtitle behavior:

* Show during speaking state  
* Clear after session reset or idle timeout  
* Keep readable for children and public visitors  
* Avoid large transcript history

---

## 15\. Admin Reset Button

The MVP includes one admin-facing control:

**Reset Session**

The button should be accessible by mouse.

It does not need to be visually prominent to visitors, but it should be easy for an admin/facilitator to find.

No other admin controls are required in MVP.

---

## 16\. Privacy and Public-Space Expectations

The MVP should behave appropriately for a public/community setting.

Expected behavior:

* No user login.  
* No visitor profile.  
* No long-term conversation memory.  
* Context clears after idle timeout.  
* Manual reset clears the current session.  
* Visitor interaction is explicit through hold-to-talk.

The MVP should avoid always-listening behavior.

---

## 17\. MVP Inclusions

The MVP includes:

1. Portrait 9:16 kiosk UI.  
2. Animated 2D Batticaloa singing fish mascot.  
3. Moonlit Batticaloa river background with Kallady Bridge.  
4. Floating suggested-question bubbles.  
5. Hold-Space-to-talk interaction.  
6. Direct speech-to-speech AI conversation.  
7. Fish listening/thinking/speaking/idle animations.  
8. Listening audio visualizer.  
9. Voice response playback.  
10. Optional subtitles if available from the AI model.  
11. 30-second idle session reset.  
12. Admin manual reset button.  
13. Strong system-prompt-based topic control.

---

## 18\. MVP Exclusions

The MVP does not include:

1. Text chat input.  
2. Visitor-facing clickable buttons.  
3. Touch interaction.  
4. Mobile or tablet-specific design.  
5. User accounts.  
6. Admin dashboard.  
7. Database-backed content management.  
8. Library catalogue search.  
9. Book recommendation engine.  
10. Long-term memory.  
11. Analytics dashboard.  
12. Output filtering layer.  
13. Input classification layer.  
14. Separate STT/TTS pipeline.  
15. Full 3D character rig.  
16. Multi-character experience.  
17. Camera-based interaction.  
18. Face recognition or user identification.

---

## 19\. Definition of Done

The MVP is considered done, if:

1. A visitor can understand how to interact without training.  
2. Holding Space clearly activates listening.  
3. The fish visibly reacts to listening, thinking, and speaking.  
4. The AI responds by voice with low perceived latency.  
5. The experience feels connected to DreamSpace, MakerSpace, and Batticaloa.  
6. The app avoids general-purpose chatbot behavior.  
7. The admin can reset the session easily.  
8. The session resets automatically after inactivity.  
9. The demo is presentable to children, library visitors, and stakeholders.

---

## 20\. One-Line MVP Definition

**Paadum Meen is a DreamSpace-first, voice-only kiosk experience where visitors hold Space to speak with an animated Batticaloa singing fish that explains MakerSpace, DreamSpace, Batticaloa, and the Public Library through short AI-powered voice conversations.**  
