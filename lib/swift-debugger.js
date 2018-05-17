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

    const breakpointState = state.breakPoints;
    this.breakpointStore = breakpointState ? atom.deserializers.deserialize(breakpointState) : new BreakpointStore();

    this.subscriptions = new CompositeDisposable;
    return this.subscriptions.add(atom.commands.add('atom-workspace', {
      'swift-debugger:toggle': () => this.createDebuggerView().toggle(),
      'swift-debugger:breakpoint': () => this.toggleBreakpoint()
    }));
  },

  serialize() {

      const breakPoints = this.breakpointStore
      const state = { breakPoints: breakPoints ? breakPoints.serialize() : undefined }

      console.debug(`swift-debugger serialized`, JSON.stringify(state))
      return state
  },

  createDebuggerView(lldb) {
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

  deactivate() {
    this.lldbInputView.destroy();
    this.subscriptions.dispose();
    return this.swiftDebuggerView.destroy();
  }

});
    //
    // console.log themPaths
