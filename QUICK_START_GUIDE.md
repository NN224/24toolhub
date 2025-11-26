# 🚀 دليل البدء السريع - تطبيق المكتبات

## ⚡ البدء في 5 دقائق

### الخطوة 1: إضافة المكتبات الأساسية

#### 1. DOMPurify (الأمان)
```html
<!-- في index.html قبل </head> -->
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>
```

#### 2. LazyLoad (Performance)
```html
<!-- في index.html قبل </head> -->
<script src="https://cdn.jsdelivr.net/npm/vanilla-lazyload@17.8.3/dist/lazyload.min.js"></script>
```

#### 3. Notyf (Notifications)
```html
<!-- في index.html قبل </head> -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css">
<script src="https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js"></script>
```

---

### الخطوة 2: إنشاء ملفات التهيئة

#### `js/security.js`
```javascript
// DOMPurify wrapper
window.sanitize = (dirty) => {
  return DOMPurify.sanitize(dirty);
};
```

#### `js/lazyload-init.js`
```javascript
// LazyLoad initialization
document.addEventListener('DOMContentLoaded', () => {
  const lazyLoadInstance = new LazyLoad({
    elements_selector: '.lazy',
    threshold: 0
  });
});
```

#### `js/notifications.js`
```javascript
// Notyf initialization
const notyf = new Notyf({
  duration: 3000,
  position: { x: 'right', y: 'top' }
});

window.showNotification = (message, type = 'success') => {
  if (type === 'error') {
    notyf.error(message);
  } else if (type === 'warning') {
    notyf.open({ type: 'warning', message });
  } else {
    notyf.success(message);
  }
};
```

---

### الخطوة 3: التطبيق

1. استبدال `alert()` بـ `showNotification()`
2. إضافة `class="lazy"` للصور
3. استخدام `sanitize()` على user inputs

---

## 📋 Checklist سريع

- [ ] إضافة CDN links
- [ ] إنشاء ملفات init
- [ ] تطبيق على الموقع
- [ ] اختبار
- [ ] Deploy

---

**الوقت المتوقع**: 30-60 دقيقة للمرحلة 1

