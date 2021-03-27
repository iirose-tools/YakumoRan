const path = require('path');
const fs = require('fs');

fs.readdirSync(path.join(__dirname, '../function')).forEach(e => {
  try {
    fs.mkdirSync(path.join(__dirname, `../dist/function`, e));
  } catch (error) {}
  fs.copyFileSync(path.join(__dirname, '../function', e, 'package.json'), path.join(__dirname, '../dist/function', e, 'package.json'))
});