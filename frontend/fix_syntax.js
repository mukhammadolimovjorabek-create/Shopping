const fs = require('fs');
let lines = fs.readFileSync('src/app/page.js', 'utf8').split('\n');

let start = -1;
let end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('}}') && lines[i+1] && lines[i+1].includes('/>') && lines[i+2] && lines[i+2].includes('submitReply')) {
    start = i;
  }
  if (start !== -1 && lines[i].includes(')}')) {
    end = i;
    break;
  }
}

if (start !== -1 && end !== -1) {
  lines.splice(start, end - start + 1);
  fs.writeFileSync('src/app/page.js', lines.join('\n'));
  console.log('Fixed syntax error');
} else {
  console.log('Could not find exact block');
}
