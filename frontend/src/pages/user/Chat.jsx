import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Chat.css";
import { io } from "socket.io-client";

const API_URL = "http://localhost:5000";

function UserChat() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // MUST BE ARRAY
  const [doctors, setDoctors] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [chatId, setChatId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  const messagesEndRef = useRef(null);
  const socket = useRef(null);

  // ==========================
  // Scroll
  // ==========================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ==========================
  // Load Doctors
  // ==========================

  useEffect(() => {
    loadDoctors();
  }, []);

  // ==========================
  // Socket
  // ==========================

  useEffect(() => {
    socket.current = io(API_URL);

    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      socket.current.emit("register", user.id || user._id);
    }

    socket.current.on("new-message", (msg) => {
      setMessages((prev) => {
        const exists = prev.some(
          (m) => String(m._id) === String(msg._id)
        );

        if (exists) {
          return prev;
        }

        return [...prev, msg];
      });
    });

    return () => {
      socket.current?.disconnect();
    };
  }, []);

  // ==========================
  // GET DOCTORS
  // ==========================

  const loadDoctors = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/chat/my-doctors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log("FULL RESPONSE:", data);
      console.log("DOCTORS RESPONSE:", data.doctors);

      if (!data.success) {
        console.log("API success false");
        setDoctors([]);
        return;
      }

      let doctorList = [];

      // CASE 1:
      // doctors: [...]
      if (Array.isArray(data.doctors)) {
        doctorList = data.doctors;
      }

      // CASE 2:
      // doctors: { ... }
      else if (
        data.doctors &&
        typeof data.doctors === "object"
      ) {
        // If one doctor object
        if (
          data.doctors.doctorId ||
          data.doctors._id ||
          data.doctors.doctorName
        ) {
          doctorList = [data.doctors];
        } else {
          // Object containing multiple doctor objects
          doctorList = Object.values(data.doctors);
        }
      }

      console.log("NORMALIZED DOCTOR LIST:", doctorList);

      setDoctors(doctorList);
    } catch (err) {
      console.error("LOAD DOCTORS ERROR:", err);
      setDoctors([]);
    }
  };

  // ==========================
  // Open Chat
  // ==========================

  const openChat = async (doctor) => {
    try {
      console.log("CLICKED DOCTOR:", doctor);

      setSelectedDoctor(doctor);
      setMessages([]);
      setShowMobileSidebar(false);

      /*
       Handles structures like:

       {
         doctorId: "123"
       }

       OR

       {
         doctorId: {
           _id: "123",
           name: "Dr ABC"
         }
       }

       OR

       {
         _id: "123"
       }
      */

      const doctorId =
        doctor?.doctorId?._id ||
        doctor?.doctorId ||
        doctor?._id;

      console.log("FINAL DOCTOR ID:", doctorId);

      if (!doctorId) {
        console.error(
          "Doctor ID not found:",
          doctor
        );
        return;
      }

      const res = await fetch(
        `${API_URL}/api/chat/start`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            doctorId: doctorId,
          }),
        }
      );

      const data = await res.json();

      console.log("START CHAT RESPONSE:", data);

      if (data.success) {
        setChatId(data.chat._id);
        setMessages(
          Array.isArray(data.messages)
            ? data.messages
            : []
        );

        socket.current?.emit(
          "joinChat",
          data.chat._id
        );
      }
    } catch (err) {
      console.error("OPEN CHAT ERROR:", err);
    }
  };

  // ==========================
  // Send Message
  // ==========================

  const sendMessage = async () => {
    if (!message.trim()) return;
    if (!chatId) return;

    const text = message.trim();

    setMessage("");

    try {
      const res = await fetch(
        `${API_URL}/api/chat/send`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            chatId: chatId,
            message: text,
          }),
        }
      );

      const data = await res.json();

      console.log("SEND RESPONSE =", data);

      if (data.success && data.message && data.message._id) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
              String(m._id) ===
              String(data.message._id)
          );

          if (exists) {
            return prev;
          }

          return [...prev, data.message];
        });
      }
    } catch (err) {
      console.error("SEND ERROR:", err);
    }
  };

  // Helper formatting routines for UI elements
  const getDoctorName = (doc, index) => {
    return (
      doc?.doctorName ||
      doc?.name ||
      doc?.doctorId?.doctorName ||
      doc?.doctorId?.name ||
      doc?.doctorId?.fullName ||
      `Doctor ${index + 1}`
    );
  };

  const getDoctorInitials = (name) => {
    if (!name) return "DR";
    const parts = name.replace(/^Dr\.?\s*/i, "").trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const filteredDoctors = doctors.filter((doc, index) => {
    const name = getDoctorName(doc, index).toLowerCase();
    const spec = (doc?.specialization || doc?.doctorId?.specialization || "").toLowerCase();
    const query = searchTerm.toLowerCase();
    return name.includes(query) || spec.includes(query);
  });

  return (
    <div className="dm-chat-page">
      {/* ===================================
          DOCTOR SIDEBAR
      =================================== */}
      <div className={`dm-sidebar ${!showMobileSidebar ? "hidden-mobile" : ""}`}>
        <div className="dm-sidebar-header">
          <div className="dm-brand-row">
            <div className="dm-brand-link">
              <div className="dm-brand-icon">💬</div>
              <div className="dm-brand-text">
                <strong>Consultations</strong>
                <small>City Hospital Health</small>
              </div>
            </div>

            <button
              className="dm-dashboard-btn"
              onClick={() => navigate("/user/dashboard")}
            >
              ← Dashboard
            </button>
          </div>

          <div className="dm-sidebar-title-row">
            <h2 className="dm-sidebar-title">My Doctors</h2>
            <span className="dm-doctor-count-badge">{doctors.length}</span>
          </div>

          <div className="dm-search-box">
            <span className="dm-search-icon">🔍</span>
            <input
              type="text"
              className="dm-search-input"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List Container */}
        <div className="dm-doctor-list">
          {doctors.length === 0 ? (
            <div className="dm-sidebar-empty">
              <div className="dm-sidebar-empty-icon">🩺</div>
              <h4>No Doctors Received</h4>
              <p>No active doctor consultations were retrieved from the server.</p>
              <button className="dm-refresh-btn" onClick={loadDoctors}>
                Refresh List
              </button>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="dm-sidebar-empty">
              <p>No doctors match "{searchTerm}"</p>
            </div>
          ) : (
            filteredDoctors.map((doc, index) => {
              const doctorName = getDoctorName(doc, index);
              const specialization =
                doc?.specialization ||
                doc?.doctorId?.specialization ||
                "General Practitioner";

              const id =
                doc?.doctorId?._id ||
                doc?.doctorId ||
                doc?._id ||
                index;

              const isSelected = selectedDoctor === doc;

              return (
                <div
                  key={String(id)}
                  onClick={() => openChat(doc)}
                  className={`dm-doctor-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="dm-doctor-avatar-wrapper">
                    <div className="dm-doctor-avatar">
                      {getDoctorInitials(doctorName)}
                    </div>
                    <span className="dm-online-dot" />
                  </div>

                  <div className="dm-doctor-card-content">
                    <h3 className="dm-doctor-name">{doctorName}</h3>
                    <div className="dm-doctor-spec">
                      <span className="dm-spec-pill">{specialization}</span>
                    </div>
                  </div>

                  <div className="dm-arrow-icon">➔</div>
                </div>
              );
            })
          )}
        </div>

        {/* Dev Debug Accordion */}
        <div className="dm-dev-debug">
          <details className="dm-debug-details">
            <summary>⚙️ Dev Debug Payload ({doctors.length} items)</summary>
            <pre className="dm-debug-pre">
              {JSON.stringify(doctors, null, 2)}
            </pre>
          </details>
        </div>
      </div>

      {/* ===================================
          CHAT MAIN VIEWPORT
      =================================== */}
      <div className="dm-chat-main">
        {!selectedDoctor ? (
          <div className="dm-no-selection-screen">
            <div className="dm-no-selection-card">
              <div className="dm-no-selection-icon-wrapper">👨‍⚕️</div>
              <h2 className="dm-no-selection-title">Select a Doctor</h2>
              <p className="dm-no-selection-text">
                Click any doctor from the left panel to begin your real-time medical consultation.
              </p>
              <div className="dm-features-list">
                <div className="dm-feature-item">
                  <span className="dm-feature-icon">🔒</span> Encrypted Consultation Room
                </div>
                <div className="dm-feature-item">
                  <span className="dm-feature-icon">⚡</span> Real-time Socket Messaging
                </div>
                <div className="dm-feature-item">
                  <span className="dm-feature-icon">📋</span> Verified Doctors
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header Bar */}
            <div className="dm-chat-header">
              <div className="dm-doctor-profile-header">
                <button
                  className="dm-mobile-back-btn"
                  onClick={() => setShowMobileSidebar(true)}
                >
                  ← Back
                </button>
                <div className="dm-header-avatar">
                  {getDoctorInitials(
                    selectedDoctor?.doctorName ||
                      selectedDoctor?.name ||
                      selectedDoctor?.doctorId?.doctorName ||
                      selectedDoctor?.doctorId?.name
                  )}
                </div>
                <div className="dm-header-info">
                  <h2 className="dm-header-name">
                    {selectedDoctor?.doctorName ||
                      selectedDoctor?.name ||
                      selectedDoctor?.doctorId?.doctorName ||
                      selectedDoctor?.doctorId?.name ||
                      "Doctor"}
                  </h2>
                  <div className="dm-header-meta">
                    <span className="dm-header-spec">
                      {selectedDoctor?.specialization ||
                        selectedDoctor?.doctorId?.specialization ||
                        "General Consultation"}
                    </span>
                    <span className="dm-status-tag">
                      <span className="dm-status-tag-pulse" />
                      Active Session
                    </span>
                  </div>
                </div>
              </div>

              <div className="dm-header-actions">
                <div className="dm-consult-badge">
                  <span>Chat Session</span>
                </div>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="dm-messages-box">
              <div className="dm-chat-welcome-notice">
                <p>
                  You are now connected with <strong>{selectedDoctor?.doctorName || selectedDoctor?.name || selectedDoctor?.doctorId?.doctorName || "your doctor"}</strong>.
                </p>
              </div>

              {messages.map((msg, index) => {
                const isUser =
                  msg.senderType === "user" ||
                  msg.senderType === "patient" ||
                  msg.sender === "user";

                return (
                  <div
                    key={msg._id || index}
                    className={`dm-msg-row ${isUser ? "dm-msg-user" : "dm-msg-doctor"}`}
                  >
                    <span className="dm-msg-sender-name">
                      {isUser ? "You" : msg.senderType || "Doctor"}
                    </span>
                    <div className="dm-msg-bubble">
                      {msg.message}
                      {msg.createdAt && (
                        <span className="dm-msg-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="dm-chat-input-area">
              <div className="dm-input-wrapper">
                <input
                  className="dm-chat-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                />
              </div>
              <button
                className="dm-send-btn"
                onClick={sendMessage}
                disabled={!message.trim()}
              >
                <span>Send</span>
                <span>➔</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserChat;
