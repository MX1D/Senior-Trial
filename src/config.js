export default {
    token: "",
    prefix: "-",
    debugMode: true,
    mongodb: "",
    autoMod: {
        logsChannel: "", // optional
        maxWarns: 3,
        punishment: "ban", // ban, kick, mute
        muteLength: "1m", // 1m, 1h, 1d, 1w, 1y
        resetWarns: true, // if true, the warns will be reset after the punishment
        // this is gonna have a configurable regex(es) for the auto mod to use and detect bad words
        regexes: [
            // ex: /badword/gi
        ], // MAKE SURE ALL THE REGEX IS IN LOWERCASE
        whitelistedRoles: []
    }
}