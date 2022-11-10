"use strict";
var out = document.getElementById("output");

function print(str, styl) {
	var newo = document.createElement("p");
	newo.innerHTML = str;
	newo.style = styl;
	newo.class = "output";
	out.appendChild(newo);
	out.scrollTop = out.scrollHeight;
}

var inv = [];

class Item {
	constructor(name, sdesc, ldesc, prop = { "use": false, "consume": false, "pickup": true }) {
		this.name = name;
		this.sdesc = sdesc;
		this.ldesc = ldesc;
		this.prop = prop;
	}
}

class Exit {
	constructor(to) {
		this.to = to;
	}
}

class Room {
	constructor(items, exits, desc, name) {
		this.items = items;
		this.exits = exits;
		this.desc = desc;
		this.name = name;
	}
}

class Command {
	constructor(cmds, run, desc) {
		this.cmds = cmds;
		this.run = run;
		this.desc = desc;
	}
}


function dirtonum(dir) {
	dir = dir.toLowerCase();
	if (dir === "n" | dir === "north") {
		return 0;
	} else if (dir === "e" | dir === "east") {
		return 1;
	} else if (dir === "s" | dir === "south") {
		return 2;
	} else if (dir === "w" | dir === "west") {
		return 3;
	} else {
		return -1;
	}
}

function numtodir(dir) {
	if (dir === 0) {
		return "north";
	} else if (dir === 1) {
		return "east";
	} else if (dir === 2) {
		return "south";
	} else if (dir === 3) {
		return "west";
	} else {
		return "unknown";
	}
}

function go(world, inp) {
	try {
		if (world.current_room.exits[dirtonum(inp[0])]) {
			//print(world.current_room.exits[dirtonum(inp[0])].toString(),"color: blue")
			world.current_room = world.current_room.exits[dirtonum(inp[0])];
			print(world.current_room.name, "color: green");
		} else {
			print("There's no exit that way!", "color: red");
		}
	} catch (e) {
		print(e.toString(), "color: red");
		print("There's no exit that way!", "color: red");
	}
}

function gon(world, inp) {
	go(world, "n");
}
function gos(world, inp) {
	go(world, "s");
}
function goe(world, inp) {
	go(world, "e");
}
function gow(world, inp) {
	go(world, "w");
}

function look(world, inp) {
	print("\t" + world.current_room.name, "color: green");
	print(world.current_room.desc, "color: blue");
	for (var i = 0; i < world.current_room.items.length; i++) {
		print(world.current_room.items[i].name + " - " + world.current_room.items[i].sdesc);
	}
	var dirs = [];
	for (i = 0; i < world.current_room.exits.length; i++) {
		if (world.current_room.exits[i] !== null) {
			dirs.push(numtodir(i));
		}
	}
	print("There are exit(s) to the " + dirs.toString(), "color: blue");
}

function examine(world, inp) {
	for (var i = 0; i < world.current_room.items.length; i++) {
		if (inp[0] === world.current_room.items[i].name) {
			print(world.current_room.items[i].ldesc, "color: green");
			return;
		}
	}
}

function pickup(world, inp) {
	var v;
	for (var i = 0; i < world.current_room.items.length; i++) {
		v = world.current_room.items[i];
		if (v.name === inp[0]) {
			try {
				if (v.prop.pickup) {
					inv.push(v);
					world.current_room.items.splice(i, 1);
					return;
				} else {
					print("You can't pickup that item!", "color: red");
					return;
				}
			} catch (e) {
				inv.push(v);
				world.current_room.items.splice(i, 1);
				return;
			}
		}
	}
	print("That item isn't in the current room!", "color: red");
}

function invl(world, inp) {
	print("<b>You're inventory:</b>", "color: blue");
	for (var i = 0; i < inv.length; i++) {
		print("<b>" + inv[i].name + " - " + inv[i].sdesc + "</b>", "color: yellow");
	}
}

function drop(world, inp) {
	var v;
	for (var i = 0; i < inv.length; i++) {
		v = inv[i];
		if (v.name === inp[0]) {
			world.current_room.items.push(v);
			inv.splice(i, 1);
			return;
		}
	}
	print("<b>You don't have that item!</b>", "color: red");
}

function useroom(world, inp) {
	var v;
	for (var i = 0; i < world.current_room.items.length; i++) {
		v = world.current_room.items[i];
		if (v.name === inp[0]) {
			if (v.prop.use) {
				i.prop.use(world);
				if (v.prop.consume) {
					inv.splice(i, 1);
				}
				return;
			} else {
				print("<b>You can't use that item!</b>", "color: red");
				return;
			}
		}
	}
	print("<b>That item isn't in your inventory or the room!</b>", "color: red");
}

function use(world, inp) {
	var v;
	for (var i = 0; i < inv.length; i++) {
		v = inv[i];
		if (v.name === inp[0]) {
			if (v.prop.use!==false) {
				eval(world,v.prop.use);
				if (v.prop.consume) {
					inv.splice(i, 1);
				}
				return;
			} else {
				print("<b>You can't use that item!</b>", "color: red");
				return;
			}
		}
	}
	useroom(world, inp);
}

function help(world, inp) {
	print("<b>Available commands:</b>", "color: green");
	var v;
	for (var i = 0; i < world.commands.length; i++) {
		v = world.commands[i];
		var color;
		if(i%2) color="blue";
		else color="yellow";
		print(v.cmds.join(' or ') + " - " + v.desc, "color: "+color);
	}
}

function refReplacer() {
  let m = new Map(), v= new Map(), init = null;

  return function(field, value) {
    let p= m.get(this) + (Array.isArray(this) ? `[${field}]` : '.' + field);
    let isComplex= value===Object(value);
    
    if (isComplex) m.set(value, p);
    
    let pp = v.get(value)||'';
    let path = p.replace(/undefined\.\.?/,'');
    let val = pp ? `#REF:${pp[0]=='[' ? '$':'$.'}${pp}` : value;
    
    !init ? (init=value) : (val===init ? val="#REF:$" : 0);
    if(!pp && isComplex) v.set(value, path);
   
    return val;
  };
}

function parseRefJSON(json) {
  let objToPath = new Map();
  let pathToObj = new Map();
  let o = JSON.parse(json);
  
  let traverse = (parent, field) => {
    let obj = parent;
    let path = '#REF:$';

    if (field !== undefined) {
      obj = parent[field];
      path = objToPath.get(parent) + (Array.isArray(parent) ? `[${field}]` : `${field?'.'+field:''}`);
    }

    objToPath.set(obj, path);
    pathToObj.set(path, obj);
    
    let ref = pathToObj.get(obj);
    if (ref) parent[field] = ref;

    for (let f in obj) if (obj === Object(obj)) traverse(obj, f);
  };
  
  traverse(o);
  return o;
}

function testFormat(text) {
	try {
        var o = JSON.parse(atob(text));

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns null, and typeof null === "object",
        // so we must check for that, too. Thankfully, null is falsey, so this suffices:
        if (o && typeof o === "object") {
            return true;
        }
    }
    catch (e) { }

    return false;
}

function save(world, inp) {
	if (inp.length < 1) {
		print("Please use this command like \"save [name here]", "color: green");
		return;
	}
	var encoded = btoa(JSON.stringify(world, refReplacer()));
	localStorage.setItem("TAL.js.sav:"+inp.join(" "), encoded);
	print("Saved!", "color: green");
}

function listSaves(world, inp) {
	print("<b>Saves: </b>","color: green");
	for(var i in localStorage)
	{
		if (i.startsWith("TAL.js.sav:")) {
    	print(i.replace("TAL.js.sav:",""), "color: yellow");
		}
	}
}

function removeSave(world, inp) {
	localStorage.removeItem("TAL.js.sav:"+inp.join(" "));
	print("Deleted!", "color: green");
}

var globalcmds = [
	new Command(["go", "move"], go, "Move in a direction"),
	new Command(["north", "n"], gon, "Go north"),
	new Command(["south", "s"], gon, "Go south"),
	new Command(["east", "e"], gon, "Go east"),
	new Command(["west", "w"], gon, "Go west"),
	new Command(["look"], look, "Look around the room"),
	new Command(["examine"], examine, "Examine an object"),
	new Command(["get"], pickup, "Get an object"),
	new Command(["inventory", "inv"], invl, "List the objects in your inventory"),
	new Command(["drop", "yeet"], drop, "Drop an item in your inventory"),
	new Command(["use", "activate", "eat"], use, "Use an item"),
	new Command(["help"], help, "Show this help"),
	new Command(["save"], save, "Save the game. This does overwrite a save if it exists, so check with the \"list\" command"),
	new Command(["saves", "list"], listSaves, "List the saves"),
	new Command(["delete", "remove"], removeSave, "Remove a save. There's no confirmation, so be careful!"),
];

class World {
	constructor(sroom, commands = globalcmds) {
		this.current_room = sroom;
		if (commands[0] === "globalcmds") {
			commands.splice(0, 1);
			for (var i = 0; i < globalcmds.length; i++) {
				commands.push(globalcmds[i]);
			}
		}
		this.commands = commands;
	}

	__parse(inp) {
		//print("yes","color: red");
		//print(inp,"color: green");
		print("> " + inp.toString(), "color: green");
		inp = inp.split(" ");
		//print(inp[0].toLowerCase(),"color: red");
		for (var i = 0; i < this.commands.length; i++) {
			//print(inp[0].toLowerCase() in globalcmds[i].cmds,"color: red");
			try {
				if (this.commands[i].cmds.indexOf(inp[0].toLowerCase()) in this.commands[i].cmds) {
					inp.splice(0, 1);
					this.commands[i].run(this, inp);
					//print("yee","color: red");
					document.getElementById("command").value = "";
					return;
				}
			} catch (e) {
				print(e.toString(), "color: red");
			}
		}
		if (inp[0] === "") {
			document.getElementById("command").value = "";
			return;
		}
		print("The command \"{}\" doesn't exist! Type \"help\" for a list of commands.".replace("{}", inp[0]), "color: red");
		document.getElementById("command").value = "";
	}

}

var controlRun = {"s":function() {save(world, [new Date().toLocaleString()]);return "";}};

document.getElementById("command")
	.addEventListener("keydown", function(event) {
		if (event.key === "Enter") {
			document.getElementById("run").click();
			return;
		} else {
			
			if (event.ctrlKey) {
				if (event.key == "v" | event.key == "c") {
					return;
				}
				event.preventDefault();
				if (event.key == "Control") {
					return;
				}
				try {
					document.getElementById("command").value = document.getElementById("command").value+controlRun[event.key]();
				} catch (e) {
					if (e instanceof TypeError) {
						print("Control+"+event.key+" is not a valid shortcut!", "color: red");
						return;
					}
					print(e.toString(), "color: red");
				}
			}
		}
	});
