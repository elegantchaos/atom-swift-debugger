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

    constructor(filename, lineNumber) {
      this.filename = filename;
      this.lineNumber = lineNumber;
    }

    toCommand() {
      return `b ${this.filename}:${this.lineNumber}`;
    }

    activate(state) {
        console.debug("breakpoint activate")
    }

    serialize() {
        console.debug("breakpoint serialize")
      return {}
    }
  };

  Breakpoint.initClass();
  
  return Breakpoint;
})());
