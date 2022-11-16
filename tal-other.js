function pickl(world) { // For the pick variable(When you use eat/use on it it runs this function)
			print("OM NOM NOM MMMM TASTY", "color: green");
		}
		var pick = new Item(
			"pickle",
			"Pickle",
			"Pickles are very very very very very tasty",
			{ "use": pickl, "consume": true, "pickup": true })
		var rom = new Room([], [null, null, null, null], "alleleluia", "pickle heaven"); // Make a room in the variable rom
		function pickle(world) {
			print("As you eat, a holy light shines on you. YOU HAVE ASCENDED TO PICKLE HEAVEN", "color: green");
			world.current_room = rom;
		}
		var item = new Item("pickle", "its a pickle", "who doesn't love pickles", { "use": pickle, "consume": true, "pickup": true });
		var room = new Room([item], [null, null, null, null], "picklessss", "pickle room");
		var room2 = new Room([item], [room, null, null, null], "picklsssss", "the pickle room woo");
		room.exits = [null, null, room2, null];
		var world = new World(room, globalcmds);
		look(world, []);
		function load(wold, inp) {
			if (inp.length < 1) {
				print("Please use this command like \"load [name here]", "color: green");
				return;
			}
			inp[0] = inp.join(" ");
			if (!testFormat(localStorage.getItem("TAL.js.sav:" + inp[0]))) {
				print("That save doesn't exist!", "color: red");
				return;
			}
			var cmds = world.commands;
			//var __parse = world.__parse;
			var decoded = new World(parseRefJSON(atob(localStorage.getItem("TAL.js.sav:" + inp[0]))), cmds);
			world = decoded;
			//print(decoded.commands, "color: red");
			//world.__parse = __parse;
			world.commands = cmds;

			print("Loaded!", "color: green");
			print("<br>", "");
			look(world, []);
		}

		function impot(wold, inp) {
			if (inp.length < 1) {
				print("Please use this command like \"import [save string here]", "color: green");
				return;
			}
			inp[0] = inp.join(" ");
			if (!testFormat(inp[0])) {
				print("That savecode isn't valid!", "color: red");
				return;
			}
			var cmds = world.commands;
			var __parse = world.__parse;
			var decoded = new World(parseRefJSON(atob(inp[0])), cmds);
			world = decoded;
			//print(decoded.commands, "color: red");
			world.__parse = __parse;
			world.commands = cmds;

			print("Imported!", "color: green");
			print("<br>", "");
			look(world, []);
		}
		
		world.commands.push(new Command(["load"], load, "Load a game"));
		world.commands.push(new Command(["import"], impot, "Import a game from a save code"));
