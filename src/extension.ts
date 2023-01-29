// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  window,
  Disposable,
  type ExtensionContext,
  StatusBarAlignment,
  type StatusBarItem,
  type TextDocument
} from 'vscode'

// this method is called when your extension is activated. activation is
// controlled by the activation events defined in package.json
export function activate (ctx: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log(
  //   'Congratulations, your extension "Charactercount" is now active!'
  // );

  // create a new character counter
  const characterCounter = new CharacterCounter()
  const controller = new CharacterCounterController(characterCounter)

  // add to a list of disposables which are disposed when this extension
  // is deactivated again.
  ctx.subscriptions.push(controller)
  ctx.subscriptions.push(characterCounter)
}

export class CharacterCounter {
  private _statusBarItem: StatusBarItem | null

  constructor () {
    this._statusBarItem = null
  }

  public updateCharacterCount () {
    // Create as needed
    if (this._statusBarItem == null) {
      this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left)
    }

    // Get the current text editor
    const editor = window.activeTextEditor
    if (editor == null) {
      this._statusBarItem.hide()
      return
    }

    const doc = editor.document

    const characterCount = this._getCharacterCount(doc)

    // Update the status bar
    this._statusBarItem.text = `$(pencil) ${characterCount} char`
    this._statusBarItem.show()
  }

  public _getCharacterCount (doc: TextDocument): number {
    const docContent = doc.getText()
    // count character with code point (not String length)
    // to count wide characters and surrogate pair as 1 character
    return Array.from(docContent).length
  }

  public dispose () {
    this._statusBarItem?.dispose()
  }
}

class CharacterCounterController {
  private readonly _characterCounter: CharacterCounter
  private readonly _disposable: Disposable

  constructor (characterCounter: CharacterCounter) {
    this._characterCounter = characterCounter
    this._characterCounter.updateCharacterCount()

    // subscribe to selection change and editor activation events
    const subscriptions: Disposable[] = []
    window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions)
    window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions)

    // create a combined disposable from both event subscriptions
    this._disposable = Disposable.from(...subscriptions)
  }

  private _onEvent () {
    this._characterCounter.updateCharacterCount()
  }

  public dispose () {
    this._disposable.dispose()
  }
}
