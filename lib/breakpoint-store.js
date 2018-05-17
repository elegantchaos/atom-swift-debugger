/*
* decaffeinate suggestions:
* DS101: Remove unnecessary use of Array.from
* DS102: Remove unnecessary code created because of implicit returns
* DS205: Consider reworking code to avoid use of IIFEs
* Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
*/

let BreakpointStore;

const {CompositeDisposable} = require('atom');

module.exports =
(BreakpointStore = class BreakpointStore {
    constructor(state) {
        console.debug(`BreakpointStore()`, JSON.stringify(state));

        this.breakpoints = state ? state.items.map((item) => atom.deserializers.deserialize(item)) : [];
    }

    serialize() {
        const breakpoints = this.breakpoints
        const state = {
            deserializer: `BreakpointStore`,
            items: breakpoints.map((breakpoint) => breakpoint.serialize())
        }

        console.debug(`BreakpointStore serialized`, JSON.stringify(state))
        return state
    }

    toggle(breakpoint) {
        let d, marker;
        const breakpointSearched = this.containsBreakpoint(breakpoint);

        let addDecoration = true;
        if(breakpointSearched) {
            this.breakpoints.splice(breakpointSearched, 1);
            addDecoration = false;
        } else {
            this.breakpoints.push(breakpoint);
        }

        let editor = atom.workspace.getActiveTextEditor();

        if (addDecoration) {
            marker = editor.markBufferPosition([breakpoint.lineNumber-1, 0]);
            d = editor.decorateMarker(marker, {type: 'line-number', class: 'line-number-blue'});
            d.setProperties({type: 'line-number', class: 'line-number-blue'});
            return breakpoint.decoration = d;
        } else {
            editor = atom.workspace.getActiveTextEditor();
            const ds = editor.getLineNumberDecorations({type: 'line-number', class: 'line-number-blue'});
            return (() => {
                const result = [];
                for (d of Array.from(ds)) {
                    marker = d.getMarker();
                    if (marker.getBufferRange().start.row === (breakpoint.lineNumber-1)) {
                        result.push(marker.destroy());
                    } else {
                        result.push(undefined);
                    }
                }
                return result;
            })();
        }
    }

    containsBreakpoint(bp) {
        for (let breakpoint of Array.from(this.breakpoints)) {
            if ((breakpoint.filename === bp.filename) && (breakpoint.lineNumber === bp.lineNumber)) {
                return breakpoint;
            }
        }
        return null;
    }

    currentBreakpoints() {
        return Array.from(this.breakpoints).map((breakpoint) =>
        console.log(breakpoint));
    }

    clear() {
        return this.breakpoints = [];
    }
});
