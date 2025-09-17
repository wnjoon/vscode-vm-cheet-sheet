# Vim Cheat Sheet for VSCode

A comprehensive Vim commands cheat sheet extension for Visual Studio Code. Quickly access Vim commands in 8 different languages with instant search and clipboard integration.

## ✨ Features

- **🌍 8 Languages Support**: English, 한국어, 简体中文, 日本語, Español, Deutsch, Français, Português
- **⚡ Quick Access**: Press `Ctrl+K V` (or `Cmd+K V` on Mac) to instantly open the cheat sheet
- **🔍 Real-time Search**: Type to filter commands by name, description, or category
- **📋 Clipboard Integration**: Click any command to copy it to your clipboard
- **🎨 Organized by Categories**: Commands grouped by functionality (Movement, Editing, Visual mode, etc.)
- **⚙️ Easy Configuration**: Change language and shortcuts directly from the cheat sheet interface

## 🚀 Usage

1. **Open Cheat Sheet**: Press `Ctrl+K V` (Windows/Linux) or `Cmd+K V` (Mac)
2. **Search Commands**: Type keywords to filter commands
3. **Change Language**: Click the language option at the top
4. **Change Shortcut**: Click the shortcut option to customize keybinding
5. **Copy Commands**: Select any command to copy it to clipboard

## 🔧 Configuration

### Language Settings

You can change the display language in several ways:

1. **From Cheat Sheet**: Click "🌍 Language" at the top of the cheat sheet
2. **VSCode Settings**: Go to Settings → Search "vim-cheatsheet.language"
3. **Settings JSON**:
   ```json
   {
     "vim-cheatsheet.language": "ko"
   }
   ```

### Supported Languages

- `en` - English
- `ko` - 한국어 (Korean)
- `zh_cn` - 简体中文 (Simplified Chinese)
- `ja` - 日本語 (Japanese)
- `es` - Español (Spanish)
- `de` - Deutsch (German)
- `fr` - Français (French)
- `pt` - Português (Portuguese)

### Custom Shortcuts

1. **From Cheat Sheet**: Click "⌨️ Shortcut" at the top
2. **Keyboard Shortcuts**: `Ctrl+K Ctrl+S` → Search "vim-cheatsheet.show"

## 📦 Installation

1. Open VSCode
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Vim Cheat Sheet"
4. Click Install

## 🛠 Commands

| Command | Description | Default Shortcut |
|---------|-------------|------------------|
| `vim-cheatsheet.show` | Show Vim Cheat Sheet | `Ctrl+K V` / `Cmd+K V` |

## 📊 Data Source

This extension uses data from [vim.rtorr.com](https://vim.rtorr.com), an excellent open-source Vim cheat sheet project under MIT License. All translations and command descriptions are sourced from this project.

## 🔗 Related Links

- [vim.rtorr.com](https://vim.rtorr.com) - Original Vim cheat sheet
- [GitHub Repository](https://github.com/wnjoon/vscode-vm-cheet-sheet)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 Release Notes

### 1.0.0

- Initial release
- Support for 8 languages
- Quick access with customizable shortcuts
- Real-time search and filtering
- Clipboard integration
- In-app language and shortcut configuration

---

**Enjoy coding with Vim! 🎉**