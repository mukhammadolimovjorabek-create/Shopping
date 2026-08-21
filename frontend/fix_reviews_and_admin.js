const fs = require('fs');

let adminCode = fs.readFileSync('src/app/admin/page.js', 'utf8');
// Fix default 'Ertaga'
adminCode = adminCode.replace(/useState\('Ertaga'\)/g, "useState('')");
// Fix label
adminCode = adminCode.replace(/Yetkazib berish \(Matn\)/g, "Yetkazib berish sanasi");
fs.writeFileSync('src/app/admin/page.js', adminCode);

let pageCode = fs.readFileSync('src/app/page.js', 'utf8');

// Fix getAverageRating to use likes or rating
pageCode = pageCode.replace(/r\.rating \|\| 0/g, "r.rating || r.likes || 0");

// Fix submitReview to insert rating as well
pageCode = pageCode.replace(/likes: ratingInput/g, "likes: ratingInput,\n        rating: ratingInput");

// Add fetchProducts(false) inside handleFinalCheckout so stock updates
const fetchProdInsert = "loadMyOrders();\n        fetchProducts(false);";
pageCode = pageCode.replace(/loadMyOrders\(\);/g, fetchProdInsert);

// Fix profileView === 'all_reviews'
const oldAdminReviewsUI = pageCode.match(/\{activeTab === 'profile' && profileView === 'all_reviews' && \([\s\S]*?\}\)/);
if (oldAdminReviewsUI) {
  const newAdminReviewsUI = `{activeTab === 'profile' && profileView === 'all_reviews' && (
              <div className="p-4 pb-20 bg-white dark:bg-slate-900 min-h-screen">
                <button onClick={() => setProfileView('main')} className="mb-4 text-purple-600 font-bold flex items-center gap-1">
                  <span>←</span> Orqaga
                </button>
                <h2 className="text-xl font-bold mb-4 text-black dark:text-white">💬 Mijozlar Sharhlari</h2>
                <div className="space-y-4">
                  {allReviews.map(r => (
                    <div key={r.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                      
                      <div className="flex justify-between mb-2">
                        <p className="font-bold text-black dark:text-white text-lg">{r.users?.first_name || r.user_name || 'Mijoz'}</p>
                        <span className="text-yellow-500 text-sm">{'⭐'.repeat(r.rating || r.likes || 5)}</span>
                      </div>
                      
                      {r.products && (
                        <div className="flex items-center gap-2 mb-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                          <img src={r.products.image_url} className="w-8 h-8 object-cover rounded" />
                          <span className="text-xs font-bold text-black dark:text-white">{r.products.title}</span>
                        </div>
                      )}

                      <p className="text-sm text-black dark:text-white bg-slate-100 dark:bg-slate-900 p-3 rounded-lg mb-3 border border-slate-200 dark:border-slate-700">{r.text}</p>
                      
                      {r.admin_reply && (
                        <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border-l-4 border-purple-500">
                          <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">Sizning javobingiz:</p>
                          <p className="text-sm text-black dark:text-white">{r.admin_reply}</p>
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
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
            )}`;
  pageCode = pageCode.replace(oldAdminReviewsUI[0], newAdminReviewsUI);
}

// Ensure Yetkazib berish sanasi in page.js details
pageCode = pageCode.replace(/tr\("Yetkazish:"\)/g, 'tr("Yetkazib berish sanasi:")');
pageCode = pageCode.replace(/"Yetkazish:": \{ ru: "Доставка:", en: "Delivery:", uz: "Yetkazish:" \}/g, '"Yetkazib berish sanasi:": { ru: "Дата доставки:", en: "Delivery date:", uz: "Yetkazib berish sanasi:" }');


fs.writeFileSync('src/app/page.js', pageCode);
console.log('Finished updating files');
