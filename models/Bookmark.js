const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bookmarkSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    talentId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Talent",
    },
});
module.exports = mongoose.model("Bookmark", bookmarkSchema);
