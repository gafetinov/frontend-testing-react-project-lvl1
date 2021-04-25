import fs from 'fs';
import path from 'path';
import os from 'os';
import nock from 'nock';
import loadPage from '../src';

describe('page-loader', () => {
  let dirToSave;

  beforeEach((done) => {
    fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'), (err, dir) => {
      dirToSave = dir;
      done();
    });
  });

  test('should load page', async () => {
    const pageHref = 'https://www.google.com';
    const pageContent = fs.readFileSync(`${__dirname}/../__fixtures__/page.html`, 'utf-8');
    nock(pageHref).get('/').reply(200, pageContent);
    const resultPath = await loadPage(pageHref, dirToSave);
    expect(resultPath).toBe(`${dirToSave}/www-google-com.html`);
    const resultContent = fs.readFileSync(resultPath, 'utf-8');
    expect(resultContent).toBe(pageContent);
  });
});
