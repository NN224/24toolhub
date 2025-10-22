# 📚 كيف تضيف مقالات جديدة - How to Add New Blog Articles

## 🇸🇦 الطريقة بالعربي

### الخطوات:

1. **انسخ القالب:**
   - افتح ملف `article-template.html`
   - انسخ كل المحتوى

2. **أنشئ مقال جديد:**
   - سوي ملف جديد في مجلد `blog/`
   - مثلاً: `blog/your-article-title.html`
   - الصق المحتوى اللي نسخته

3. **غيّر المعلومات الأساسية:**
   في بداية الملف، غيّر هذي الأشياء:
   
   ```html
   <title>[ARTICLE_TITLE] | 24ToolHub Blog</title>
   <meta name="description" content="[ARTICLE_DESCRIPTION]">
   <meta name="keywords" content="[KEYWORDS]">
   ```
   
   مثال:
   ```html
   <title>How to Convert Images to WebP Format | 24ToolHub Blog</title>
   <meta name="description" content="Learn how to convert images to WebP format for faster websites">
   <meta name="keywords" content="webp converter, image conversion, webp format">
   ```

4. **غيّر محتوى المقال:**
   
   ابحث عن السطر:
   ```html
   <!-- START YOUR CONTENT HERE -->
   ```
   
   وابدأ تكتب محتواك:
   ```html
   <h2>المقدمة</h2>
   <p>اكتب مقدمتك هنا...</p>

   <h2>القسم الأول</h2>
   <p>اكتب محتواك...</p>

   <h3>نقطة فرعية</h3>
   <ul>
       <li>نقطة 1</li>
       <li>نقطة 2</li>
   </ul>
   ```

5. **غيّر الأدوات المرتبطة:**
   
   في آخر المقال، حط روابط للأدوات المتعلقة:
   ```html
   <div class="related-tools">
       <h3>🔧 Related Tools:</h3>
       <a href="../tools/your-tool-1.html">→ Tool Name 1</a>
       <a href="../tools/your-tool-2.html">→ Tool Name 2</a>
   </div>
   ```

6. **حدّث صفحة Blog الرئيسية:**
   
   افتح `blog/index.html` وضيف بطاقة للمقال الجديد:
   ```html
   <article class="blog-card">
       <img src="../images/og-image.jpg" alt="Your Article" class="blog-card-image">
       <div class="blog-card-content">
           <div class="blog-card-meta">
               <span>📅 Oct 25, 2025</span>
               <span>⏱️ 5 min read</span>
           </div>
           <h2>Your Article Title</h2>
           <p>Short description...</p>
           <a href="./your-article-title.html" class="blog-card-link">Read More →</a>
       </div>
   </article>
   ```

7. **حدّث Sitemap:**
   
   افتح `sitemap.xml` وضيف:
   ```xml
   <url>
     <loc>https://24toolhub.com/blog/your-article-title.html</loc>
     <lastmod>2025-10-25</lastmod>
     <changefreq>monthly</changefreq>
     <priority>0.8</priority>
   </url>
   ```

8. **ابعث لي المحتوى:**
   - ابعثلي عنوان المقال
   - الوصف القصير
   - المحتوى الكامل
   - وأنا راح أسوي كل شي! 🚀

---

## 🇬🇧 English Instructions

### Quick Steps:

1. Copy `article-template.html`
2. Create new file: `blog/your-article-name.html`
3. Replace placeholders:
   - `[ARTICLE_TITLE]`
   - `[ARTICLE_DESCRIPTION]`
   - `[KEYWORDS]`
   - `[PUBLISH_DATE]`
   - Content between `<!-- START YOUR CONTENT HERE -->`
4. Update `blog/index.html` with new article card
5. Update `sitemap.xml` with new article URL

### OR Simply Send Me:
- Article title
- Short description
- Full content
- And I'll handle everything! 🎯

---

## 📝 نصائح لكتابة مقالات ناجحة:

1. **العنوان:** استخدم "How to" أو "Guide" - محبوبة في جوجل
2. **الطول:** 1500-2500 كلمة مثالي
3. **الصور:** حط صور توضيحية
4. **الأمثلة:** حط أمثلة حقيقية
5. **الروابط:** اربط مع الأدوات المتعلقة
6. **Keywords:** استخدم الكلمات المفتاحية بشكل طبيعي
