"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const types_1 = require("./types");
const Context_1 = require("./Context");
class Parser {
    constructor(prefix, commands) {
        this.defaultPrefix = helpers_1.escapeRegExp(prefix);
        this.commands = commands;
        this.customPrefixes = [];
        //Add custom customPrefixes
        for (const command of commands) {
            if (!command.useDefaultPrefix) {
                this.customPrefixes.push({ prefix: helpers_1.escapeRegExp(command.name), command });
            }
        }
    }
    parseCommand(str) {
        str = str.trim();
        const splitted = str.split(/\s+/);
        const prefix = splitted[0].toLowerCase();
        //Default prefix
        if (prefix == this.defaultPrefix) {
            //Missing command
            if (splitted.length === 1) {
                throw new types_1.CommandError(`Missing command, to see the list of commands use \`${Context_1.Context.prefix} help\``);
            }
            //Find command
            const commandName = helpers_1.getEverythingAfterMatch(/\s+/g, str, 1).toLowerCase();
            for (const command of this.commands) {
                //Found command
                if (command.useDefaultPrefix && (commandName.startsWith(command.name) || helpers_1.includeStartsWith(command.aliases, commandName))) {
                    const whitespaceInCommand = helpers_1.regexCount(/\s+/g, command.name);
                    return {
                        success: true,
                        command,
                        args: splitted.splice(2 + whitespaceInCommand),
                        fullArgs: helpers_1.getEverythingAfterMatch(/\s+/g, str, 2 + whitespaceInCommand)
                    };
                }
            }
            //Invalid command
            throw new types_1.CommandError(`Invalid command, to see the list of commands use \`${Context_1.Context.prefix} help\``);
        }
        //Custom prefix
        for (const custom of this.customPrefixes) {
            if (prefix === custom.prefix) {
                return {
                    success: true,
                    command: custom.command,
                    args: splitted.slice(1),
                    fullArgs: helpers_1.getEverythingAfterMatch(/\s+/g, str, 1)
                };
            }
        }
        return { success: false };
    }
}
exports.default = Parser;
//# sourceMappingURL=Parser.js.map