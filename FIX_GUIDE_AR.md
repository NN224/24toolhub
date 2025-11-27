# دليل تشغيل وإصلاح الأدوات

لقد قمت بفحص الكود ووجدت أن جميع الأدوات تم إصلاحها برمجياً، ولكنها تحتاج إلى **إعدادات البيئة** لتعمل بشكل صحيح.

## 1. المشكلة: الأدوات التي تحتاج مفاتيح API

الأدوات التالية لن تعمل (أو ستعمل بشكل محدود) إذا لم تقم بإعداد المفاتيح:

| الأداة | المفتاح المطلوب | أين تجده؟ |
|--------|------------------|-----------|
| **Website Speed Test** | `PAGESPEED_API_KEY` | [Google PageSpeed API](https://developers.google.com/speed/docs/insights/v5/get-started) |
| **Currency Converter** | `EXCHANGE_RATE_API_KEY` | [ExchangeRate-API](https://www.exchangerate-api.com/) |
| **Chatbot** | `GEMINI_API_KEY` | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| **IP Lookup / My IP** | `APIIP_KEY` | [APIIP.net](https://apiip.net/) (اختياري - يوجد بدائل مجانية) |

## 2. كيفية الحل (خطوة بخطوة)

### إذا كنت تعمل محلياً (Localhost):
1. قم بإنشاء ملف جديد باسم `.env` في المجلد الرئيسي.
2. انسخ محتوى الملف `.env.example` إلى `.env`.
3. استبدل القيم (مثل `your_key_here`) بمفاتيحك الحقيقية.
4. أعد تشغيل السيرفر: `npm start`.

### إذا كنت تستخدم Vercel:
1. اذهب إلى إعدادات المشروع في Vercel > **Settings**.
2. اختر **Environment Variables**.
3. أضف المفاتيح بنفس الأسماء المذكورة أعلاه.
4. أعد نشر المشروع (Redeploy).

## 3. حالة الأدوات الأخرى

- **QR Scanner**: يعمل بشكل كامل، لكن تأكد من السماح للكاميرا في المتصفح، واستخدم `https` وليس `http`.
- **Ping Test**: يعمل، ولكن يتطلب أن يكون السيرفر قيد التشغيل (`npm start`).
- **Workout Tracker**: يعمل ويحفظ البيانات في المتصفح (Local Storage).
- **Statistics Calculator**: يعمل بشكل كامل.
- **What is My IP**: تم تحديثه ليعمل عبر السيرفر لضمان الأمان ودقة النتائج.

## 4. اختبار السيرفر

تأكد من أن السيرفر يعمل عن طريق زيارة هذه الروابط في متصفحك:
- `http://localhost:5000/ping?host=google.com` (يجب أن يعود بنتيجة JSON)
- `http://localhost:5000/api-status` (للتحقق من حالة AI)
- `http://localhost:5000/ip-info` (للتحقق من خدمة IP)

إذا ظهرت لك أخطاء في هذه الروابط، فهذا يعني أن السيرفر لا يعمل بشكل صحيح.
