const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const settingSchema = new Schema(
    {
        key: {
            type: String,
            required: true,
        },
        value: {
            type: Object,
            required: true,
            /*
            getaway structure
            {
                public:'',
                secret:''
            }
           */
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
