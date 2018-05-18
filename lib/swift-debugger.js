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
    swiftDebuggerView: null,
    subscriptions: null,

    deserializeBreakpointStore(state) { return new BreakpointStore(state) },
    deserializeBreakpoint(state) { return new Breakpoint(state) },

    activate(state) {
        console.debug(`swift-debugger activate`, JSON.stringify(state));

        // require('atom-package-deps').install('tool-bar')
        //   .then(function() {
        //     console.log('All dependencies installed, good to go')
        //   })

        const breakpointState = state.breakPoints;
        this.breakpointStore = breakpointState ? atom.deserializers.deserialize(breakpointState) : new BreakpointStore();

        if (state.visible) {
            this.createDebuggerView().toggle();
        }

        this.subscriptions = new CompositeDisposable;
        return this.subscriptions.add(atom.commands.add('atom-workspace', {
            'swift-debugger:toggle': () => this.createDebuggerView().toggle(),
            'swift-debugger:breakpoint': () => this.toggleBreakpoint(),
            'swift-debugger:debug': () => this.createDebuggerView().runApp(),
            'swift-debugger:stop': () => this.createDebuggerView().stopApp(),
            'swift-debugger:clear': () => this.createDebuggerView().clearOutput(),
            'swift-debugger:step-over': () => this.createDebuggerView().stepOverBtnPressed(),
            'swift-debugger:step-out': () => this.createDebuggerView().stepOverBtnPressed(),
            'swift-debugger:step-in': () => this.createDebuggerView().stepOverBtnPressed(),
            'swift-debugger:resume': () => this.createDebuggerView().resumeBtnPressed(),
        }));
    },

    serialize() {
        const state = {};

        const breakPoints = this.breakpointStore;
        if (breakPoints) {
            state.breakPoints = breakPoints.serialize()
        }

        const view = this.swiftDebuggerView;
        if (view) {
            state.visible = view.isVisible()
        }

        console.debug(`swift-debugger serialized`, JSON.stringify(state))
        return state
    },

    createDebuggerView() {
        if (this.swiftDebuggerView == null) {
            const SwiftDebuggerView = require('./swift-debugger-view');
            this.swiftDebuggerView = new SwiftDebuggerView(this.breakpointStore);
        }
        return this.swiftDebuggerView;
    },

    toggleBreakpoint() {
        const editor = atom.workspace.getActiveTextEditor();
        const file = editor.getTitle();
        const line = editor.getCursorBufferPosition().row + 1;
        const breakpoint = new Breakpoint({file: file, line: line});
        return this.breakpointStore.toggle(breakpoint);
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
    },

    deactivate() {
        this.lldbInputView.destroy();
        this.subscriptions.dispose();
        if (this.toolBar) {
            this.toolBar.removeItems();
            this.toolBar = null;
        }

        return this.swiftDebuggerView.destroy();
    }

});
