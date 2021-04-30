import fs from 'fs';
import path from 'path';
import os from 'os';
import nock from 'nock';
import loadPage from '../src';

describe('page-loader', () => {
  let dirToSave;

  beforeEach((done) => {
    nock.cleanAll();
    fs.mkdtemp(path.join(os.tmpdir(), 'page-loader'), (err, dir) => {
      dirToSave = dir;
      done();
    });
  });

  test('simple test', async () => {
    const pageHref = 'https://www.example.com';
    const pageContent = '<html lang="ru"><body><h1>Hello world!</h1></body></html>';
    nock(pageHref).get('/').reply(200, pageContent);
    const resultPath = await loadPage(pageHref, dirToSave);
    expect(resultPath).toBe(`${dirToSave}/www-example-com.html`);
    const loadedPageContent = fs.readFileSync(resultPath, 'utf-8');
    expect(loadedPageContent).toBe(pageContent);
  });

  test('should correct load page', async () => {
    const pageHref = 'https://www.example.com';
    const pngPath = '/images/picture.png';
    const jpegPath = '/images/picture.jpeg';
    const pageContent = fs.readFileSync(`${__dirname}/../__fixtures__/page.html`, 'utf-8');
    const png = fs.readFileSync(`${__dirname}/../__fixtures__/page_files/picture.png`, 'binary');
    const jpeg = fs.readFileSync(`${__dirname}/../__fixtures__/page_files/picture.jpeg`, 'binary');
    nock(pageHref).get('/').reply(200, pageContent);
    nock(pageHref).get(pngPath).reply(200, png);
    nock(pageHref).get(jpegPath).reply(200, jpeg);
    const resultPath = await loadPage(pageHref, dirToSave);
    expect(resultPath).toBe(`${dirToSave}/www-example-com.html`);
    const loadedPageContent = fs.readFileSync(resultPath, 'utf-8');
    const expectedContent = fs.readFileSync(`${__dirname}/../__fixtures__/loaded-page.html`, 'utf-8');
    expect(loadedPageContent).toBe(expectedContent);
    const loadedPng = fs.readFileSync(`${resultPath}/www-example-com_files/picture.png`, 'binary');
    expect(loadedPng).toEqual(png);
    const loadedJpeg = fs.readFileSync(`${resultPath}/www-example-com_files/picture.jpeg`, 'binary');
    expect(loadedJpeg).toEqual(loadedJpeg);
  });
});
