// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  window,
  Disposable,
  ExtensionContext,
  StatusBarAlignment,
  StatusBarItem,
  TextDocument,
} from 'vscode';

// this method is called when your extension is activated. activation is
// controlled by the activation events defined in package.json
export function activate(ctx: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log(
  //   'Congratulations, your extension "Charactercount" is now active!'
  // );

  // create a new character counter
  let characterCounter = new CharacterCounter();
  let controller = new CharacterCounterController(characterCounter);

  // add to a list of disposables which are disposed when this extension
  // is deactivated again.
  ctx.subscriptions.push(controller);
  ctx.subscriptions.push(characterCounter);
}

export class CharacterCounter {
  private _statusBarItem: StatusBarItem | null;

  constructor() {
    this._statusBarItem = null;
  }

  public updateCharacterCount() {
    // Create as needed
    if (!this._statusBarItem) {
      this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    }

    // Get the current text editor
    let editor = window.activeTextEditor;
    if (!editor) {
      this._statusBarItem.hide();
      return;
    }

    let doc = editor.document;

    // Only update status if an MD file
    if (doc.languageId === 'markdown') {
      let characterCount = this._getCharacterCount(doc);

      // Update the status bar
      this._statusBarItem.text =
        characterCount !== 1
          ? `$(pencil) ${characterCount} Characters`
          : '$(pencil) 1 Character';
      this._statusBarItem.show();
    } else {
      this._statusBarItem.hide();
    }
  }

  public _getCharacterCount(doc: TextDocument): number {
    let docContent = doc.getText();

    // Parse out unwanted whitespace so the split is accurate
    docContent = docContent.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
    docContent = docContent.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    let characterCount = 0;
    if (docContent != '') {
      characterCount = docContent.split(' ').length;
    }

    return characterCount;
  }

  public dispose() {
    this._statusBarItem?.dispose();
  }
}

class CharacterCounterController {
  private _characterCounter: CharacterCounter;
  private _disposable: Disposable;

  constructor(characterCounter: CharacterCounter) {
    this._characterCounter = characterCounter;
    this._characterCounter.updateCharacterCount();

    // subscribe to selection change and editor activation events
    let subscriptions: Disposable[] = [];
    window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
    window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

    // create a combined disposable from both event subscriptions
    this._disposable = Disposable.from(...subscriptions);
  }

  private _onEvent() {
    this._characterCounter.updateCharacterCount();
  }

  public dispose() {
    this._disposable.dispose();
  }
}
