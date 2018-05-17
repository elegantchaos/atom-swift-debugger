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

  createDebuggerView(lldb) {
    if (this.swiftDebuggerView == null) {
      const SwiftDebuggerView = require('./swift-debugger-view');
      this.swiftDebuggerView = new SwiftDebuggerView(this.breakpointStore);
    }
    return this.swiftDebuggerView;
  },

  activate(param) {

    if (param == null) { param = {}; }
    const {attached} = param;
    this.subscriptions = new CompositeDisposable;
    this.breakpointStore = new BreakpointStore();
    if (attached) { this.createDebuggerView().toggle(); }

    return this.subscriptions.add(atom.commands.add('atom-workspace', {
      'swift-debugger:toggle': () => this.createDebuggerView().toggle(),
      'swift-debugger:breakpoint': () => this.toggleBreakpoint()
    }
    )
    );
  },

  toggleBreakpoint() {
    const editor = atom.workspace.getActiveTextEditor();
    const filename = editor.getTitle();
    const lineNumber = editor.getCursorBufferPosition().row + 1;
    const breakpoint = new Breakpoint(filename, lineNumber);
    return this.breakpointStore.toggle(breakpoint);
  },

  deactivate() {
    this.lldbInputView.destroy();
    this.subscriptions.dispose();
    return this.swiftDebuggerView.destroy();
  },

  serialize() {
    let themPaths;
    ({swiftDebuggerViewState: this.swiftDebuggerView.serialize()});

    // console.log 'SwiftDebugger was toggled!'
    // shell = atom.config.get('run-command.shellCommand') || '/bin/bash'
    // editor = atom.workspace.getActiveTextEditor()
    const activePath = typeof editor !== 'undefined' && editor !== null ? editor.getPath() : undefined;
    const relative = atom.project.relativizePath(activePath);
    return themPaths = relative[0] || path.dirname(activePath);
  }
});
    //
    // console.log themPaths
