/**
 * @file socketHandler.js
 * @description Centralized Socket.io real-time event handler module for chat and presence management.
 */

/**
 * Initializes socket events for real-time user presence, chat rooms, and typing indicators.
 * @param {import("socket.io").Server} io - Socket.io Server instance
 */
const initSocketHandler = (io) => {
  // Track online users mapping: userId -> socketId
  const onlineUsers = {};

  io.on("connection", (socket) => {

    /**
     * Register connected user to online users list
     */
    socket.on("register", (userId) => {
      if (!userId) return;
      onlineUsers[userId] = socket.id;
    });

    /**
     * Join specific chat room
     */
    socket.on("joinChat", (chatId) => {
      if (!chatId) return;
      socket.join(chatId);
    });

    /**
     * Notify room that a doctor has joined
     */
    socket.on("doctorJoined", (data) => {
      if (!data?.chatId) return;
      io.to(data.chatId).emit("doctorJoined", data);
    });

    /**
     * Notify room that a doctor has left
     */
    socket.on("doctorLeft", (data) => {
      if (!data?.chatId) return;
      io.to(data.chatId).emit("doctorLeft", data);
    });

    /**
     * Broadcast typing status to room
     */
    socket.on("typing", (data) => {
      if (!data?.chatId) return;
      socket.to(data.chatId).emit("typing", data);
    });

    /**
     * Broadcast stop typing status to room
     */
    socket.on("stopTyping", (data) => {
      if (!data?.chatId) return;
      socket.to(data.chatId).emit("stopTyping");
    });

    /**
     * Clean up user mapping on disconnect
     */
    socket.on("disconnect", () => {
      Object.keys(onlineUsers).forEach((id) => {
        if (onlineUsers[id] === socket.id) {
          delete onlineUsers[id];
        }
      });
    });
  });
};

module.exports = initSocketHandler;
