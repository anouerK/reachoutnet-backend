const Message = require("./message");

class MessageApi {
    constructor () {
        this.model_message = Message;
    }

    createMessage (msg) {
        return this.model_message.create(msg);
    }

    findMessages (member1, member2, member1type, member2type) {
        return this.model_message.find({
            $or: [
                { sender: member1, senderType: member1type, receiver: member2, receiverType: member2type },
                { sender: member2, senderType: member2type, receiver: member1, receiverType: member1type }
            ]
        })
            .sort({ createdAt: 1 })
            .populate({
                path: "sender"
            })
            .populate({
                path: "receiver"
            });
    }
}

module.exports = MessageApi;
