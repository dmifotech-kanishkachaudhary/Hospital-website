function ChatHeader() {
  return (
    <div className="chat-header">
      <div className="chat-title">
        <div style={{ fontSize: "34px" }}>🏥</div>

        <div>
          <h2>City Hospital Assistant</h2>
          <p>AI Health Assistant</p>
        </div>
      </div>

      <div className="chat-status">
        <span className="status-dot"></span>
        <span>Online</span>
      </div>
    </div>
  );
}

export default ChatHeader;