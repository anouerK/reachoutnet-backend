const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const AddressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zip: { type: String, required: true }
});

const Association = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    Creation_date: {
        type: Date,
        default: Date.now,
        required: true
    },
    updated_at: [{
        type: Date
    }],
    verified: {
        type: Boolean,
        default: 0
    },
    status: {
        type: Number,
        default: 0
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        permissions: {
            type: Number,
            default: 0
        }
    }],
    address: {
        type: AddressSchema,
        required: true
    },
    phone: {
        type: Number,
        required: true
    }

});

module.exports = mongoose.model("associations", Association);
