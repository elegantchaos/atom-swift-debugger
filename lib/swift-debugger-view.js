/*
* decaffeinate suggestions:
* DS101: Remove unnecessary use of Array.from
* DS102: Remove unnecessary code created because of implicit returns
* DS206: Consider reworking classes to avoid initClass
* DS207: Consider shorter variations of null checks
* Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
*/
let SwiftDebuggerView;
const {Disposable, CompositeDisposable} = require('atom');
const {$, $$, View, TextEditorView} = require('atom-space-pen-views');
const Breakpoint = require('./breakpoint');
const BreakpointStore = require('./breakpoint-store');

const { spawn } = require('child_process');
const path = require('path');
module.exports =
(SwiftDebuggerView = (function() {
    SwiftDebuggerView = class SwiftDebuggerView extends View {
        static initClass() {
            this.prototype.executableFileName = null;
            this.prototype.lldbPath = atom.config.get('swift-debugger.lldb', {}) || 'lldb';
            this.prototype.swiftPath = atom.config.get('swift-debugger.swift', {}) || 'swift';
        }

        static content() {
            return this.div({class: 'swiftDebuggerView'}, () => {
                this.subview('commandEntryView', new TextEditorView({
                    mini: true,
                    placeholderText: 'po foo'
                })
            );
            return this.div({class: 'panel-body', outlet: 'outputContainer'}, () => {
                return this.pre({class: 'command-output', outlet: 'output'});
            });
        });
    }

    stepOverBtnPressed() {
        return (this.lldb != null ? this.lldb.stdin.write("n\n") : undefined);
    }

    resumeBtnPressed() {
        return (this.lldb != null ? this.lldb.stdin.write("c\n") : undefined);
    }

    workspacePath() {
        const editor = atom.workspace.getActiveTextEditor();
        const activePath = editor.getPath();
        const relative = atom.project.relativizePath(activePath);
        const pathToWorkspace = relative[0] || path.dirname(activePath);
        return pathToWorkspace;
    }

    runApp() {
        if(this.lldb) {
            this.stopApp();
        }

        if(this.pathsNotSet()) {
            this.askForPaths();
            return;
        }

        this.swiftBuild = spawn(this.swiftPath, ['build', '--package-path', this.workspacePath()]);
        this.swiftBuild.stdout.on('data',data => {
            return this.addOutput(data.toString().trim());
        });
        this.swiftBuild.stderr.on('data',data => {
            return this.addOutput(data.toString().trim());
        });
        return this.swiftBuild.on('exit',code => {
            const codeString = code.toString().trim();
            if (codeString === '0') {
                this.runLLDB();
            }
            return this.addOutput(`built with code : ${codeString}`);
        });
    }

    runLLDB() {
        this.lldb = spawn(this.lldbPath, [this.workspacePath()+"/.build/debug/"+this.executableFileName]);

        for (let breakpoint of Array.from(this.breakpointStore.breakpoints)) {
            this.lldb.stdin.write(breakpoint.toCommand()+'\n');
        }

        this.lldb.stdin.write('r\n');
        this.lldb.stdout.on('data',data => {
            return this.addOutput(data.toString().trim());
        });
        this.lldb.stderr.on('data',data => {
            return this.addOutput(data.toString().trim());
        });
        return this.lldb.on('exit',code => {
            return this.addOutput(`exit code: ${code.toString().trim()}`);
        });
    }

    stopApp() {
        if (this.lldb != null) {
            this.lldb.stdin.write("\nexit\n");
        }
        return this.lldb = null;
    }

    clearOutput() {
        return this.output.empty();
    }

    createOutputNode(text) {
        let parent;
        const node = $('<span />').text(text);
        return parent = $('<span />').append(node);
    }

    addOutput(data) {
        const atBottom = this.atBottomOfOutput();
        const node = this.createOutputNode(data);
        this.output.append(node);
        this.output.append("\n");
        if (atBottom) {
            return this.scrollToBottomOfOutput();
        }
    }

    pathsNotSet() {
        return !this.executableFileName;
    }

    askForPaths() {
        if (this.pathsNotSet()) {
            this.addOutput("Please enter executable name using e=nameOfExecutable");
            return this.addOutput("Example e=helloWorld");
        }
    }

    initialize(controller) {
        this.controller = controller
        this.breakpointStore = controller.breakpointStore;
        this.addOutput("Welcome to Swift Debugger");
        this.askForPaths();
        return this.subscriptions = atom.commands.add(this.element, {
            'core:confirm': event => {
                if (this.parseAndSetPaths()) {
                    this.clearInputText();
                } else {
                    this.confirmLLDBCommand();
                }
                return event.stopPropagation();
            },
            'core:cancel': event => {
                this.cancelLLDBCommand();
                return event.stopPropagation();
            }
        }
    );
}

parseAndSetPaths() {
    const command = this.getCommand();
    if (!command) {
        return false;
    }
    if (/e=(.*)/.test(command)) {
        const match = /e=(.*)/.exec(command);
        this.executableFileName = match[1];
        this.addOutput("executable path set");
        return true;
    }
    return false;
}

stringIsBlank(str) {
    return !str || /^\s*$/.test(str);
}

getCommand() {
    const command = this.commandEntryView.getModel().getText();
    if(!this.stringIsBlank(command)) {
        return command;
    }
}

cancelLLDBCommand() {
    return this.commandEntryView.getModel().setText("");
}

confirmLLDBCommand() {
    if (!this.lldb) {
        this.addOutput("Program not running");
        return;
    }
    const command = this.getCommand();
    if(command) {
        this.lldb.stdin.write(command + "\n");
        return this.clearInputText();
    }
}

clearInputText() {
    return this.commandEntryView.getModel().setText("");
}

destroy() {
    return this.detach();
}

isVisible() {
    return this.panel ? this.panel.isVisible() : false;
}

toggle() {
    if (this.isVisible()) {
        return this.detach();
    } else {
        return this.attach();
    }
}

atBottomOfOutput() {
    return this.output[0].scrollHeight <= (this.output.scrollTop() + this.output.outerHeight());
}

scrollToBottomOfOutput() {
    return this.output.scrollToBottom();
}

attach() {
    console.log("attach called");
    this.panel = atom.workspace.addBottomPanel({item: this});
    this.panel.show();
    return this.scrollToBottomOfOutput();
}

detach() {
    console.log("detach");
    this.panel.destroy();
    return this.panel = null;
}
};
SwiftDebuggerView.initClass();
return SwiftDebuggerView;
})());
