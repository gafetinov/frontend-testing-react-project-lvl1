import fs from 'fs';
import axios from 'axios';

const getPageFilePath = (href, dirToSave) => {
  const fileName = href.replace(/^https?:\/\//, '').replace(/\W/g, '-');
  return `${dirToSave}/${fileName}.html`;
};

export default async (href, dirToSave = '.') => {
  const pageFilePath = getPageFilePath(href, dirToSave);
  await axios.get(href).then(({ data }) => {
    fs.writeFileSync(pageFilePath, data);
  }).catch(() => {
    throw new Error('Failed to load page');
  });
  return pageFilePath;
};
