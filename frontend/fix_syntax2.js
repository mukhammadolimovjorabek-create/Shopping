const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const sIdx = code.indexOf('                      />');
const eIdx = code.indexOf("          {activeTab === 'profile' && profileView === 'all_messages' && (");

if (sIdx !== -1 && eIdx !== -1) {
  const toDelete = code.substring(sIdx, eIdx);
  code = code.replace(toDelete, '            )}\n\n');
  fs.writeFileSync('src/app/page.js', code);
  console.log('Fixed block');
} else {
  console.log('Could not find block');
}
