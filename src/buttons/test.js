/* eslint-disable no-unused-vars */
export default {
    id: "", // button custom id here
    permissions: [],
    roleRequired: "985070408581656616",
    function: async function ({ button }) {
        const { client } = await import("../index.js");
        button.reply("test");
    }
}