#!/bin/bash
echo "=== 24 Tool Hub Upload Script ==="
echo "1. إنشاء ريبو جديد على github.com"
echo "2. نسخ الملفات من المجلد الحالي"
echo ""

# إضافة remote جديد
echo "أدخل رابط الريبو الجديد (مثل: https://github.com/username/24toolhub.git):"
read repo_url

git init
git add .
git commit -m "Initial commit: Complete 24 Tool Hub project"
git remote add origin $repo_url
git branch -M main
git push -u origin main

echo "✅ تم رفع المشروع بنجاح!"
