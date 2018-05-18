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
            'swift-debugger:breakpoint': () => this.toggleBreakpoint()
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
        toolBar.addButton({ icon: 'octoface', callback: 'swift-debugger:debug', tooltip: 'Debug the executable.'});
        toolBar.addButton({ icon: 'octoface', callback: 'swift-debugger:stop', tooltip: 'Stop the executable.'});
        toolBar.addButton({ icon: 'octoface', callback: 'swift-debugger:clear', tooltip: 'Clear the console.'});
        toolBar.addButton({ icon: 'octoface', callback: 'swift-debugger:step', tooltip: 'Step to the next statement.'});
        toolBar.addButton({ icon: 'octoface', callback: 'swift-debugger:resume', tooltip: 'Resume debugging.'});

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
