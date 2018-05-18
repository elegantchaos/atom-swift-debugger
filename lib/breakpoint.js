/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Breakpoint;
module.exports =
(Breakpoint = (function() {
  Breakpoint = class Breakpoint {
    static initClass() {
      this.prototype.decoration = null;
    }

    constructor(state) {
        console.debug(`Breakpoint`, JSON.stringify(state))
        const { file, line } = state
        this.filename = file
        this.lineNumber = line
    }

    serialize() {
        const state = {
            deserializer: `Breakpoint`,
            file: this.filename,
            line: this.lineNumber
        }

        console.debug(`Breakpoint serialized`, JSON.stringify(state))
        return state
    }

    toCommand() {
      return `b ${this.filename}:${this.lineNumber}`;
    }
  };

  Breakpoint.initClass();

  return Breakpoint;
})());
