# 🚀 EOD Summary CLI

> **AI-powered End-of-Day summary generator from Git commits**

Transform your daily Git commits into professional summaries using AI. Works with **any programming language** and **any Git repository**. Choose between local AI (Ollama) for privacy or cloud AI (Google Gemini) for convenience.

## ✨ Features

- 🤖 **Dual AI Support**: Choose between local (Ollama) or cloud (Gemini) AI
- 🆓 **Cost-Effective**: Free tier available for both AI providers
- 🔒 **Privacy-First**: Local processing option keeps your code private
- 📊 **Multiple Summary Types**: Quick, Detailed, or Bullet Points
- 🌐 **Universal**: Works with any Git repository (PHP, JavaScript, Python, Java, etc.)
- ⚡ **Fast & Easy**: One-command operation from any Git repository

## 📦 Installation

### Clone the repository
```bash
git clone https://github.com/urvashi-7span/eod-summary.git
cd eod-summary

# Install dependencies
npm install

# Make globally available
npm link
```

## 🔧 Setup

### Interactive Setup
```bash
eod-summary setup
```

## 🚀 Usage

### Basic Usage
```bash
# Generate summary for today (in any Git repository)
cd /path/to/your/project
eod-summary
```

### Command Options
```bash
# Specific date
eod-summary -d 2024-12-15
eod-summary -d yesterday

# Summary types
eod-summary --type quick       # Brief overview (default)
eod-summary --type detailed    # Comprehensive report  
eod-summary --type bullets     # Clean bullet points

# Output options
eod-summary --output report.md    # Save to file
eod-summary --format json        # JSON format
eod-summary --format plain       # Plain text

# Without AI (template-based)
eod-summary --no-ai
```

## 💡 Perfect For

- **Daily standups** - Quick summaries of yesterday's work
- **Weekly reports** - Detailed progress for managers
- **Code reviews** - Context for pull requests
- **Time tracking** - What you actually accomplished

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for developers who want to save time on daily reports while maintaining professional communication.**
