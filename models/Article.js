const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articlesSchema = new Schema(
    {
        title: {
            required: true,
            type: String,
        },
        image: {
            required: true,
            type: String,
        },
        content: {
            required: true,
            type: String,
        },
        seo: {
            title: {
                type: String,
                required: false,
                default: null,
            },
            keywords: {
                type: Array,
                required: false,
                default: [],
            },
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Article", articlesSchema);
