import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface VimCommand {
  keys: string;
  description: string;
  category: string;
}

interface VimData {
  commands: VimCommand[];
  lastUpdated: string;
}

interface QuickPickItem extends vscode.QuickPickItem {
  command: VimCommand;
}

class VimCheatSheetProvider {
  private data: Map<string, VimData> = new Map();

  constructor(private context: vscode.ExtensionContext) {
    this.loadData();
  }

  private loadData(): void {
    const dataPath = path.join(this.context.extensionPath, 'data');

    // Core 8 languages
    const languages = [
      { code: 'en', filename: 'en.json' },
      { code: 'ko', filename: 'ko.json' },
      { code: 'zh_cn', filename: 'zh_cn.json' },
      { code: 'ja', filename: 'ja.json' },
      { code: 'es', filename: 'es.json' },
      { code: 'de', filename: 'de.json' },
      { code: 'fr', filename: 'fr.json' },
      { code: 'pt', filename: 'pt.json' }
    ];

    for (const lang of languages) {
      try {
        const langPath = path.join(dataPath, lang.filename);
        if (fs.existsSync(langPath)) {
          const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
          this.data.set(lang.code, langData);
        }
      } catch (error) {
        console.error(`Failed to load ${lang.code} data:`, error);
      }
    }
  }

  private getCurrentLanguage(): string {
    const config = vscode.workspace.getConfiguration('vim-cheatsheet');
    return config.get<string>('language', 'en');
  }

  private getCurrentShortcut(): string {
    // Default shortcut from package.json
    const isMac = process.platform === 'darwin';
    return isMac ? 'Cmd+K V' : 'Ctrl+K V';
  }

  private createQuickPickItems(commands: VimCommand[]): QuickPickItem[] {
    return commands.map(command => ({
      label: `$(symbol-key) ${command.keys}`,
      description: command.description,
      detail: `Category: ${command.category}`,
      command: command
    }));
  }

  async showCheatSheet(): Promise<void> {
    const language = this.getCurrentLanguage();
    const data = this.data.get(language);

    if (!data) {
      vscode.window.showErrorMessage(`No data available for language: ${language}`);
      return;
    }

    // Create quick pick items
    const items: QuickPickItem[] = [];

    // Add language switcher at the top
    const availableLanguages = Array.from(this.data.keys());
    const languageNames = {
      'en': 'English',
      'ko': '한국어',
      'zh_cn': '简体中文',
      'ja': '日本語',
      'es': 'Español',
      'de': 'Deutsch',
      'fr': 'Français',
      'pt': 'Português'
    };

    items.push({
      label: `$(globe) Language: ${languageNames[language as keyof typeof languageNames] || language}`,
      description: 'Click to change language',
      detail: `Available: ${availableLanguages.map(lang => languageNames[lang as keyof typeof languageNames] || lang).join(', ')}`,
      kind: vscode.QuickPickItemKind.Default,
      command: { keys: '__CHANGE_LANGUAGE__', description: 'Change Language', category: 'Settings' }
    });

    // Add shortcut settings
    const currentShortcut = this.getCurrentShortcut();
    items.push({
      label: `$(keyboard) Shortcut: ${currentShortcut}`,
      description: 'Click to change shortcut',
      detail: 'Open VSCode keyboard shortcuts settings',
      kind: vscode.QuickPickItemKind.Default,
      command: { keys: '__CHANGE_SHORTCUT__', description: 'Change Shortcut', category: 'Settings' }
    });

    // Add separator
    items.push({
      label: '',
      description: '',
      detail: '',
      kind: vscode.QuickPickItemKind.Separator,
      command: { keys: '', description: '', category: '' }
    });

    // Group commands by category for better organization
    const categorizedCommands = new Map<string, VimCommand[]>();
    data.commands.forEach(cmd => {
      if (!categorizedCommands.has(cmd.category)) {
        categorizedCommands.set(cmd.category, []);
      }
      categorizedCommands.get(cmd.category)!.push(cmd);
    });

    // Add category headers and commands
    for (const [category, commands] of categorizedCommands) {
      // Add category separator
      items.push({
        label: `$(folder) ${category}`,
        description: `${commands.length} commands`,
        detail: '',
        kind: vscode.QuickPickItemKind.Separator,
        command: commands[0] // dummy command for interface compliance
      });

      // Add commands in this category
      items.push(...this.createQuickPickItems(commands));
    }

    // Show quick pick
    const quickPick = vscode.window.createQuickPick<QuickPickItem>();
    quickPick.items = items;
    quickPick.placeholder = `Search Vim commands (${data.commands.length} total) • Current: ${languageNames[language as keyof typeof languageNames] || language}`;
    quickPick.matchOnDescription = true;
    quickPick.matchOnDetail = true;

    quickPick.onDidChangeSelection(selection => {
      if (selection.length > 0) {
        const selected = selection[0];
        if (selected.command?.keys === '__CHANGE_LANGUAGE__') {
          // Handle language change
          quickPick.hide();
          this.showLanguagePicker();
        } else if (selected.command?.keys === '__CHANGE_SHORTCUT__') {
          // Handle shortcut change
          quickPick.hide();
          this.openShortcutSettings();
        } else if (selected.command && selected.command.keys) {
          // Copy the command to clipboard
          vscode.env.clipboard.writeText(selected.command.keys);
          vscode.window.showInformationMessage(
            `Copied "${selected.command.keys}" to clipboard!`,
            { modal: false }
          );
        }
      }
    });

    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  }

  private async showLanguagePicker(): Promise<void> {
    const availableLanguages = Array.from(this.data.keys());
    const languageNames = {
      'en': 'English',
      'ko': '한국어',
      'zh_cn': '简体中文',
      'ja': '日本語',
      'es': 'Español',
      'de': 'Deutsch',
      'fr': 'Français',
      'pt': 'Português'
    };
    const currentLanguage = this.getCurrentLanguage();

    const items = availableLanguages.map(lang => ({
      label: `$(globe) ${languageNames[lang as keyof typeof languageNames] || lang}`,
      description: lang === currentLanguage ? '(Current)' : '',
      detail: `Language code: ${lang}`,
      language: lang
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select display language for Vim commands'
    });

    if (selected && selected.language !== currentLanguage) {
      // Update configuration
      const config = vscode.workspace.getConfiguration('vim-cheatsheet');
      await config.update('language', selected.language, vscode.ConfigurationTarget.Global);

      vscode.window.showInformationMessage(
        `Language changed to ${languageNames[selected.language as keyof typeof languageNames] || selected.language}. Press Ctrl+K V again to see the changes.`
      );
    }
  }

  private async openShortcutSettings(): Promise<void> {
    try {
      // Open keyboard shortcuts settings and search for our command
      await vscode.commands.executeCommand('workbench.action.openGlobalKeybindings', 'vim-cheatsheet.show');

      vscode.window.showInformationMessage(
        'Keyboard shortcuts opened! Search for "vim-cheatsheet.show" to change the shortcut.',
        { modal: false }
      );
    } catch (error) {
      // Fallback: just open keyboard shortcuts
      await vscode.commands.executeCommand('workbench.action.openGlobalKeybindings');

      vscode.window.showInformationMessage(
        'Search for "vim-cheatsheet.show" in the keyboard shortcuts to change the shortcut.',
        { modal: false }
      );
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new VimCheatSheetProvider(context);

  const disposable = vscode.commands.registerCommand('vim-cheatsheet.show', () => {
    provider.showCheatSheet();
  });

  context.subscriptions.push(disposable);

  // Show welcome message on first activation
  const hasShownWelcome = context.globalState.get('vim-cheatsheet.hasShownWelcome', false);
  if (!hasShownWelcome) {
    vscode.window.showInformationMessage(
      'Vim Cheat Sheet is ready! Press Ctrl+K V (Cmd+K V on Mac) to open.',
      'Got it!'
    ).then(() => {
      context.globalState.update('vim-cheatsheet.hasShownWelcome', true);
    });
  }
}

export function deactivate() {
  // Cleanup if needed
}