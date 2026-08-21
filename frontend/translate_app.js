const fs = require('fs');

const FILE_PATH = './src/app/page.js';
let content = fs.readFileSync(FILE_PATH, 'utf8');

if (!content.includes('const [lang, setLang]')) {
  content = content.replace(
    /const \[activeTab, setActiveTab\] = useState\('home'\);/,
    "const [activeTab, setActiveTab] = useState('home');\n" +
    "  const [lang, setLang] = useState('uz');\n" +
    "  const [theme, setTheme] = useState('light');\n" +
    "  useEffect(() => {\n" +
    "    if (typeof window !== 'undefined') {\n" +
    "      const l = localStorage.getItem('omni_lang') || 'uz';\n" +
    "      const t = localStorage.getItem('omni_theme') || 'light';\n" +
    "      setLang(l);\n" +
    "      setTheme(t);\n" +
    "    }\n" +
    "  }, []);\n" +
    "  const changeLang = (newLang) => { setLang(newLang); if (typeof window !== 'undefined') localStorage.setItem('omni_lang', newLang); };\n" +
    "  const changeTheme = (newTheme) => { setTheme(newTheme); if (typeof window !== 'undefined') localStorage.setItem('omni_theme', newTheme); };\n" +
    "  const tr = (text) => {\n" +
    "    const dict = {\n" +
    "      \"XTD\": { ru: \"Прямо из Китая\", en: \"Direct from China\", uz: \"Xitoydan to'g'ridan-to'g'ri\" },\n" +
    "      \"Savatingiz\": { ru: \"Ваша корзина\", en: \"Your Cart\", uz: \"Savatingiz\" },\n" +
    "      \"Savat bo'sh\": { ru: \"Корзина пуста\", en: \"Cart is empty\", uz: \"Savat bo'sh\" },\n" +
    "      \"Jami:\": { ru: \"Итого:\", en: \"Total:\", uz: \"Jami:\" },\n" +
    "      \"Rasmiylashtirish\": { ru: \"Оформить заказ\", en: \"Checkout\", uz: \"Rasmiylashtirish\" },\n" +
    "      \"Buyurtmalarim\": { ru: \"Мои заказы\", en: \"My Orders\", uz: \"Buyurtmalarim\" },\n" +
    "      \"Sharhlarim\": { ru: \"Мои отзывы\", en: \"My Reviews\", uz: \"Sharhlarim\" },\n" +
    "      \"Sotuvchiga murojaat\": { ru: \"Связаться с продавцом\", en: \"Contact Seller\", uz: \"Sotuvchiga murojaat\" },\n" +
    "      \"Sozlamalar\": { ru: \"Настройки\", en: \"Settings\", uz: \"Sozlamalar\" },\n" +
    "      \"Orqaga\": { ru: \"Назад\", en: \"Back\", uz: \"Orqaga\" },\n" +
    "      \"Tilni o'zgartirish\": { ru: \"Изменить язык\", en: \"Change Lang\", uz: \"Tilni o'zgartirish\" },\n" +
    "      \"Mavzuni o'zgartirish\": { ru: \"Изменить тему\", en: \"Change Theme\", uz: \"Mavzuni o'zgartirish\" },\n" +
    "      \"Yorug'\": { ru: \"Светлая\", en: \"Light\", uz: \"Yorug'\" },\n" +
    "      \"Qorong'i\": { ru: \"Тёмная\", en: \"Dark\", uz: \"Qorong'i\" },\n" +
    "      \"Asosiy\": { ru: \"Главная\", en: \"Home\", uz: \"Asosiy\" },\n" +
    "      \"Savat\": { ru: \"Корзина\", en: \"Cart\", uz: \"Savat\" },\n" +
    "      \"Profil\": { ru: \"Профиль\", en: \"Profile\", uz: \"Profil\" },\n" +
    "      \"Sotuvda: Mavjud\": { ru: \"В наличии: Доступно\", en: \"In Stock: Available\", uz: \"Sotuvda: Mavjud\" },\n" +
    "      \"Yetkazish:\": { ru: \"Доставка:\", en: \"Delivery:\", uz: \"Yetkazish:\" },\n" +
    "      \"O'lchamni tanlang:\": { ru: \"Выберите размер:\", en: \"Select size:\", uz: \"O'lchamni tanlang:\" },\n" +
    "      \"Promokod\": { ru: \"Промокод\", en: \"Promo Code\", uz: \"Promokod\" },\n" +
    "      \"Qo'llash\": { ru: \"Применить\", en: \"Apply\", uz: \"Qo'llash\" },\n" +
    "      \"Qabul qilindi!\": { ru: \"Принято!\", en: \"Accepted!\", uz: \"Qabul qilindi!\" },\n" +
    "      \"To'lov (1/2)\": { ru: \"Оплата (1/2)\", en: \"Payment (1/2)\", uz: \"To'lov (1/2)\" },\n" +
    "      \"To'lov (2/2)\": { ru: \"Оплата (2/2)\", en: \"Payment (2/2)\", uz: \"To'lov (2/2)\" },\n" +
    "      \"Jo'natish\": { ru: \"Отправить\", en: \"Send\", uz: \"Jo'natish\" },\n" +
    "      \"Sharhlar\": { ru: \"Отзывы\", en: \"Reviews\", uz: \"Sharhlar\" },\n" +
    "      \"Foydalanuvchi\": { ru: \"Пользователь\", en: \"User\", uz: \"Foydalanuvchi\" },\n" +
    "      \"Ismingiz va familiyangiz\": { ru: \"Ваше имя и фамилия\", en: \"Your full name\", uz: \"Ismingiz va familiyangiz\" },\n" +
    "      \"Do'konni ochish\": { ru: \"Открыть магазин\", en: \"Open Shop\", uz: \"Do'konni ochish\" }\n" +
    "    };\n" +
    "    if (!dict[text] || !dict[text][lang]) return text;\n" +
    "    return dict[text][lang];\n" +
    "  };\n"
  );
}

content = content.replace(
  /<button className="flex-1 bg-purple-600 text-white font-bold py-2\.5 rounded-xl shadow-sm">\s*🇺🇿 O'zbekcha\s*<\/button>\s*<button onClick=\{\(\) => alert\("Rus tili tez kunda qo'shiladi! \(Hali tarjimalar to'liq emas\)"\)\} className="flex-1 bg-gray-100 text-gray-500 font-bold py-2\.5 rounded-xl active:scale-95 transition">\s*🇷🇺 Русский\s*<\/button>/,
  "<button onClick={() => changeLang('uz')} className={`flex-1 font-bold py-2.5 rounded-xl shadow-sm transition ${lang === 'uz' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>🇺🇿 O'zbekcha</button>\n" +
  "   <button onClick={() => changeLang('ru')} className={`flex-1 font-bold py-2.5 rounded-xl shadow-sm transition ${lang === 'ru' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>🇷🇺 Русский</button>\n" +
  "   <button onClick={() => changeLang('en')} className={`flex-1 font-bold py-2.5 rounded-xl shadow-sm transition ${lang === 'en' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>🇬🇧 English</button>"
);

content = content.replace(
  /<button className="flex-1 bg-purple-600 text-white font-bold py-2\.5 rounded-xl shadow-sm">\s*☀️ Yorug'\s*<\/button>\s*<button onClick=\{\(\) => alert\("Qorong'i \(Tungi\) mavzu dizayni ishlab chiqilmoqda! Tez kunda qo'shiladi\."\)\} className="flex-1 bg-gray-100 text-gray-500 font-bold py-2\.5 rounded-xl active:scale-95 transition">\s*🌙 Qorong'i\s*<\/button>/,
  "<button onClick={() => changeTheme('light')} className={`flex-1 font-bold py-2.5 rounded-xl shadow-sm transition ${theme === 'light' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>☀️ {tr(\"Yorug'\")}</button>\n" +
  "   <button onClick={() => changeTheme('dark')} className={`flex-1 font-bold py-2.5 rounded-xl shadow-sm transition ${theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>🌙 {tr(\"Qorong'i\")}</button>"
);

const replacements = [
  [/>Asosiy</g, '>{tr("Asosiy")}<'],
  [/>Savat</g, '>{tr("Savat")}<'],
  [/>Profil</g, '>{tr("Profil")}<'],
  [/>📦 Buyurtmalarim</g, '>📦 {tr("Buyurtmalarim")}<'],
  [/>💬 Sharhlarim</g, '>💬 {tr("Sharhlarim")}<'],
  [/>🎧 Sotuvchiga murojaat</g, '>🎧 {tr("Sotuvchiga murojaat")}<'],
  [/>⚙️ Sozlamalar</g, '>⚙️ {tr("Sozlamalar")}<'],
  [/>‹ Orqaga</g, '>‹ {tr("Orqaga")}<'],
  [/>🌐 Tilni o'zgartirish</g, '>🌐 {tr("Tilni o\'zgartirish")}<'],
  [/>🎨 Mavzuni o'zgartirish</g, '>🎨 {tr("Mavzuni o\'zgartirish")}<'],
  [/>Savat bo'sh</g, '>{tr("Savat bo\'sh")}<'],
  [/>Jami:<\/span>/g, '>{tr("Jami:")}</span>'],
  [/>Rasmiylashtirish</g, '>{tr("Rasmiylashtirish")}<'],
  [/>Sotuvda: <strong className="text-green-600">Mavjud<\/strong>/g, '>{tr("Sotuvda: Mavjud")}<'],
  [/>Yetkazish: /g, '>{tr("Yetkazish:")} '],
  [/>O'lchamni tanlang:</g, '>{tr("O\'lchamni tanlang:")}<'],
  [/>Promokod</g, '>{tr("Promokod")}<'],
  [/>Qo'llash</g, '>{tr("Qo\'llash")}<'],
  [/>Qabul qilindi!</g, '>{tr("Qabul qilindi!")}<'],
  [/>To'lov \(1\/2\)</g, '>{tr("To\'lov (1/2)")}<'],
  [/>To'lov \(2\/2\)</g, '>{tr("To\'lov (2/2)")}<'],
  [/>Jo'natish</g, '>{tr("Jo\'natish")}<'],
  [/placeholder="Ismingiz va familiyangiz"/g, 'placeholder={tr("Ismingiz va familiyangiz")}'],
  [/>Do'konni ochish</g, '>{tr("Do\'konni ochish")}<'],
  [/>Savatingiz \(/g, '>{tr("Savatingiz")} (']
];

replacements.forEach(([regex, replacement]) => {
  content = content.replace(regex, replacement);
});

if (!content.includes('data-theme={theme}')) {
  content = content.replace(/className="flex flex-col h-screen bg-gradient-to-br/, 'data-theme={theme} className="omni-app flex flex-col h-screen bg-gradient-to-br');
}

if (!content.includes('data-theme=\\\'dark\\\'')) {
  content = content.replace(
    /<style jsx global>\{`/,
    "<style jsx global>{`\n" +
    "      [data-theme='dark'].omni-app {\n" +
    "        background: #0f172a !important;\n" +
    "        color: #f8fafc !important;\n" +
    "      }\n" +
    "      [data-theme='dark'] .bg-white,\n" +
    "      [data-theme='dark'] .bg-gray-50,\n" +
    "      [data-theme='dark'] .bg-gray-100 {\n" +
    "        background-color: #1e293b !important;\n" +
    "        border-color: #334155 !important;\n" +
    "        color: #f8fafc !important;\n" +
    "      }\n" +
    "      [data-theme='dark'] .text-gray-900,\n" +
    "      [data-theme='dark'] .text-gray-800,\n" +
    "      [data-theme='dark'] .text-gray-700,\n" +
    "      [data-theme='dark'] .text-gray-600,\n" +
    "      [data-theme='dark'] .text-gray-500 {\n" +
    "        color: #cbd5e1 !important;\n" +
    "      }\n" +
    "      [data-theme='dark'] .text-black {\n" +
    "        color: #ffffff !important;\n" +
    "      }\n" +
    "      [data-theme='dark'] input,\n" +
    "      [data-theme='dark'] textarea {\n" +
    "        background-color: #0f172a !important;\n" +
    "        color: #ffffff !important;\n" +
    "        border-color: #475569 !important;\n" +
    "      }\n" +
    "      [data-theme='dark'] button.bg-white {\n" +
    "        background-color: #1e293b !important;\n" +
    "      }\n" +
    "      [data-theme='dark'] .border-gray-100,\n" +
    "      [data-theme='dark'] .border-gray-200 {\n" +
    "        border-color: #334155 !important;\n" +
    "      }\n" +
    "      [data-theme='dark'] .bg-purple-50 {\n" +
    "        background-color: #1e1b4b !important;\n" +
    "      }\n" +
    "      [data-theme='dark'] .text-purple-600 {\n" +
    "        color: #a78bfa !important;\n" +
    "      }\n" +
    "      [data-theme='dark'] .bg-purple-600 {\n" +
    "        background-color: #8b5cf6 !important;\n" +
    "      }\n" +
    "      [data-theme='dark'] .bg-green-50 {\n" +
    "        background-color: #064e3b !important;\n" +
    "      }\n" +
    "      [data-theme='dark'] .text-green-600 {\n" +
    "        color: #34d399 !important;\n" +
    "      }\n"
  );
}

// 6. Fix header flags correctly
content = content.replace(
  /<p className="text-\[10px\] text-gray-500 font-medium">Xitoydan to'g'ridan-to'g'ri 🇨🇳 🇺🇿<\/p>/,
  '<div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium mt-0.5">\n' +
  '            {tr("XTD")}\n' +
  '            <img src="https://flagcdn.com/w20/cn.png" srcSet="https://flagcdn.com/w40/cn.png 2x" alt="CN" className="w-4 h-auto shadow-sm rounded-sm" />\n' +
  '            <img src="https://flagcdn.com/w20/uz.png" srcSet="https://flagcdn.com/w40/uz.png 2x" alt="UZ" className="w-4 h-auto shadow-sm rounded-sm" />\n' +
  '          </div>'
);

fs.writeFileSync(FILE_PATH, content);
console.log('App translated and dark mode enabled successfully!');
