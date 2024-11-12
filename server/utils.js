const { headers } = require("./constants");
const unirest = require("unirest");
const fs = require("fs");

const curlContent = async (url) => {
  return new Promise((resolve, reject) => {
    let dataBody = "";
    unirest
      .request({
        uri: url,
        headers: headers,
        gzip: true,
      })
      .on("error", (error) => {
        console.error("Error saat melakukan request:", error);
        reject(error); // Tolak promise jika ada error
      })
      .on("data", (data) => {
        dataBody += data;
      })
      .on("end", (response) => {
        console.log("Response:", response); // Log response untuk debugging

        try {
          // Ambil cookie dari response headers
          const cookies = response.headers["set-cookie"];
          if (cookies) {
            global.cookies = cookies;
          }
        } catch (error) {
          console.error("Error saat mengakses headers:", error);
        }

        resolve(dataBody);
      });
  });
};

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const ucwords = (str) => {
  let strVal = [];
  str = str.split(" ");
  for (var chr = 0; chr < str.length; chr++) {
    strVal[chr] =
      str[chr].substring(0, 1).toUpperCase() +
      str[chr].substring(1, str[chr].length);
  }
  return strVal.join(" ");
};

const getFile = async (path) => {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(process.cwd() + "/" + path, "utf-8", (err, data) => {
        if (err) {
          console.error("Error saat membaca file:", err);
          resolve("err"); // Tetap resolve "err" agar kode yang memanggil fungsi ini dapat menangani error
        } else {
          resolve(data);
        }
      });
    } catch (error) {
      console.error("Error in getFile:", error);
      resolve("err"); // Resolve "err" jika terjadi error
    }
  });
};

const getListFile = async (path) => {
  return new Promise((resolve) => {
    try {
      fs.readdir(process.cwd() + "/" + path, (err, files) => {
        if (err) {
          console.error("Error saat membaca direktori:", err);
          resolve([]);
        } else {
          let dataBack = [];
          files.forEach((file) => {
            dataBack.push(path + "/" + file);
          });
          resolve(dataBack);
        }
      });
    } catch (error) {
      console.error("Error in getListFile:", error);
      resolve([]); // Resolve array kosong jika terjadi error
    }
  });
};

const removeBadWords = (str, badWords) => {
  try {
    let sentences;
    let cWords = " " + badWords;
    cWords = cWords.split(",");
    let rgx = new RegExp(cWords.join(" | "), "gi");
    sentences = str.replace(rgx, " ");
    sentences = sentences.replace(/\s+/g, " ");
    return sentences;
  } catch (error) {
    console.error("Error in removeBadWords:", error);
    return str; // Kembalikan string asli jika terjadi error
  }
};

const validStr = (str) => {
  return new Promise((resolve) => {
    try {
      if (str.indexOf("&fbclid") > 0) {
        resolve(validStrSpace(str.split("&fbclid")[0]));
      } else {
        resolve(validStrSpace(str));
      }
    } catch (error) {
      console.error("Error in validStr:", error);
      resolve(str); // Resolve string asli jika terjadi error
    }
  });
};

const validStrSpace = (str) => {
  try {
    str = str.toLowerCase();
    str = str.replace(/-/g, " ");
    str = str.replace(/\s+/g, " ");
    return limitWords(str, 7);
  } catch (error) {
    console.error("Error in validStrSpace:", error);
    return str; // Kembalikan string asli jika terjadi error
  }
};

const limitWords = (str, int) => {
  try {
    str = str.split(" ");
    if (str.length <= int) {
      return str.join(" ");
    } else {
      let res = [];
      for (let i = 0; i < int; i++) {
        res.push(str[i]);
      }
      return res.join(" ");
    }
  } catch (error) {
    console.error("Error in limitWords:", error);
    return str; // Kembalikan string asli jika terjadi error
  }
};

module.exports = {
  curlContent,
  sleep,
  ucwords,
  getFile,
  getListFile,
  removeBadWords,
  validStr,
};
