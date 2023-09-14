/**
 *
 * @description 图片压缩
 */
const fs = require("fs");
const chalk = require("chalk");
const https = require("https");
const path = require("path");
const { getPngList, getRandomIP, sizeFormat, fileExit } = require("./tools");

/*
  下载
*/
function onDataDownload(obj, imgpath) {
  const options = new URL(obj.output.url);
  const req = https.request(options, (res) => {
    let body = "";
    res.setEncoding("binary");
    res.on("data", function (data) {
      body += data;
    });
    res.on("end", function () {
      fs.writeFile(imgpath, body, "binary", (err) => {
        const imgname = imgpath.replace(process.cwd(), ".");
        if (err) {
          console.log(chalk.red(`写入文件失败：${imgname}`));
          return;
        }
        const ratio = ((1 - obj.output.ratio) * 100).toFixed(1);
        console.log(chalk.yellow(`【${imgname} 压缩成功】`));
        console.log(
          chalk.green(
            [
              `压缩前: ${sizeFormat(obj.input.size)}`,
              `压缩后: ${sizeFormat(obj.output.size)}`,
              `压缩率：${ratio} %`
            ].join(" ==> ")
          )
        );
      });
    });
  });
  req.on("error", (e) => {
    console.error(e);
  });
  req.end(() => {});
}

/*
  上传压缩
*/
function fileUploadCompress(imgFile) {
  const options = {
    method: "POST",
    hostname: "tinypng.com",
    path: "/backend/opt/shrink",
    headers: {
      rejectUnauthorized: false,
      "Postman-Token": Date.now(),
      "Cache-Control": "no-cache",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36"
    }
  };
  options.headers["X-Forwarded-For"] = getRandomIP();
  const req = https.request(options, function (res) {
    res.on("data", (buf) => {
      const obj = JSON.parse(buf.toString());
      if (obj.error) {
        console.log(chalk.red(`[${imgFile}]：压缩失败！报错：${obj.message}`));
      } else {
        onDataDownload(obj, imgFile);
      }
    });
  });
  req.write(fs.readFileSync(imgFile), "binary");
  req.on("error", (e) => {
    console.error(e);
  });
  req.end();
}

function main({ url = "./", file }) {
  let files = [];
  if (file && path.extname(file) === ".png") {
    const filePath = path.join(process.cwd(), file);
    if (fileExit(filePath)) {
      files = [filePath];
    } else {
      console.log(chalk.red(`图片路径找不到`));
      process.exit(0);
    }
  } else {
    const folderPath = path.join(process.cwd(), url);
    files = getPngList(folderPath);
  }
  if (!files.length) {
    console.log(chalk.red(`没有要压缩的图片`));
    process.exit(0);
  }
  files.forEach((url) => {
    fileUploadCompress(url);
  });
}

module.exports = main;
