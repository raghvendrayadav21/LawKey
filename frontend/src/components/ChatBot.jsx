import { useState, useRef, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your LawKey Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/chat', { message: userMessage });
      setMessages(prev => [...prev, { text: res.data.reply, isBot: true }]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg = error.response?.data?.reply || "Sorry, I'm having trouble connecting right now.";
      setMessages(prev => [...prev, { text: errorMsg, isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="chatbot-window animate-slide-up">
          <div className="chatbot-header">
            <div className="flex items-center gap-2">
              <span style={{fontSize:'1.5rem'}}>🤖</span>
              <h3 style={{margin:0, color:'white'}}>Support Assistant</h3>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.isBot ? 'bot' : 'user'}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="chat-message bot typing">
                <span>.</span><span>.</span><span>.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask me a legal question..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="btn btn-primary" disabled={isLoading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating launcher button */}
      {!isOpen && (
        <button className="chatbot-launcher glass-panel animate-fade-in" onClick={() => setIsOpen(true)}>
          <span style={{fontSize:'1.8rem'}}>💬</span>
        </button>
      )}
    </>
  );
}
