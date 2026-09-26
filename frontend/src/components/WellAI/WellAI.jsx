import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import "./WellAI.css";
import icon from "../../assets/Images/icon.png";
import aiImage from "../../assets/Images/aiImage.jpeg";
import { API_BASE_URL } from "../../apiConfig";

export default function WellAI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Welcome to **WellWise AI**! Ask any general health question or visit the **Diet**, **Exercise**, and **Well Form** sections to generate personalized plans."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      if (messages.length === 0) {
        container.scrollTop = 0;
      } else {
        container.scrollTop = container.scrollHeight;
      }
    });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botMsg = {
        sender: "bot",
        text: data.reply || "Sorry, I couldn’t generate a response.",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error connecting to the server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div
      className="chat-wrapper"
      style={{
        backgroundImage: `url(${aiImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="chat-box">
        <div className="chat-header">
          <img src={icon} alt="bot" className="bot-logo" />
          <h1 className="chat-title mt-1">Well AI-Your personal Health Chatbot</h1>
        </div>

        <div className="messages" ref={messagesContainerRef}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message-row ${
                msg.sender === "user" ? "user-row" : "bot-row"
              }`}
            >
              {msg.sender === "bot" && (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
                  alt="bot"
                  className="avatar"
                />
              )}

              {/* Message content */}
              <div className={`message ${msg.sender}`}>
                {msg.sender === "bot" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      a: (props) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="markdown-link"
                        />
                      ),
                      code: ({ inline, className, children, ...props }) => (
                        <code
                          className={`${
                            inline ? "inline-code" : "block-code"
                          } ${className || ""}`}
                          {...props}
                        >
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>

              {/* User avatar */}
              {msg.sender === "user" && (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1077/1077012.png"
                  alt="user"
                  className="avatar"
                />
              )}
            </div>
          ))}

          {loading && <div className="loading">💭 AI is thinking...</div>}
          <div ref={chatEndRef} />
        </div>

        <div className="input-section">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button onClick={sendMessage} disabled={loading}>
            ➤
          </button>
        </div>

        <button className="clear-btn" onClick={clearChat}>
          🧹 Clear Chat
        </button>
      </div>
    </div>
  );
}
