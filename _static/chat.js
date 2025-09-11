// AI Chat Widget Implementation — OpenRouter version (keeps your original structure)
class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.apiKey = localStorage.getItem('openrouter-api-key') || null; // Load saved key
        this.selectedModel = 'deepseek/deepseek-r1:free';
        this.models = [
            { id: 'qwen/qwen-2.5-7b-instruct:free', label: 'Qwen 2.5 7B (free)' },
            { id: 'openai/gpt-oss-120b:free', label: 'GPT-OSS' },
            { id: 'deepseek/deepseek-chat-v3.1:free', label: 'DeepSeek V3.1' },
            { id: 'deepseek/deepseek-r1:free', label: 'Deepseek r1' },
        ];
        this.setupWidget();
        this.loadQuickActions();
    }

    setupWidget() {
        const modelOptions = this.models.map(
            m => `<option value="${m.id}" ${m.id===this.selectedModel?'selected':''}>${m.label}</option>`
        ).join('');

        const chatHTML = `
            <div class="chat-widget" id="chatWidget">
                <div class="chat-header">
                    <h3 style="margin:0;flex:1">🤖 PID Control Assistant</h3>
                    <select id="modelSelect" title="Choose model" style="max-width:240px">${modelOptions}</select>
                    <button class="chat-close" onclick="chatWidget.toggleChat()">×</button>
                </div>
                <div class="chat-messages" id="chatMessages">
                    <div class="chat-message assistant">
                        Hi! I'm your PID control assistant. I can help explain concepts, answer questions about the exercises, or discuss control theory.
                        <br><br>
                        <strong>Note:</strong> ${this.apiKey ? 'API key loaded! Ready to help.' : 'Click <em>Set API Key</em> to enter your <b>OpenRouter</b> key.'}
                    </div>
                </div>
                <div class="chat-quick-actions" id="quickActions"></div>
                <div class="chat-input-container">
                    <input type="text" class="chat-input" id="chatInput" placeholder="Ask about PID control..."
                           onkeypress="if(event.key==='Enter') chatWidget.sendMessage()">
                    <button class="chat-send" onclick="chatWidget.sendMessage()">Send</button>
                </div>
            </div>
            <button class="chat-toggle" onclick="chatWidget.toggleChat()">💬</button>
        `;

        // Ensure #chat-root exists (in case extra_footer wasn't injected)
        if (!document.getElementById('chat-root')) {
            const r = document.createElement('div'); r.id = 'chat-root'; document.body.appendChild(r);
        }
        document.getElementById('chat-root').innerHTML = chatHTML;

        // Hook up model change (keep same pattern as your original)
        const select = document.getElementById('modelSelect');
        select.addEventListener('change', () => {
            this.selectedModel = select.value;
            this.addMessage('assistant', `✅ Model set to <code>${this.selectedModel}</code>.`);
        });
    }

    loadQuickActions() {
        const quickActions = [
            "Explain P, I, D components",
            "Why use anti-windup?",
            "Help with Exercise 1",
            "Ziegler-Nichols method",
            this.apiKey ? "Clear API Key" : "Set API Key"
        ];

        const container = document.getElementById('quickActions');
        container.innerHTML = quickActions.map(action =>
            `<button class="quick-action" onclick="chatWidget.handleQuickAction('${action}')">${action}</button>`
        ).join('');
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const widget = document.getElementById('chatWidget');
        widget.classList.toggle('open', this.isOpen);
    }

    handleQuickAction(action) {
        if (action === "Set API Key") {
            this.setApiKey();
        } else if (action === "Clear API Key") {
            this.clearApiKey();
        } else {
            document.getElementById('chatInput').value = action;
            this.sendMessage();
        }
    }

    setApiKey() {
        const key = prompt(
            "Enter your OpenRouter API key:\n\nThis will be saved in your browser for future sessions.\n\nGet a key: https://openrouter.ai/"
        );
        if (key) {
            this.apiKey = key.trim();
            localStorage.setItem('openrouter-api-key', this.apiKey);
            this.addMessage("assistant", "✅ API key saved! You can now ask me questions about PID control.");
            this.loadQuickActions(); // Refresh buttons
        }
    }

    clearApiKey() {
        if (confirm("Are you sure you want to clear your saved API key?")) {
            this.apiKey = null;
            localStorage.removeItem('openrouter-api-key');
            this.addMessage("assistant", "🗑️ API key cleared. Click 'Set API Key' to enter a new one.");
            this.loadQuickActions(); // Refresh buttons
        }
    }

    addMessage(sender, textOrHtml) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.innerHTML = textOrHtml;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Render math if MathJax is available
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise([messageDiv]).catch((err) => console.log('MathJax error:', err));
        }

        this.messages.push({ sender, text: textOrHtml, timestamp: new Date() });
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;

        // Show user message
        this.addMessage('user', this.escapeHtml(message));
        input.value = '';

        if (!this.apiKey) {
            this.addMessage('assistant', '❌ Please set your OpenRouter API key first using the "Set API Key" button above.');
            return;
        }

        // Typing indicator
        this.addMessage('assistant', '🔄 Thinking...');

        try {
            const response = await this.callOpenRouter(message);
            // Remove thinking indicator
            const messages = document.getElementById('chatMessages');
            messages.removeChild(messages.lastChild);
            // Add real response with math processing
            this.addMessage('assistant', this.linkify(this.processMath(response)));
        } catch (error) {
            const messages = document.getElementById('chatMessages');
            messages.removeChild(messages.lastChild);
            this.addMessage('assistant', `❌ Error: ${this.escapeHtml(error.message)}`);
        }
    }

    async callOpenRouter(userMessage) {
        const systemPrompt = `You are a helpful assistant specialized in PID (Proportional-Integral-Derivative) control theory. You are embedded in interactive lecture notes about PID control.

Context: The user is reading lecture notes that cover:
- Basic PID theory and intuition
- Time and Laplace domain representations
- Practical implementation with derivative filtering and anti-windup
- Discrete-time PID implementation in Python
- Manual tuning and Ziegler-Nichols methods
- Common pitfalls and solutions

Guidelines:
- Give concise, educational explanations
- Use mathematical notation when helpful (LaTeX ok)
- Reference the lecture content when relevant
- Help with exercises and Python code
- Focus on practical understanding
- Keep responses to 2–3 paragraphs unless more detail is requested
Answer the user's question about PID control:`;

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': (typeof window !== 'undefined' ? window.location.origin : 'https://example.com'),
                'X-Title': 'PID Book Assistant'
            },
            body: JSON.stringify({
                model: this.selectedModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!res.ok) {
            let detail = '';
            try { detail = (await res.json())?.error?.message || ''; } catch (_){}
            throw new Error(`OpenRouter ${res.status} ${res.statusText}${detail ? ': ' + detail : ''}`);
        }

        const data = await res.json();
        return data.choices[0]?.message?.content || 'No response received.';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    linkify(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    }

    processMath(text) {
        // First escape HTML to prevent XSS
        const escapedText = this.escapeHtml(text);
        
        // Convert common LaTeX patterns to MathJax format
        let processed = escapedText
            // Convert display math: $$...$$  -> \[...\]
            .replace(/\$\$([\s\S]*?)\$\$/g, '\\[$1\\]')
            // Convert inline math: $...$ -> \(...\)
            .replace(/\$([^$\n]+?)\$/g, '\\($1\\)')
            // Convert \(...\) to $ format if MathJax prefers it
            .replace(/\\?\\\(/g, '$')
            .replace(/\\?\\\)/g, '$')
            // Convert \[...\] to $$ format if MathJax prefers it
            .replace(/\\?\\\[/g, '$$')
            .replace(/\\?\\\]/g, '$$');
            
        return processed;
    }
}

// Initialize when DOM is ready
let chatWidget;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        chatWidget = new ChatWidget();
    });
} else {
    chatWidget = new ChatWidget();
}