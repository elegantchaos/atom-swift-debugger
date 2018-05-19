# Swift-Debugger package

A Swift Debugger Package for Atom!

*Note that this package is heavily modified from the original, but the documentation hasn't kept up.

It's also untested at the moment: "it works on my machine!".*


## Shortcuts

alt-r to hide/show the debugger view

alt-shift-r to toggle breakpoints at the current line

## How to use

### Install dependencies using APM

```
$ apm install language-swift tool-bar
```

`language-swift` package provides syntax highlighting
`tool-bar` implements the toolbar API that we use

### Install this package

The swift-debugger package itself needs to be installed manually from this fork.

### Open a Swift project in Atom

```
$ atom MySwiftProject
```

*Note that the project must have a `Package.swift` file and build with the Swift package manager.

### Set the location for swift and lldb

In the plugin settings, enter the locations of the swift and lldb binaries.

### Show The Toolbar

Choose "Tool Bar: Toggle" from Atom's command palette.

Hit the Run button in the toolbar.

### Set the executable

Currently the debugger doesn't infer which product you want to build/run, so you have to tell it manually:

Enter this in the input box of the debugger

`e=MySwiftProject` (press enter)


### alt-shift-r to toggle breakpoint at the current line

In any Swift file you're editing, you can set breakpoints:

![](https://cdn-images-1.medium.com/max/1600/1*6ji_E4xS2rswKuTStTmqYQ.png)

After toggling the breakpoint, press run.

When the debugger hits the breakpoint, it'll pause and then you can enter lldb commands.

E.g: enter `p myAwesomeString` to print the object
