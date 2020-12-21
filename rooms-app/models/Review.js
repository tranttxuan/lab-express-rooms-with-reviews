const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        comment: { type: String, maxlength: 200 }
})
const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;