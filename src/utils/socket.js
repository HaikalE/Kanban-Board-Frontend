import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000"; // Ganti dengan URL server-mu
const socket = io(SOCKET_URL);

export default socket;
