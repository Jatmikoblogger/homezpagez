module.exports = {
  hash: "38d233dd66f2c162d2a9e173da08c977",
  url: "https://duckduckgo.com/",
  headers: {
    dnt: "1",
    "accept-encoding": "gzip, deflate, sdch, br, zstd",
    "x-requested-with": "XMLHttpRequest",
    "accept-language": "en-US,en;q=0.9",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    referer: "https://duckduckgo.com/",
    authority: "duckduckgo.com",
    "cookie": global.cookies, // Hanya gunakan cookie yang telah disimpan
  },
  max_iter: 1,
  max_retries: 2,
  params_template: {
    l: "wt-wt",
    o: "json",
    q: null,
    vqd: null,
    f: ",,,",
    p: null,
  },
};
