import { program } from 'commander';
import loadPage from './index.js';

export default () => {
  program
    .version('0.0.1', '-v, --version')
    .description('Load content of the web page')
    .arguments('<href>')
    .option('--output [dirPath]', 'dir to save', undefined)
    .action(async (href, options) => {
      console.log(await loadPage(href, options.output));
    })
    .parse(process.argv);
};
