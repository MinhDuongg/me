const fs=require('node:fs');
module.exports=file=>{const module={exports:{}};new Function('module',fs.readFileSync(file,'utf8'))(module);return module.exports;};
