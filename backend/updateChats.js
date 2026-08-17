require("dotenv").config();
const mongoose = require("mongoose");

const Chat = require("./models/Chat");

mongoose
.connect(process.env.MONGO_URI)
.then(async () => {

    await Chat.updateMany(
        { status: "waiting" },
        {
            $set: {
                status: "bot"
            }
        }
    );

    console.log("Chats Updated");

    process.exit();

});