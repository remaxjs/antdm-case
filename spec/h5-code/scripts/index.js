const loader = require('html-to-js-loader');
const fs = require('fs');
const path = require('path');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

async function main() {
    const html = await readFile(path.join(__dirname, './index.html'));
    const code = loader(html.toString());

    await writeFile(path.join(__dirname, './index.js'), code);
}

main().catch(e => console.log(e));
