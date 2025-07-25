import { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";

const ChatSidebar = ({ currentUserId, mutuals }) => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="chat-sidebar">
      <h3>💬 Chats</h3>
      <div className="chat-user-list">
        {mutuals.length === 0 ? (
          <p>No mutuals to chat with.</p>
        ) : (
          mutuals.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedChat(user)}
              className={`chat-user-btn ${selectedChat?.id === user.id ? "active" : ""}`}>
              {user.displayName || user.email}
            </button>
          ))
        )}
      </div>

      {selectedChat && (
        <ChatWindow currentUserId={currentUserId} targetUser={selectedChat} />
      )}
    </div>
  );
};

export default ChatSidebar;