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

## 📋 Requirements

- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0

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

This will guide you through:

1. **AI Provider Selection**:

   - 🤖 **Ollama (Local AI)** - 100% Free, Private, Offline
   - ☁️ **Google Gemini** - Cloud AI, Free tier available
   - 📝 **Template Only** - No AI, just smart formatting

2. **Provider-specific Configuration**:

   - **Ollama**: Model selection and server URL
   - **Gemini**: API key and model selection

3. **Output Preferences**:
   - Summary type (Quick, Detailed, Bullets)
   - Output format (Markdown, JSON, Plain)



## 🔑 Getting API Keys

### **Google Gemini API Key (Free Tier Available)**

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key
5. Use it during `eod-summary setup`

**Free Tier Limits:**

- 15 requests per minute
- 1,500 requests per day
- Perfect for individual developers and small teams

### **Configuration File Location**

Your configuration is stored locally at:

**Linux/macOS:**

```bash
~/.eod-summary/config.json
```

**Windows:**

```bash
C:\Users\YourUsername\.eod-summary\config.json
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
