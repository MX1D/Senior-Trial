import { Schema, model } from "mongoose";

const userSchema = new Schema({
    id: String,
    warns: [{
        reason: String,
        message: String,
        moderator: String,
        date: Date
    }],
    history: [{
        punishment: String,
        reason: String,
        moderator: String,
        date: Date
    }]
})

const userModel = model("user", userSchema);

const bansSchema = new Schema({
    id: String,
    expiresAt: Date,
    guild: String
});

const bansModel = model("bans", bansSchema);

export { userModel, bansModel };