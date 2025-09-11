# AI Chat Integration Setup Guide

This Jupyter Book includes an embedded AI chat widget to help students with PID control concepts. Here are several ways to set it up:

## Option 1: OpenAI API Integration (Recommended)

The default setup uses OpenAI's GPT API for intelligent responses about PID control.

**Setup:**
1. Get an OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. When you open the chat widget, click "Set API Key" and enter your key
3. The key is stored locally in the browser session only

**Features:**
- Contextual responses about PID control
- Help with exercises and Python code
- Mathematical explanations with LaTeX
- Quick action buttons for common questions

## Option 2: Custom Chat Platform (iframe)

You can embed any chat platform using an iframe approach.

**Edit `_static/chat.js`:**
```javascript
// Replace the ChatWidget initialization with:
window.iframeChatWidget = new IframeChatWidget('https://your-chat-platform.com/embed');
```

**Popular options:**
- ChatGPT Custom GPT with PID control knowledge
- Claude conversation with system prompt
- Local LLM with Ollama + Open WebUI
- Custom chatbot API

## Option 3: Static FAQ Chat

For a simpler approach without API calls:

**Edit `_static/chat.js`** to replace the `callOpenAI` method:
```javascript
async callOpenAI(userMessage) {
    // Simple keyword-based responses
    const responses = {
        "proportional": "The proportional (P) term responds to the current error. Larger Kp gives faster response but can cause overshoot...",
        "integral": "The integral (I) term eliminates steady-state error by accumulating past errors...",
        "derivative": "The derivative (D) term predicts future error and helps reduce overshoot...",
        // Add more responses
    };
    
    const key = Object.keys(responses).find(k => userMessage.toLowerCase().includes(k));
    return key ? responses[key] : "I can help with P, I, D components, tuning, exercises, and more. Try asking about specific topics!";
}
```

## Option 4: Integration with Learning Management Systems

**For Canvas, Moodle, etc.:**
1. Export this Jupyter Book as SCORM package
2. Embed in your LMS
3. Configure chat to connect to LMS discussion forums or built-in AI

## Current Configuration

The chat widget includes:
- **Quick Actions**: Common questions as clickable buttons
- **Context Awareness**: AI knows about the PID lecture content
- **Code Help**: Can explain and debug Python PID implementations
- **Exercise Assistance**: Guides through the 5 hands-on exercises

## Customization

**Modify the system prompt** in `_static/chat.js` to:
- Focus on specific topics
- Adjust response length/style
- Add course-specific context
- Include instructor information

**Style the widget** in `_static/chat.css` to match your theme.

**Add more quick actions** by editing the `quickActions` array in the JavaScript.

## Privacy and Cost Considerations

- **OpenAI API**: Costs ~$0.002 per conversation. Students provide their own keys.
- **Local LLM**: No external calls, but requires setup
- **Iframe**: Depends on the platform's privacy policy

Choose the option that best fits your institution's requirements and budget.