import { useState, useEffect } from "react";
import SocialService from "../utils/social";
import '../assets/ChatWindow.css';
import { io } from "socket.io-client";
const socket = io("https://petpulse-backend.onrender.com", {
  transports: ["websocket", "polling"],
  withCredentials: true
});

const ChatWindow = ({ currentUserId, targetUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const chatId = SocialService.getChatId(currentUserId, targetUser.id);
    const loadMessages = async () => {
      const res = await SocialService.getMessages(chatId);
      if (res.success) {
        setMessages(res.messages);
      } else {
        console.error("Failed to load messages:", res);
      }
    };
  
    loadMessages();
  
    const handleIncoming = (incomingMessage) => {
      if (incomingMessage.chatId === chatId) {
        setMessages((prev) => [...prev, incomingMessage]);
      }
      console.log("Received via socket:", incomingMessage);
    };
  
    socket.on("receiveMessage", handleIncoming);
  
    return () => {
      socket.off("receiveMessage", handleIncoming);
    };
  }, [currentUserId, targetUser]);  

  const handleSend = async () => {
    if (!input.trim()) return;
  
    const message = {
      senderId: currentUserId,
      receiverId: targetUser.id,
      content: input,
      timestamp: new Date().toISOString(),
      chatId: SocialService.getChatId(currentUserId, targetUser.id)
    };
  
    socket.emit("sendMessage", message); // 🔁 Send through socket only
  
    setMessages((prev) => [...prev, message]); // Optimistic UI
    setInput("");
  };

  useEffect(() => {
    const el = document.querySelector('.chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);
  
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
