import fs from "fs"
import { client } from "../index.js";

export default {
	function: function(){
		const load_dir = async (dirs) =>{
			const event_files = fs.readdirSync(`./src/events/${dirs}`).filter(file => file.endsWith(".js"))
			for(const file of event_files){
				const event = await import(`../events/${dirs}/${file}`)
				const event_name = event.default.name
				if(event.default.once === true) client.once(event_name, event.default.function.bind(null))
				else client.on(event_name, event.default.function.bind(null))
			}
		}
		["client", "guild"].forEach(e => load_dir(e))
	}
}