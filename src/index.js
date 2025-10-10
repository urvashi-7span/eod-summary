#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const ora = require("ora");
const { GitParser } = require("./core/git-parser");
const { AIProcessor } = require("./core/ai-processor");
const { ConfigManager } = require("./core/config-manager");
const { OutputGenerator } = require("./core/output-generator");
const { setupCommand } = require("./commands/setup");
const { validateDate, formatDate } = require("./utils/date-helpers");

const program = new Command();

program
  .name("eod-summary")
  .description("Generate AI-powered End of Day summaries from Git commits")
  .version("1.0.0");

program
  .command("generate")
  .alias("gen")
  .description("Generate EOD summary for specified date")
  .option(
    "-d, --date <date>",
    "Date for summary (DD-MM-YYYY)",
    formatDate(new Date())
  )
  .option(
    "-t, --type <type>",
    "Summary type: quick, detailed, bullets, eod",
    "eod"
  )
  .option("-o, --output <file>", "Output file path (optional)")
  .option(
    "-f, --format <format>",
    "Output format: markdown, json, plain",
    "markdown"
  )
  .option("--all", "Include all authors' commits (default: only yours)")
  .option("--no-ai", "Generate summary without AI (template-based)")
  .action(async (options) => {
    try {
      await generateSummary(options);
    } catch (error) {
      console.error(chalk.red("Error:"), error.message);
      process.exit(1);
    }
  });

program
  .command("setup")
  .description("Setup API keys and preferences")
  .action(setupCommand);

program
  .command("config")
  .description("Show current configuration")
  .action(() => {
    const config = ConfigManager.loadConfig();
    console.log(chalk.blue("Current Configuration:"));
    console.log(JSON.stringify(ConfigManager.getMaskedConfig(), null, 2));
  });

program
  .option(
    "-d, --date <date>",
    "Date for summary (DD-MM-YYYY)",
    formatDate(new Date())
  )
  .option(
    "-t, --type <type>",
    "Summary type: quick, detailed, bullets, eod",
    "eod"
  )
  .option("-o, --output <file>", "Output file path (optional)")
  .option(
    "-f, --format <format>",
    "Output format: markdown, json, plain",
    "markdown"
  )
  .option("--all", "Include all authors' commits (default: only yours)")
  .option("--no-ai", "Generate summary without AI (template-based)")
  .action(async (options) => {
    if (
      process.argv.length <= 2 ||
      !["generate", "setup", "config"].includes(process.argv[2])
    ) {
      try {
        await generateSummary(options);
      } catch (error) {
        console.error(chalk.red("Error:"), error.message);
        process.exit(1);
      }
    }
  });

async function generateSummary(options) {
  const spinner = ora("Analyzing Git history...").start();

  try {
    const date = validateDate(options.date);
    const summaryType = validateSummaryType(options.type);

    const gitParser = new GitParser();
    await gitParser.validateRepository();

    spinner.text = "Fetching commits...";
    const includeAllAuthors = options.all === true; // default: show only your commits
    const commits = await gitParser.getCommitsByDate(date, includeAllAuthors);

    if (commits.length === 0) {
      spinner.fail(chalk.yellow(`No commits found for ${options.date}`));
      console.log(chalk.gray("\nTips:"));
      console.log(chalk.gray("- Make sure you have commits for this date"));
      console.log(
        chalk.gray(
          "- Check if your Git user email is configured: git config user.email"
        )
      );
      return;
    }

    spinner.text = `Found ${commits.length} commits. Generating summary...`;

    let summary;
    if (options.ai === false) {
      const outputGenerator = new OutputGenerator();
      summary = outputGenerator.generateTemplateBasedSummary(
        commits,
        summaryType
      );
    } else {
      const config = ConfigManager.loadConfig();

      if (config.aiProvider === "gemini" && !config.geminiApiKey) {
        spinner.fail(
          chalk.red("Gemini API key not configured. Run: eod-summary setup")
        );
        return;
      }

      if (config.aiProvider === "ollama") {
        const ollamaStatus = await AIProcessor.testOllamaConnection(
          config.ollamaUrl,
          config.ollamaModel
        );
        if (!ollamaStatus.available) {
          spinner.warn(
            chalk.yellow("Ollama not available, falling back to template...")
          );
          const outputGenerator = new OutputGenerator();
          summary = outputGenerator.generateTemplateBasedSummary(
            commits,
            summaryType
          );
        } else if (!ollamaStatus.hasModel) {
          spinner.fail(
            chalk.red(
              `Model '${config.ollamaModel}' not found. Install it with: ollama pull ${config.ollamaModel}`
            )
          );
          return;
        }
      }

      if (!summary) {
        const aiProcessor = new AIProcessor(config);
        summary = await aiProcessor.generateSummary(commits, summaryType, date);
      }
    }

    const outputGenerator = new OutputGenerator();
    const formattedOutput = outputGenerator.formatOutput(
      summary,
      options.format
    );

    if (options.output) {
      await outputGenerator.saveToFile(formattedOutput, options.output);
      spinner.succeed(chalk.green(`Summary saved to ${options.output}`));
    } else {
      spinner.succeed(chalk.green("Summary generated successfully!"));
      console.log("\n" + formattedOutput);
    }
  } catch (error) {
    spinner.fail(chalk.red("Failed to generate summary"));
    throw error;
  }
}

function validateSummaryType(type) {
  const validTypes = ["quick", "detailed", "bullets", "eod"];
  if (!validTypes.includes(type)) {
    throw new Error(
      `Invalid summary type: ${type}. Valid types: ${validTypes.join(", ")}`
    );
  }
  return type;
}

process.on("unhandledRejection", (reason, promise) => {
  console.error(
    chalk.red("Unhandled Rejection at:"),
    promise,
    chalk.red("reason:"),
    reason
  );
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log(chalk.yellow("\n\nOperation cancelled by user"));
  process.exit(0);
});

program.parse();
