const { getFile } = require("../server/utils");
const Footer = require("./footer");
const Head = require("./head");
const Main = require("./main");
const Navigation = require("./navigation");

const Layout = async (config) => {
  try {
    let injectBody = await getFile("inject_body.txt");
    return `<!DOCTYPE html>
<html>
<head>
${await Head(config)}
</head>
<body>
${Navigation(config)}
${await Main(config)}
${Footer(config)}
${injectBody}
</body>
</html>`;
  } catch (error) {
    console.error("Error in Layout:", error);
    return `<!DOCTYPE html>
<html>
<head>
  <title>Error</title>
</head>
<body>
  <h1>Internal Server Error</h1>
</body>
</html>`;
  }
};

module.exports = Layout;
