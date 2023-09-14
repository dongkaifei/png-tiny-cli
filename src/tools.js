const fs = require("fs");
const path = require("path");

/*
    文件大小限制
*/
const maxSizeLimit = 3 * 1000 * 1024;

/*
    获取文件列表
*/
function getPngList(folderPath) {
  const pngList = [];
  try {
    const files = fs.readdirSync(folderPath);
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      try {
        const fileInfo = fs.statSync(filePath);
        if (
          fileInfo.size <= maxSizeLimit &&
          fileInfo.isFile() &&
          path.extname(file) === ".png"
        ) {
          pngList.push(filePath);
        }
      } catch (err) {
        console.log("文件找不到");
      }
    });
  } catch (err) {
    console.error(err);
  }
  return pngList;
}

/*
 生成随机IP
*/
function getRandomIP() {
  return Array.from(Array(4))
    .map(() => parseInt(Math.random() * 255 + ""))
    .join(".");
}

function sizeFormat(size) {
  return parseFloat((size / 1024).toFixed(2)) + " kb";
}

function fileExit(file) {
  try {
    return fs.existsSync(file);
  } catch (err) {
    return false;
  }
}

module.exports = {
  getPngList,
  sizeFormat,
  getRandomIP,
  fileExit
};
