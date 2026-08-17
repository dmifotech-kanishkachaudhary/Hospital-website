import { io } from "socket.io-client";
import { API } from "./config";

const socket = io(API);

export default socket;