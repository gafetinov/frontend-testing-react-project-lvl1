import fs from 'fs';
import path from 'path';
import axios from 'axios';
import cheerio from 'cheerio';

const getPage = (href) => axios.get(href).then((res) => res.data);
const loadPicture = (href, pathToSave) => axios({
  method: 'get',
  url: href,
  responseType: 'stream',
}).then((response) => {
  response.data.pipe(fs.createWriteStream(pathToSave));
});

const findAllImgTags = (html) => {
  const $ = cheerio.load(html);
  const imgTagsString = cheerio.html($('img'));
  const separator = '>';
  return imgTagsString
    .split(separator)
    .filter((x) => !!x && x !== '')
    .map((element) => element + separator);
};

const replaceSrcToLocal = (html, imgTags, root) => imgTags.reduce((acc, tag) => {
  const src = tag.match(/src="(.+)"/i)[1];
  const imgName = src.split('/').pop();
  const tagWithLocalSrc = tag.replace(`src="${src}"`, `src="${root}/${imgName}"`);
  return acc.replace(tag, tagWithLocalSrc);
}, html);

export default async (href, dirToSave = '.') => {
  const commonFilesName = href.replace(/^https?:\/\//, '').replace(/\W/g, '-');
  const root = path.resolve(dirToSave);
  const htmlPath = `${root}/${commonFilesName}.html`;
  const resourcesDirPath = `${root}/${commonFilesName}_files`;
  const pageContent = await getPage(href);
  const imgTags = findAllImgTags(pageContent);
  if (imgTags.length > 0 && !fs.existsSync(resourcesDirPath)) {
    fs.mkdirSync(resourcesDirPath);
  }
  const imgUrls = imgTags.map((tag) => `${href}${tag.match(/src="(.+?)"/i)[1]}`);
  await Promise.all(imgUrls.map((url) => {
    const imgName = url.split('/').pop();
    return loadPicture(url, `${resourcesDirPath}/${imgName}`);
  }));
  const updatedHtml = replaceSrcToLocal(pageContent, imgTags, `/${commonFilesName}_files`);
  fs.writeFileSync(htmlPath, updatedHtml, 'utf-8');
  return htmlPath;
};
