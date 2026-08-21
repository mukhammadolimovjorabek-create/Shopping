const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const sIdx = code.indexOf('                      />\n                      <button onClick={() => submitReply(m.user_id, m.id, replyTexts[m.id])}');
const eIdx = code.indexOf("          {activeTab === 'profile' && profileView === 'all_users' && (");

if (sIdx !== -1) {
  // Try to find the next section if all_users doesn't exist
  let actualEIdx = eIdx;
  if (eIdx === -1) {
    actualEIdx = code.indexOf("      </div>\n    </div>\n  );\n}"); // end of component
  }

  const toDelete = code.substring(sIdx, actualEIdx);
  code = code.replace(toDelete, '            )}\n\n');
  fs.writeFileSync('src/app/page.js', code);
  console.log('Fixed garbage for messages');
} else {
  console.log('Garbage not found');
}
