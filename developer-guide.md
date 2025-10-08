# 🚀 EOD Summary CLI

> **AI-powered End-of-Day summary generator from Git commits**

Transform your daily Git commits into professional EOD updates automatically. Works with any programming language and Git repository. Choose between local AI (Ollama) for complete privacy or cloud AI (Google Gemini) for convenience.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20macOS%20%7C%20Windows-lightgrey)](#installation)

## 📋 System Requirements

Before installing, ensure you have:

- **Node.js**: >= 14.0.0 ([Download](https://nodejs.org/))
- **npm**: >= 6.0.0 (comes with Node.js)
- **Platform**: Linux, macOS, or Windows

To verify your installation:

```bash
node --version  # Should show v14.0.0 or higher
npm --version   # Should show 6.0.0 or higher
```

## ✨ Features

- 🤖 **Dual AI Support**: Local AI (Ollama) or Cloud AI (Google Gemini)
- 💰 **Cost-Effective**: Free options available for both AI providers
- 🔒 **Privacy-First**: Local processing keeps your code completely private
- 📊 **Professional Format**: Generate structured EOD updates for teams
- 🌐 **Universal**: Works with any Git repository (PHP, Laravel, React, Python, etc.)
- ⚡ **One-Command**: Generate summaries instantly from any Git project
- 🎯 **Smart Categorization**: Automatically detects features, fixes, and API changes

## 📦 Installation & Setup

### **Method 1: Clone and Install (Recommended)**

```bash
# Clone the repository
git clone https://github.com/urvashi-7span/eod-summary-cli.git
cd eod-summary-cli

# Install dependencies
npm install

# Make globally available
npm link

# Run interactive setup
eod-summary setup
```

### **Method 2: NPM Package (If Published)**

```bash
# Install globally from NPM
npm install -g eod-summary-cli

# Run setup
eod-summary setup
```

### **Method 3: Direct Binary Download**

Download pre-built binaries from the [releases page](https://github.com/yourcompany/eod-summary-cli/releases):

- **Linux**: `eod-summary-linux-x64`
- **macOS**: `eod-summary-macos-x64`
- **Windows**: `eod-summary-win-x64.exe`

## 🔧 Configuration Setup

### **Interactive Setup (Recommended)**

Run the setup command and follow the prompts:

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

### **Sample Configuration**

```json
{
  "aiProvider": "gemini",
  "geminiApiKey": "AIzaSyC8xxx...your-key",
  "geminiModel": "gemini-1.5-flash",
  "defaultSummaryType": "quick",
  "defaultOutputFormat": "markdown",
  "includeStats": true,
  "excludePatterns": ["node_modules/**", "*.lock", "dist/**", "vendor/**"],
  "createdAt": "2024-12-15T10:30:00.000Z"
}
```

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

### **Ollama Setup (Completely Free)**

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Download a model (choose one)
ollama pull codellama:7b    # Best for code (4GB)
ollama pull llama2:7b       # General purpose (4GB)
ollama pull mistral:7b      # Fast and efficient (4GB)
```

**Benefits:**

- 100% free forever
- Complete privacy (nothing leaves your machine)
- Works offline
- No rate limits

## 🚀 Usage

### **Basic Usage**

Navigate to any Git repository and run:

```bash
# Generate EOD summary for today
eod-summary

# Generate for specific date
eod-summary -d 2024-12-15
eod-summary -d yesterday
```

### **Command Options**

```bash
# Summary types
eod-summary -t quick       # Brief summary (default)
eod-summary -t detailed    # Comprehensive report
eod-summary -t bullets     # Clean bullet points

# Output options
eod-summary -o report.md   # Save to file
eod-summary -f json        # JSON format
eod-summary -f plain       # Plain text

# AI options
eod-summary --no-ai        # Template mode (no AI)

# Combined usage
eod-summary -d 2024-12-15 -t detailed -o weekly-report.md
```

### **Additional Commands**

```bash
# View current configuration
eod-summary config

# Re-run setup wizard
eod-summary setup

# Help
eod-summary --help
```

## 📋 Sample Output

### **Professional EOD Format**

```
EOD Update:
Date: 09/15/2024

1. Feature: User authentication system with JWT tokens
   PR: [Add PR link here]
   Commit: abc1234
   Files: app/Http/Controllers/AuthController.php, app/Models/User.php

2. Issue fix: Payment processing timeout bug
   Commit: def5678
   Files: app/Services/PaymentService.php

3. API implemented: User profile update endpoint
   Commit: ghi9012
   Files: routes/api.php, app/Http/Controllers/ProfileController.php
```

### **Detailed Report Format**

```markdown
# EOD Summary - Friday, December 15, 2024

## Key Accomplishments

### 🔐 Authentication System Implementation

- Integrated JWT authentication with secure token management
- Built login/logout endpoints with rate limiting
- Added middleware for protecting authenticated routes
- **Impact**: Enhanced security and better session management

### 💳 Payment Processing Enhancement

- Resolved critical timeout issues in payment gateway
- Implemented proper error handling and retry logic
- Added comprehensive logging for transaction debugging
- **Impact**: Reduced failed transactions by 40%

## Statistics

- **Commits**: 8
- **Files Changed**: 12
- **Lines Added**: +347
- **Lines Removed**: -89
- **AI Provider**: Gemini (gemini-1.5-flash)
```

## 🛠️ Configuration Management

### **View Current Configuration**

```bash
eod-summary config
```

### **Edit Configuration Manually**

```bash
# Linux/macOS
nano ~/.eod-summary/config.json

# Windows
notepad %USERPROFILE%\.eod-summary\config.json
```

### **Reset Configuration**

```bash
# Remove config file and run setup again
rm ~/.eod-summary/config.json  # Linux/macOS
del %USERPROFILE%\.eod-summary\config.json  # Windows

eod-summary setup
```

### **Backup Configuration**

```bash
# Create backup
cp ~/.eod-summary/config.json ~/.eod-summary/config-backup.json
```

## 🔒 Privacy & Security

### **What Gets Processed:**

- ✅ **Commit messages** (the text you write when committing)
- ✅ **File names** (not file contents)
- ✅ **Lines added/removed** (counts only)
- ✅ **Your Git user email** (for filtering your commits)

### **What NEVER Gets Processed:**

- ❌ **Actual source code** content
- ❌ **File contents** or sensitive data
- ❌ **Repository structure** details
- ❌ **Other developers' commits**

### **Local AI (Ollama) Benefits:**

- 🔒 **100% Private** - Nothing ever leaves your machine
- 🚫 **No Internet Required** - Works completely offline
- 💰 **Zero Cost** - No API fees or subscriptions
- 🚀 **Unlimited Usage** - No rate limits or quotas

### **Cloud AI (Gemini) Security:**

- 🔐 **Encrypted Transport** - All requests use HTTPS
- 🚫 **No Data Storage** - Google doesn't store your commit messages
- 🎯 **Minimal Data** - Only commit messages sent, never code content
- 🔑 **Local API Keys** - Stored securely on your machine only

## 📊 Team Deployment

### **For Development Teams**

1. **Share the repository** with your team
2. **Each developer clones and sets up**:
   ```bash
   git clone https://github.com/yourcompany/eod-summary-cli.git
   cd eod-summary-cli
   npm install
   npm link
   eod-summary setup
   ```

## 🚨 Troubleshooting

### **Common Issues**

#### **"Not a Git repository" Error**

```bash
# Make sure you're in a Git repository
git status

# Initialize Git if needed
git init
```

#### **"No commits found" Error**

```bash
# Check if you have commits for the date
git log --oneline --since="2024-12-15" --author="$(git config user.email)"

# Make sure Git user email is configured
git config user.email
git config user.email "your-email@company.com"  # if not set
```

#### **Gemini API Errors**

```bash
# Update to latest model
eod-summary setup
# Choose Gemini and select "gemini-1.5-flash"

# Or switch to Ollama
eod-summary setup
# Choose "Ollama (Local AI)"
```

#### **Ollama Connection Issues**

```bash
# Start Ollama service
ollama serve

# Check if model is installed
ollama list

# Install model if missing
ollama pull codellama:7b
```

#### **Permission Issues**

```bash
# Fix config directory permissions
chmod 755 ~/.eod-summary
chmod 644 ~/.eod-summary/config.json
```

### **Debug Commands**

```bash
# Check Git configuration
git config --list | grep user

# Test Git log manually
git log --oneline --since="today" --author="$(git config user.email)"

# Verify Node.js and npm versions
node --version  # Should be >= 14.0.0
npm --version   # Should be >= 6.0.0
```

## 🎯 Best Practices

### **Writing Better Commit Messages**

Your EOD summary quality depends on your commit message quality!

#### **✅ Good Examples:**

```bash
git commit -m "feat: implement JWT authentication for user login"
git commit -m "fix: resolve payment timeout issue in checkout process"
git commit -m "add: user profile update API endpoint with validation"
git commit -m "refactor: optimize database queries in order service"
```

#### **❌ Poor Examples:**

```bash
git commit -m "changes"
git commit -m "fix stuff"
git commit -m "update"
git commit -m "wip"
```

### **Conventional Commit Format**

```bash
git commit -m "type: description"

# Types:
feat:     # New feature
fix:      # Bug fix
refactor: # Code refactoring
docs:     # Documentation
test:     # Tests
style:    # Formatting
chore:    # Maintenance
```

### **Development Setup**

```bash
git clone https://github.com/yourcompany/eod-summary-cli.git
cd eod-summary-cli
npm install
npm run dev
```

### **Project Structure**

```
eod-summary-cli/
├── src/
│   ├── commands/          # CLI commands
│   ├── core/             # Core functionality
│   │   ├── ai-processor.js    # AI integration
│   │   ├── git-parser.js      # Git analysis
│   │   └── config-manager.js  # Configuration
│   └── utils/            # Utilities
├── tests/                # Test files
└── scripts/              # Build scripts
```
