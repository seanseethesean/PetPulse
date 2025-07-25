import { useState, useEffect } from "react";
import SocialService from "../utils/social";
import '../assets/ChatWindow.css';

const ChatWindow = ({ currentUserId, targetUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const loadMessages = async () => {
      const chatId = SocialService.getChatId(currentUserId, targetUser.id);
      const res = await SocialService.getMessages(chatId);
      if (res.success) setMessages(res.messages);
    };
    loadMessages();
  }, [currentUserId, targetUser]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const message = {
      senderId: currentUserId,
      receiverId: targetUser.id,
      content: input,
      timestamp: new Date().toISOString()
    };

    const chatId = SocialService.getChatId(currentUserId, targetUser.id);
    const res = await SocialService.sendMessage(chatId, message);
    if (res.success) {
      setMessages((prev) => [...prev, message]);
      setInput("");
    }
  };

  return (
    <div className="chat-window">
      <h4>Chat with {targetUser.displayName || targetUser.email}</h4>
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.senderId === currentUserId ? "sent" : "received"}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;