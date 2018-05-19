/*
* decaffeinate suggestions:
* DS102: Remove unnecessary code created because of implicit returns
* DS207: Consider shorter variations of null checks
* Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
*/

let SwiftDebugger;
const {CompositeDisposable} = require('atom');
const Breakpoint = require('./breakpoint');
const BreakpointStore = require('./breakpoint-store');

module.exports = (SwiftDebugger = {
    subscriptions: null,

    /**
    Serialization support.
    */

    deserializeBreakpointStore(state) { return new BreakpointStore(state) },
    deserializeBreakpoint(state) { return new Breakpoint(state) },

    /**
    Activate the plugin.
    We are passed the previously serialised state.
    */

    activate(state) {
        console.debug(`swift-debugger activate`, JSON.stringify(state));

        this.executable = state.executable || "";
        this.lldb = atom.config.get('swift-debugger.lldb', {}) || 'lldb';
        this.swift = atom.config.get('swift-debugger.swift', {}) || 'swift';

        const breakpointState = state.breakPoints;
        let breakpoints = breakpointState ? atom.deserializers.deserialize(breakpointState) : null;
        if (!breakpoints) {
            breakpoints = new BreakpointStore();
        }
        this.breakpoints = breakpoints;

        if (state.visible) {
            this.view().toggle();
        }

        this.subscriptions = new CompositeDisposable;
        return this.subscriptions.add(atom.commands.add('atom-workspace', {
            'swift-debugger:toggle': () => this.view().toggle(),
            'swift-debugger:breakpoint': () => this.toggleBreakpoint(),
            'swift-debugger:debug': () => this.view().runApp(),
            'swift-debugger:stop': () => this.view().stopApp(),
            'swift-debugger:clear': () => this.view().clearOutput(),
            'swift-debugger:step-over': () => this.view().stepOverBtnPressed(),
            'swift-debugger:step-out': () => this.view().stepOverBtnPressed(),
            'swift-debugger:step-in': () => this.view().stepOverBtnPressed(),
            'swift-debugger:resume': () => this.view().resumeBtnPressed(),
        }));
    },


    /**
        Deactivate the plugin and clean things up.
    */

    deactivate() {
        this.lldbInputView.destroy();
        this.subscriptions.dispose();
        if (this.toolBar) {
            this.toolBar.removeItems();
            this.toolBar = null;
        }

        return this.viewWithoutCreating().destroy();
    },

    serialize() {
        const state = {
            executable: this.executable
        };

        const breakPoints = this.breakpoints;
        if (breakPoints) {
            state.breakPoints = breakPoints.serialize()
        }

        const view = this.viewWithoutCreating();
        if (view) {
            state.visible = view.isVisible()
        }

        console.debug(`swift-debugger serialized`, JSON.stringify(state))
        return state
    },

    /**
    Returns the view, creating it if necessary.
    */

    view() {
        if (this._view == null) {
            const SwiftDebuggerView = require('./swift-debugger-view');
            this._view = new SwiftDebuggerView(this);
        }
        return this._view;
    },

    /**
        Returns the view if it exists.
    */

    viewWithoutCreating() {
        return this._view;
    },

    toggleBreakpoint() {
        const editor = atom.workspace.getActiveTextEditor();
        const file = editor.getTitle();
        const line = editor.getCursorBufferPosition().row + 1;
        const breakpoint = new Breakpoint({file: file, line: line});
        return this.breakpoints.toggle(breakpoint);
    },

    consumeToolBar(getToolBar) {
        toolBar = getToolBar('swift-debugger');
        toolBar.addButton({ icon: 'play', iconset: 'fa', callback: 'swift-debugger:debug', tooltip: 'Debug the executable.'});
        toolBar.addButton({ icon: 'stop', iconset: 'fa', callback: 'swift-debugger:stop', tooltip: 'Stop the executable.'});
        toolBar.addButton({ icon: 'arrow-right', iconset: 'fa', callback: 'swift-debugger:step-over', tooltip: 'Step to the next statement.'});
        toolBar.addButton({ icon: 'arrow-up', iconset: 'fa', callback: 'swift-debugger:step-out', tooltip: 'Step out of the current function.'});
        toolBar.addButton({ icon: 'arrow-down', iconset: 'fa', callback: 'swift-debugger:step-in', tooltip: 'Step into the next statement.'});
        toolBar.addButton({ icon: 'play-circle-o', iconset: 'fa', callback: 'swift-debugger:resume', tooltip: 'Resume debugging.'});
        toolBar.addButton({ icon: 'bug', iconset: 'fa', callback: 'swift-debugger:breakpoint', tooltip: 'Toggle breakpoint at the current line.'});
        toolBar.addButton({ icon: 'trash', iconset: 'fa', callback: 'swift-debugger:clear', tooltip: 'Clear the console.'});

        this.toolBar = toolBar
    }

});
