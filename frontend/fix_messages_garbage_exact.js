const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const regex = /\}\)\}[\s\S]*?submitReply\(m\.user_id[\s\S]*?\}\)\}[\s\S]*?<\/div>\s*<\/div>/;

if (code.match(regex)) {
  code = code.replace(regex, '})}</>\n                  </div>\n                </div>'); // wait, the structure is:
  // {allMessages.map(...))}
  // </div>
  // </div>
  // )}
}

// Let's do a substring replace
const sIdx = code.indexOf('))}\n                        />\n');
const eIdx = code.indexOf("          {activeTab === 'profile' && profileView === 'all_users' && (");
if (sIdx !== -1 && eIdx !== -1) {
  code = code.substring(0, sIdx + 4) + '                </div>\n              </div>\n            )}\n\n' + code.substring(eIdx);
  fs.writeFileSync('src/app/page.js', code);
  console.log('Fixed garbage by substring');
}
