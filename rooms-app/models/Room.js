const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
        name: { type: String },
        description: { type: String },
        imageUrl: { type: String },
        owner: { type: Schema.Types.ObjectId, ref: 'User' },
        reviews: []
});
const Room = mongoose.model("room", RoomSchema);
module.exports = Room;