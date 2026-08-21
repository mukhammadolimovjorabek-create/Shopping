const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const sIdx = code.indexOf('                  ))}\n                        />\n                      <button onClick={() => submitReply(m.user_id, m.id, replyTexts[m.id])} className="bg-purple-600');
if (sIdx !== -1) {
  const eIdx = code.indexOf('                </div>', sIdx);
  if (eIdx !== -1) {
    const toReplace = code.substring(sIdx, eIdx + 22);
    code = code.replace(toReplace, '                  ))}\n                </div>\n              </div>\n            )}\n');
    fs.writeFileSync('src/app/page.js', code);
    console.log('Fixed garbage chunk');
  }
}
