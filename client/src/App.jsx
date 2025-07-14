import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState("");

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send_message", {
        username,
        content: message,
        timestamp: new Date().toLocaleTimeString(),
      });
      setMessage("");
    }
  };

  const handleTyping = () => {
    socket.emit("typing", username);
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user_typing", (user) => {
      setIsTyping(user);
      setTimeout(() => setIsTyping(""), 2000); // clears after 2s
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
    };
  }, []);

  if (!username) {
    return (
      <div className="flex flex-col items-center mt-20">
        <h2 className="text-2xl mb-4">Enter your name to join chat</h2>
        <input
          className="border px-3 py-1"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-1 mt-2"
          onClick={() => setUsername(tempName)}
        >
          Join
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Global Chat Room</h1>
      <div className="space-y-2 mb-4 h-80 overflow-y-auto border p-3 rounded">
        {messages.map((msg, idx) => (
          <p key={idx}>
            <span className="font-semibold">{msg.username}</span>: {msg.content}{" "}
            <span className="text-xs text-gray-500">({msg.timestamp})</span>
          </p>
        ))}
      </div>
      {isTyping && <p className="italic text-gray-500">{isTyping} is typing...</p>}
      <div className="flex gap-2 mt-2">
        <input
          className="border flex-1 px-2 py-1"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Type your message..."
        />
        <button className="bg-blue-600 text-white px-4 py-1" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;

