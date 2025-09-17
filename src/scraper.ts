import axios from 'axios';
import * as cheerio from 'cheerio';
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

class VimDataScraper {
  private readonly baseUrl = 'https://vim.rtorr.com';

  async scrapeLanguage(lang: string = ''): Promise<VimData> {
    const url = lang ? `${this.baseUrl}/lang/${lang}/` : this.baseUrl;
    console.log(`Scraping data from: ${url}`);

    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const commands: VimCommand[] = [];

      // Find all sections with h2 headers
      $('h2').each((_, element) => {
        const category = $(element).text().trim();

        // Get the next ul element that contains commands
        const $commandList = $(element).next('ul');

        $commandList.find('li').each((_, commandElement) => {
          const $command = $(commandElement);
          const text = $command.text().trim();

          // Split the text to separate keys from description
          // Format is usually "keys description"
          const match = text.match(/^(\S+(?:\s+\S+)*?)\s+(.+)$/);

          if (match) {
            const keys = match[1].trim();
            const description = match[2].trim();

            commands.push({
              keys,
              description,
              category
            });
          }
        });
      });

      return {
        commands,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      throw error;
    }
  }

  async scrapeAndSave(): Promise<void> {
    try {
      // Create data directory
      const dataDir = path.join(__dirname, '..', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Core 8 languages (Phase 1)
      const coreLanguages = [
        { code: '', name: 'English', filename: 'en.json' },
        { code: 'ko', name: '한국어', filename: 'ko.json' },
        { code: 'zh_cn', name: '简体中文', filename: 'zh_cn.json' },
        { code: 'ja', name: '日本語', filename: 'ja.json' },
        { code: 'es_es', name: 'Español', filename: 'es.json' },
        { code: 'de_de', name: 'Deutsch', filename: 'de.json' },
        { code: 'fr_fr', name: 'Français', filename: 'fr.json' },
        { code: 'pt_br', name: 'Português - Brasil', filename: 'pt.json' }
      ];

      console.log(`🌍 Scraping ${coreLanguages.length} core languages...\n`);

      for (const lang of coreLanguages) {
        console.log(`📥 Scraping ${lang.name}...`);
        try {
          const data = await this.scrapeLanguage(lang.code);
          fs.writeFileSync(
            path.join(dataDir, lang.filename),
            JSON.stringify(data, null, 2)
          );
          console.log(`✅ ${lang.name} saved: ${data.commands.length} commands`);
        } catch (error) {
          console.error(`❌ Failed to scrape ${lang.name}:`, error);
        }

        // Add small delay to be respectful to the server
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('\n🎉 All core languages scraped successfully!');

    } catch (error) {
      console.error('Failed to scrape and save data:', error);
      throw error;
    }
  }
}

// Export for use in extension
export { VimCommand, VimData, VimDataScraper };

// CLI usage when run directly
if (require.main === module) {
  const scraper = new VimDataScraper();
  scraper.scrapeAndSave()
    .then(() => {
      console.log('🎉 All data scraped successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Scraping failed:', error);
      process.exit(1);
    });
}