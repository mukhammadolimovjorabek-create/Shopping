const fs = require('fs');
const FILE_PATH = './src/app/page.js';
let content = fs.readFileSync(FILE_PATH, 'utf8');

// 1. Add states
if (!content.includes('const [profileAvatar, setProfileAvatar]')) {
  content = content.replace(
    /const \[hasOnboarded, setHasOnboarded\] = useState\(true\);/,
    "const [hasOnboarded, setHasOnboarded] = useState(true);\n  const [profileName, setProfileName] = useState('Foydalanuvchi');\n  const [profileAvatar, setProfileAvatar] = useState(null);"
  );
}

// 2. Add handlers
if (!content.includes('const handleProfileSave = () => {')) {
  content = content.replace(
    /if \(checkoutSuccess\) {/,
    "const handleProfileSave = () => {\n    if (tgUser) {\n      localStorage.setItem(`omni_name_${tgUser.id}`, newProfileName);\n    }\n    setProfileName(newProfileName);\n    setIsEditingProfile(false);\n  };\n\n  const handleAvatarUpload = async (e) => {\n    const file = e.target.files[0];\n    if (!file) return;\n    try {\n      const fileExt = file.name.split('.').pop();\n      const fileName = `avatar_${Math.random()}.${fileExt}`;\n      const { data, error } = await supabase.storage.from('product_images').upload(fileName, file);\n      if (error) throw error;\n      const { data: publicUrlData } = supabase.storage.from('product_images').getPublicUrl(fileName);\n      const url = publicUrlData.publicUrl;\n      if (url && tgUser) {\n        localStorage.setItem(`omni_avatar_${tgUser.id}`, url);\n        setProfileAvatar(url);\n      }\n    } catch (e) {\n      alert(\"Rasm yuklashda xatolik yuz berdi.\");\n    }\n  };\n\n  if (checkoutSuccess) {"
  );
}

// 3. Add backgrounds and data-theme to main return
if (!content.includes('const getBgClass = () => {')) {
  content = content.replace(
    /return \(\n    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-gray-50 to-orange-50 text-gray-900 font-sans overflow-hidden relative">/,
    "const getBgClass = () => {\n    if (activeTab === 'home') return 'bg-[url(\"https://www.transparenttextures.com/patterns/cubes.png\")] bg-gradient-to-br from-purple-50 via-gray-50 to-orange-50';\n    if (activeTab === 'cart') return 'bg-[url(\"https://www.transparenttextures.com/patterns/diagonal-stripes.png\")] bg-gradient-to-tr from-blue-50 to-purple-50';\n    if (activeTab === 'profile') return 'bg-[url(\"https://www.transparenttextures.com/patterns/stardust.png\")] bg-gradient-to-bl from-orange-50 to-red-50';\n    return 'bg-gradient-to-br from-purple-50 via-gray-50 to-orange-50';\n  };\n\n  return (\n    <div data-theme={theme} className={`omni-app flex flex-col h-screen text-gray-900 font-sans overflow-hidden relative ${getBgClass()} bg-fixed`}>"
  );
}

fs.writeFileSync(FILE_PATH, content);
console.log('Fixes applied successfully!');
