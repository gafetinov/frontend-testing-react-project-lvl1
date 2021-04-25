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

  test('should load page', () => {
    const pageContent = fs.readFileSync(`${__dirname}/../__fixtures__/page.html`);
    nock('https://www.google.com').get('/').reply(200, pageContent);
    const resultPath = loadPage('https://www.google.com');
    expect(resultPath).toBe(`${dirToSave}/www-google-com`);
    const resultContent = fs.readFileSync(resultPath);
    expect(resultContent).toBe(pageContent);
  });
});
