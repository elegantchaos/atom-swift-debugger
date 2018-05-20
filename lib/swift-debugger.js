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
const SwiftDebuggerView = require('./swift-debugger-view');
const {$, $$, View, TextEditorView} = require('atom-space-pen-views');

const DebuggerViewURI = 'atom://swift-debugger/console';

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
        //
        // if (state.visible) {
        //     this.view(true);
        // }

        atom.workspace.addOpener( (url) => {
            console.debug("opener called");
            if (url === DebuggerViewURI) {
                if (this._view == null) {
                    return new SwiftDebuggerView(this);
                } else {
                    return this._view;
                }
            }
        });


        this.updateToolBar();

        this.subscriptions = new CompositeDisposable;
        return this.subscriptions.add(atom.commands.add('atom-workspace', {
            'swift-debugger:toggle': () => atom.workspace.toggle(DebuggerViewURI),
            'swift-debugger:breakpoint': () => this.toggleBreakpoint(),
            'swift-debugger:debug': this.doWithView((view) => view.runApp()),
            'swift-debugger:stop': this.doWithView((view) => view.stopApp()),
            'swift-debugger:clear': this.doWithView((view) => view.clearOutput()),
            'swift-debugger:step-over': this.doWithView((view) => view.stepOverBtnPressed()),
            'swift-debugger:step-out': this.doWithView((view) => view.stepOverBtnPressed()),
            'swift-debugger:step-in': this.doWithView((view) => view.stepOverBtnPressed()),
            'swift-debugger:resume': this.doWithView((view) => view.resumeBtnPressed()),
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

    /**
        Serialize the current state of the plugin.
    */

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
        Returns the view if it exists.
    */

    viewWithoutCreating() {
        return this._view;
    },

    doWithView(action) {
        return () => {
            // const options = { searchAllPanes: true };
            atom.workspace.open(DebuggerViewURI).then( (view) => {
                this._view = view;
                action(view);
                this.updateToolBar();
            });
        }
    },

    toggleBreakpoint() {
        const editor = atom.workspace.getActiveTextEditor();
        const file = editor.getTitle();
        const line = editor.getCursorBufferPosition().row + 1;
        const breakpoint = new Breakpoint({file: file, line: line});
        return this.breakpoints.toggle(breakpoint);
    },

    consumeToolBar(getToolBar) {
        const buttons = {};

        toolBar = getToolBar('swift-debugger');
        buttons.play = toolBar.addButton({ icon: 'play', iconset: 'fa', callback: 'swift-debugger:debug', tooltip: 'Debug the executable.'});
        buttons.stop = toolBar.addButton({ icon: 'stop', iconset: 'fa', callback: 'swift-debugger:stop', tooltip: 'Stop the executable.'});
        buttons.over = toolBar.addButton({ icon: 'arrow-right', iconset: 'fa', callback: 'swift-debugger:step-over', tooltip: 'Step to the next statement.'});
        buttons.out = toolBar.addButton({ icon: 'arrow-up', iconset: 'fa', callback: 'swift-debugger:step-out', tooltip: 'Step out of the current function.'});
        buttons.in = toolBar.addButton({ icon: 'arrow-down', iconset: 'fa', callback: 'swift-debugger:step-in', tooltip: 'Step into the next statement.'});
        buttons.resume = toolBar.addButton({ icon: 'play-circle-o', iconset: 'fa', callback: 'swift-debugger:resume', tooltip: 'Resume debugging.'});
        buttons.breakpoint = toolBar.addButton({ icon: 'bug', iconset: 'fa', callback: 'swift-debugger:breakpoint', tooltip: 'Toggle breakpoint at the current line.'});
        buttons.clear = toolBar.addButton({ icon: 'trash', iconset: 'fa', callback: 'swift-debugger:clear', tooltip: 'Clear the console.'});

        this.toolBar = toolBar;
        this.buttons = buttons;

        this.updateToolBar();
    },

    updateToolBar() {
        const buttons = this.buttons;
        if (buttons) {
            const view = this.viewWithoutCreating();
            const gotView = view != null;
            const gotExecutable = this.executable != null;

            buttons.play.setEnabled(gotExecutable && (!gotView || !view.appIsRunning()));
            buttons.stop.setEnabled(gotView && view.appIsRunning());
            buttons.over.setEnabled(gotView && view.appIsPaused());
            buttons.in.setEnabled(gotView && view.appIsPaused());
            buttons.out.setEnabled(gotView && view.appIsPaused());
            buttons.resume.setEnabled(gotView && view.appIsPaused());
        }
    }
});
