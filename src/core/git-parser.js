const simpleGit = require('simple-git');
const path = require('path');

class GitParser {
  constructor() {
    this.git = simpleGit();
  }

  async validateRepository() {
    try {
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        throw new Error('Not a Git repository. Please run this command from within a Git repository.');
      }
      return true;
    } catch (error) {
      throw new Error('Failed to access Git repository: ' + error.message);
    }
  }

  async getCommitsByDate(date) {
    try {
      const userEmail = await this.getCurrentUserEmail();
      
      // ✅ Use raw Git command for maximum compatibility
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const sinceDate = targetDate.toISOString().split('T')[0];
      const untilDate = nextDate.toISOString().split('T')[0];
  
      // Method 1: Try with standard simple-git
      try {
        const logs = await this.git.log([
          '--since=' + sinceDate,
          '--until=' + untilDate,
          '--author=' + userEmail,
          '--no-merges',
          '--all'
        ]);
  
        const commits = [];
        for (const commit of logs.all) {
          const commitDetails = await this.getCommitDetails(commit.hash);
          commits.push({
            hash: commit.hash.substring(0, 7),
            message: commit.message,
            author: commit.author_name,
            email: commit.author_email,
            date: new Date(commit.date),
            files: commitDetails.files,
            insertions: commitDetails.insertions,
            deletions: commitDetails.deletions,
            summary: commitDetails.summary
          });
        }
  
        return this.filterRelevantCommits(commits);
      } catch (error) {
        // Method 2: Fallback to raw command
        console.warn('Trying alternative Git command...');
        
        const rawCommand = `log --since="${sinceDate}" --until="${untilDate}" --author="${userEmail}" --no-merges --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso`;
        const result = await this.git.raw(rawCommand.split(' '));
        
        const commits = [];
        const lines = result.trim().split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          const [hash, author, email, dateStr, message] = line.split('|');
          const commitDetails = await this.getCommitDetails(hash);
          
          commits.push({
            hash: hash.substring(0, 7),
            message: message,
            author: author,
            email: email,
            date: new Date(dateStr),
            files: commitDetails.files,
            insertions: commitDetails.insertions,
            deletions: commitDetails.deletions,
            summary: commitDetails.summary
          });
        }
        
        return this.filterRelevantCommits(commits);
      }
      
    } catch (error) {
      throw new Error('Failed to fetch Git commits: ' + error.message);
    }
  }

  async getCurrentUserEmail() {
    try {
      const config = await this.git.listConfig();
      const userEmail = config.all['user.email'];
      if (!userEmail) {
        throw new Error('Git user email not configured. Please set it with: git config user.email "your-email@example.com"');
      }
      return userEmail;
    } catch (error) {
      throw new Error('Failed to get Git user configuration: ' + error.message);
    }
  }

  async getCommitDetails(hash) {
    try {
      const diffSummary = await this.git.diffSummary([`${hash}^`, hash]);
      
      const files = diffSummary.files.map(file => ({
        name: file.file,
        insertions: file.insertions,
        deletions: file.deletions,
        binary: file.binary
      }));

      return {
        files: files,
        insertions: diffSummary.insertions,
        deletions: diffSummary.deletions,
        filesChanged: diffSummary.files.length,
        summary: `${diffSummary.files.length} files changed, ${diffSummary.insertions} insertions(+), ${diffSummary.deletions} deletions(-)`
      };
    } catch (error) {
      console.warn(`Warning: Could not get details for commit ${hash}:`, error.message);
      return {
        files: [],
        insertions: 0,
        deletions: 0,
        filesChanged: 0,
        summary: 'Details unavailable'
      };
    }
  }

  filterRelevantCommits(commits) {
    return commits.filter(commit => {
      if (commit.message.toLowerCase().includes('merge')) {
        return false;
      }
      
      const automatedPatterns = [
        /^bump version/i,
        /^update dependencies/i,
        /^automated/i,
        /^auto-generated/i,
        /^bot:/i,
        /^\[bot\]/i
      ];
      
      return !automatedPatterns.some(pattern => pattern.test(commit.message));
    });
  }
}

module.exports = { GitParser };
