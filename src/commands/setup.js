const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const { ConfigManager } = require('../core/config-manager');
const { AIProcessor } = require('../core/ai-processor');

async function setupCommand() {
  console.log(chalk.blue.bold('\n🔧 EOD Summary CLI Setup\n'));
  
  const currentConfig = ConfigManager.loadConfig();
  
  console.log(chalk.blue('Current Configuration:'));
  console.log(chalk.gray(`- AI Provider: ${currentConfig.aiProvider || 'Not set'}`));
  console.log(chalk.gray(`- Summary Type: ${currentConfig.defaultSummaryType}`));
  console.log(chalk.gray(`- Output Format: ${currentConfig.defaultOutputFormat}`));
  console.log();

  try {
    const providerChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'aiProvider',
        message: 'Choose your AI provider:',
        choices: [
          {
            name: '🤖 Ollama (Local AI) - 100% Free, Private, Offline',
            value: 'ollama',
            short: 'Ollama'
          },
          {
            name: '☁️  Google Gemini - Cloud AI, Free tier available',
            value: 'gemini',
            short: 'Gemini'
          },
          {
            name: '📝 Template Only - No AI, just smart formatting',
            value: 'template',
            short: 'Template'
          }
        ],
        default: currentConfig.aiProvider || 'ollama'
      }
    ]);

    let updatedConfig = { ...currentConfig, aiProvider: providerChoice.aiProvider };

    if (providerChoice.aiProvider === 'gemini') {
      console.log(chalk.blue('\n📋 To get your Gemini API key:'));
      console.log(chalk.gray('1. Visit: https://makersuite.google.com/app/apikey'));
      console.log(chalk.gray('2. Sign in with your Google account'));
      console.log(chalk.gray('3. Click "Create API Key"'));
      console.log(chalk.gray('4. Copy the generated key\n'));
    
      const geminiConfig = await inquirer.prompt([
        {
          type: 'input',
          name: 'geminiApiKey',
          message: 'Enter your Google Gemini API Key:',
          validate: (input) => {
            if (!input.trim()) {
              return 'API Key is required. Get one from: https://makersuite.google.com/app/apikey';
            }
            return true;
          }
        },
        {
          type: 'list',
          name: 'geminiModel',
          message: 'Choose Gemini model:',
          choices: [
            { name: 'gemini-1.5-flash - Fast and efficient (recommended)', value: 'gemini-1.5-flash' },
            { name: 'gemini-1.5-pro - More capable but slower', value: 'gemini-1.5-pro' },
            { name: 'gemini-1.0-pro - Legacy model', value: 'gemini-1.0-pro' }
          ],
          default: 'gemini-1.5-flash'
        }
      ]);
      
      updatedConfig = { ...updatedConfig, ...geminiConfig };
    }

    const preferences = await inquirer.prompt([
      {
        type: 'list',
        name: 'defaultSummaryType',
        message: 'Choose default summary type:',
        choices: [
          { name: 'Quick - Brief summary with key points (recommended)', value: 'quick' },
          { name: 'Detailed - Comprehensive report for stakeholders', value: 'detailed' },
          { name: 'Bullets - Clean bullet points only', value: 'bullets' }
        ],
        default: currentConfig.defaultSummaryType
      },
      {
        type: 'list',
        name: 'defaultOutputFormat',
        message: 'Choose default output format:',
        choices: [
          { name: 'Markdown - Rich formatting (recommended)', value: 'markdown' },
          { name: 'Plain Text - Simple text', value: 'plain' },
          { name: 'JSON - Structured data', value: 'json' }
        ],
        default: currentConfig.defaultOutputFormat
      }
    ]);

    updatedConfig = { ...updatedConfig, ...preferences };

    ConfigManager.saveConfig(updatedConfig);
    console.log(chalk.green('\n✅ Configuration saved successfully!'));

    console.log(chalk.blue('\n📖 Usage Examples:'));
    console.log(chalk.gray('  eod-summary                    # Generate summary for today'));
    console.log(chalk.gray('  eod-summary -d 15-12-2024     # Generate for specific date'));
    console.log(chalk.gray('  eod-summary -t detailed       # Generate detailed summary'));
    console.log(chalk.gray('  eod-summary -o report.md      # Save to file'));
    
    console.log(chalk.green('\n🎯 You\'re all set! Happy coding! 🚀\n'));
    
  } catch (error) {
    console.error(chalk.red('Setup failed:'), error.message);
    process.exit(1);
  }
}

module.exports = { setupCommand };
