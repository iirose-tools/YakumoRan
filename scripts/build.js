const fs = require('fs')

const copyDir = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true })
  fs.readdirSync(src).forEach((file) => {
    const srcPath = `${src}/${file}`
    const destPath = `${dest}/${file}`
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  })
}

copyDir('./src/core/web/public', './dist/core/web/public')
