import mongoose from "mongoose";
import config from "../config.js";
import { error, log } from "../utils/logging.js";

/**
 * Connect to the database
 * @returns {mongoose.Connection}
 */
async function connect () {
    mongoose.set('strictQuery', true);
    log("Connecting to the database...");
    await mongoose.connect(config.mongodb, {
        useNewUrlParser: true
    }).then(connection => {
        log("Connected to the database");
        return connection;
    }).catch((e) => {
        error("Failed to connect to the database");
        error(e);
    });
}

export { connect };