import {io} from "socket.io-client";

const URL = "http://localhost:3001";

export const connect = () => {
    console.log("socket client")
    return io(URL);
}

export const disconnect = (socket) =>{
    socket.disconnect();
}