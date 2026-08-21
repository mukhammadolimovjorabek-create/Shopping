const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const sIdx = code.indexOf('                      <div className="mt-3 flex gap-2">');
const eIdx = code.indexOf("          {activeTab === 'profile' && profileView === 'all_messages' && (");

const replacement = `                      <div className="mt-3 flex gap-2">
                        <input 
                          type="text" 
                          placeholder={r.admin_reply ? "Javobni o'zgartirish..." : "Javob yozish..."}
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-sm rounded-lg p-2 text-black dark:text-white outline-none focus:border-purple-500"
                          value={replyTexts[r.id] || ''}
                          onChange={(e) => setReplyTexts({...replyTexts, [r.id]: e.target.value})}
                        />
                        <button onClick={() => submitReply(r.id, r.user_id)} className="bg-purple-600 text-white px-4 rounded-lg font-bold text-sm hover:bg-purple-700 transition">
                          Yuborish
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

`;

code = code.substring(0, sIdx) + replacement + code.substring(eIdx);
fs.writeFileSync('src/app/page.js', code);
console.log('Fixed block correctly');
