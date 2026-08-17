import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../../styles/doctor.css";

function DoctorChat() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const doctor = JSON.parse(localStorage.getItem("doctor"));

  const socket = useRef(null);

  const [waitingChats, setWaitingChats] = useState([]);
  const [activeChats, setActiveChats] = useState([]);

  const [selectedChat, setSelectedChat] = useState(null);

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ===================================
  // SOCKET
  // ===================================

  useEffect(() => {
    socket.current = io("http://localhost:5000");

    if (doctor?.user) {
      socket.current.emit("register", doctor.user);
    }

    socket.current.on("new-message", (msg) => {
      if (selectedChat && msg.chat === selectedChat._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.current?.disconnect();
    };
  }, [selectedChat]);

  // ===================================
  // INITIAL LOAD
  // ===================================

  useEffect(() => {
    loadWaitingChats();
    loadActiveChats();
  }, []);

  // ===================================
  // AUTO REFRESH
  // ===================================

  useEffect(() => {
    const interval = setInterval(() => {
      loadWaitingChats();
      loadActiveChats();

      if (selectedChat) {
        loadMessages(selectedChat._id);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedChat]);

  // ===================================
  // WAITING CHATS
  // ===================================

  const loadWaitingChats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/chat/waiting", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setWaitingChats(data.chats);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ===================================
  // ACTIVE CHATS
  // ===================================

  const loadActiveChats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/chat/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setActiveChats(data.chats);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ===================================
  // LOAD MESSAGES
  // ===================================

  const loadMessages = async (chatId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/chat/${chatId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ===================================
  // JOIN WAITING CHAT
  // ===================================

  const joinChat = async (chat) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/chat/join/${chat._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        socket.current.emit("joinChat", chat._id);
        setSelectedChat(chat);
        loadMessages(chat._id);
        loadWaitingChats();
        loadActiveChats();
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ===================================
  // OPEN ACTIVE CHAT
  // ===================================

  const openActiveChat = (chat) => {
    socket.current.emit("joinChat", chat._id);
    setSelectedChat(chat);
    loadMessages(chat._id);
  };

  // ===================================
  // SEND MESSAGE
  // ===================================

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const text = message;
      setMessage("");

      const res = await fetch(
        "http://localhost:5000/api/chat/doctor-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatId: selectedChat._id,
            message: text,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ===================================
  // END CHAT
  // ===================================

  const endChat = async () => {
    if (!selectedChat) return;

    const ok = window.confirm("End this chat?");
    if (!ok) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/chat/end/${selectedChat._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Chat ended");
        setSelectedChat(null);
        setMessages([]);
        loadWaitingChats();
        loadActiveChats();
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ===================================
  // ENTER KEY HANDLER
  // ===================================

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // Helper for patient avatar initials
  const getInitials = (name) => {
    if (!name) return "PT";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="doctor-chat-page">
      {/* ================= Sidebar ================= */}
      <div className="doctor-chat-sidebar">
        <div className="chat-sidebar-header">
          <div className="sidebar-brand-wrapper">
            <div className="sidebar-brand-icon">🩺</div>
            <div>
              <h2>Doctor Console</h2>
              <p className="sidebar-brand-sub">Real-Time Consultations</p>
            </div>
          </div>

          <button
            className="sidebar-dashboard-btn"
            onClick={() => navigate("/doctor/dashboard")}
          >
            ← Dashboard
          </button>
        </div>

        <div className="chat-sidebar-content">
          {/* Waiting Queue */}
          <div className="chat-section-header">
            <h3 className="chat-section-title">Waiting Queue</h3>
            <span className="queue-badge waiting">{waitingChats.length}</span>
          </div>

          {waitingChats.length === 0 ? (
            <div className="empty-chat">
              <span className="empty-icon">⏳</span>
              <p>No Waiting Chats</p>
            </div>
          ) : (
            waitingChats.map((chat) => (
              <div
                key={chat._id}
                className="waiting-chat-card waiting-type"
                onClick={() => joinChat(chat)}
              >
                <div className="patient-card-avatar">
                  {getInitials(chat.patient?.name)}
                </div>
                <div className="patient-card-info">
                  <h4>{chat.patient?.name || "Patient"}</h4>
                  <p>{chat.patient?.email || "No email provided"}</p>
                  <span className="join-cta">Click to Join ➔</span>
                </div>
              </div>
            ))
          )}

          <div className="sidebar-divider" />

          {/* Active Consultations */}
          <div className="chat-section-header">
            <h3 className="chat-section-title">Active Consultations</h3>
            <span className="queue-badge active">{activeChats.length}</span>
          </div>

          {activeChats.length === 0 ? (
            <div className="empty-chat">
              <span className="empty-icon">💬</span>
              <p>No Active Chats</p>
            </div>
          ) : (
            activeChats.map((chat) => {
              const isSelected = selectedChat && selectedChat._id === chat._id;
              return (
                <div
                  key={chat._id}
                  className={`waiting-chat-card ${isSelected ? "active" : ""}`}
                  onClick={() => openActiveChat(chat)}
                >
                  <div className="patient-card-avatar active-avatar">
                    {getInitials(chat.patient?.name)}
                    <span className="online-indicator-dot" />
                  </div>
                  <div className="patient-card-info">
                    <h4>{chat.patient?.name || "Patient"}</h4>
                    <p>{chat.patient?.email || "Active patient"}</p>
                    <span className="active-status-lbl">
                      ● Active Conversation
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ================= Chat Main Area ================= */}
      <div className="doctor-chat-main">
        {!selectedChat ? (
          <div className="no-chat-selected">
            <div className="no-chat-card">
              <div className="no-chat-icon">👨‍⚕️</div>
              <h2>Select a Patient</h2>
              <p>
                Select a patient from the queue or active list to begin or continue your consultation.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="chat-header">
              <div className="header-patient-info">
                <div className="header-patient-avatar">
                  {getInitials(selectedChat.patient?.name)}
                </div>
                <div>
                  <h3>{selectedChat.patient?.name || "Patient"}</h3>
                  <p className="connected-status">
                    <span className="status-dot-pulse" /> Doctor Connected
                  </p>
                </div>
              </div>

              <button className="end-chat-btn" onClick={endChat}>
                End Chat
              </button>
            </div>

            {/* Messages Container */}
            <div className="chat-messages">
              {messages.map((msg) => {
                let className = "";

                if (msg.senderType === "doctor") {
                  className = "patient-message"; // doctor on RIGHT
                } else if (msg.senderType === "patient") {
                  className = "doctor-message"; // patient on LEFT
                } else if (msg.senderType === "bot") {
                  className = "bot-message";
                } else {
                  className = "system-message";
                }

                return (
                  <div key={msg._id} className={className}>
                    <strong>
                      {msg.senderType === "doctor"
                        ? "👨‍⚕️ Doctor"
                        : msg.senderType === "patient"
                        ? "👤 Patient"
                        : msg.senderType === "system"
                        ? "ℹ️ System"
                        : "🤖 AI"}
                    </strong>
                    <div className="message-content-text">{msg.message}</div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="chat-input">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type message..."
              />
              <button onClick={sendMessage} disabled={!message.trim()}>
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DoctorChat;
