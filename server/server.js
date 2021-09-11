const express = require('express');
const http = require('http');
const cors = require("cors");
const { Server } = require("socket.io");


const {getDocument, updateDocument} = require("./firebase.js")

const app = express();
const httpServer = http.createServer(app);

const options = {
    cors :{
        origin : "*",
        methods : ["GET", "POST"]
    }
};
const io = require("socket.io")(httpServer, options);

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001


io.on("connection", socket => {
    console.log("user connected")
    socket.on("get-document",  async documentId => {
        try{
            console.log("id : ",documentId)
            const data = await getDocument(documentId);
            //const data = document ? document.data().data.d : null;
            socket.join(documentId);
            
            socket.emit("load-document", data)
            
            socket.on("send-changes", delta => {
                socket.broadcast.to(documentId).emit("receive-changes", delta)
            })

            socket.on("save-document",(d) => {
                updateDocument(documentId, {d})
            })
        }catch(error){
            console.log("Error ",error)
        }
        
    })
    
 });

httpServer.listen(PORT, ()=>
{
    console.log(`app is running on port ${PORT}`)
})