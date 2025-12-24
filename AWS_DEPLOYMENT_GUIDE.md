# دليل نشر Market Basha على AWS Lightsail (Ubuntu) + RDS

## 💰 التكاليف المتوقعة

| الخدمة | المواصفات | التكلفة |
|--------|-----------|---------|
| Lightsail Instance | Ubuntu 22.04, 1GB RAM | $5/شهر |
| **Amazon RDS** | PostgreSQL, db.t3.micro | $15-20/شهر |
| S3 (للصور) | 10GB | $0.50/شهر |
| **الإجمالي** | | **~$21-26/شهر** |

---

## 📋 الخطوة 1: إنشاء Instance

1. اذهب إلى [AWS Lightsail Console](https://lightsail.aws.amazon.com)
2. اضغط **Create instance**
3. اختر:
   ```
   Platform: Linux/Unix
   Blueprint: OS Only → Ubuntu 22.04 LTS
   Instance plan: $5 (1GB RAM, 1 vCPU, 40GB SSD)
   Instance name: market-basha
   ```
4. اضغط **Create instance**
5. انتظر حتى يصبح الـ Status: Running

---

## 📋 الخطوة 2: إنشاء Amazon RDS Database

1. اذهب إلى [AWS RDS Console](https://console.aws.amazon.com/rds)
2. اضغط **Create database**
3. اختر:
   ```
   Creation method: Standard create
   Engine: PostgreSQL
   Engine Version: PostgreSQL 15
   Templates: Free tier (أو Production)
   
   DB instance identifier: market-basha-db
   Master username: postgres
   Master password: [كلمة مرور قوية - احفظها!]
   
   Instance configuration:
   - DB instance class: db.t3.micro (Free tier)
   
   Storage:
   - Storage type: gp3
   - Allocated storage: 20 GB
   
   Connectivity:
   - VPC: Default
   - Public access: Yes (للتطوير) أو No (للإنتاج)
   - VPC security group: Create new
   - Security group name: market-basha-rds-sg
   
   Database authentication: Password authentication
   
   Additional configuration:
   - Initial database name: market_basha
   ```
4. اضغط **Create database**
5. انتظر حتى يصبح Status: Available (5-10 دقائق)
6. **احفظ هذه البيانات:**
   - Endpoint: `market-basha-db.xxxxx.region.rds.amazonaws.com`
   - Port: `5432`
   - Password: الذي أدخلته

### إعداد Security Group للـ RDS:
1. في RDS → اختر قاعدة البيانات → **Connectivity & security**
2. اضغط على Security group
3. **Inbound rules** → **Edit** → **Add rule**:
   ```
   Type: PostgreSQL
   Port: 5432
   Source: 0.0.0.0/0 (للتطوير) أو IP السيرفر فقط (للإنتاج)
   ```

---

## 📋 الخطوة 3: إنشاء S3 Bucket

1. اذهب إلى [AWS S3 Console](https://s3.console.aws.amazon.com)
2. **Create bucket**:
   - Name: `market-basha-uploads`
   - Region: اختر الأقرب
   - Uncheck "Block all public access"
3. بعد الإنشاء → **Permissions** → **CORS**:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

4. **إنشاء IAM User** للوصول:
   - IAM → Users → Create user
   - Attach policy: `AmazonS3FullAccess`
   - **احفظ Access Key ID و Secret**

---

## 🔥 الخطوة 4: إعداد Firebase

### ⚠️ مهم جداً: ملف Service Account

**لا تضف ملف JSON للمشروع!** بدلاً من ذلك:

1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. أنشئ مشروع جديد أو اختر موجود
3. **Project Settings** → **Service Accounts**
4. اضغط **Generate new private key**
5. سيُنزّل ملف JSON، افتحه واحذف الأسطر الجديدة ليصبح سطر واحد:

**من هذا:**
```json
{
  "type": "service_account",
  "project_id": "your-project",
  ...
}
```

**إلى هذا (سطر واحد):**
```
{"type":"service_account","project_id":"your-project","private_key_id":"xxx",...}
```

6. **Cloud Messaging** → احصل على VAPID Key

---

## 📋 الخطوة 5: الاتصال بالسيرفر

```bash
# من Lightsail Console → Connect → SSH
# أو من Terminal:
ssh -i LightsailDefaultKey.pem ubuntu@YOUR_IP
```

---

## 📋 الخطوة 6: تثبيت البرامج (Ubuntu)

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# التحقق
node -v  # v20.x.x
npm -v   # 10.x.x

# تثبيت Git
sudo apt install git -y

# تثبيت PM2
sudo npm install -g pm2
```

---

## 📋 الخطوة 7: نسخ المشروع

```bash
# الذهاب للمجلد
cd /home/ubuntu

# Clone المشروع
git clone https://github.com/YOUR_USERNAME/market-basha.git
cd market-basha

# تثبيت التبعيات
npm install
```

---

## 📋 الخطوة 8: إعداد Environment Variables

```bash
# إنشاء ملف .env
nano .env
```

**الصق هذا المحتوى وعدّل القيم:**

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_DB_PASSWORD@YOUR_DB_ENDPOINT:5432/market_basha"

# Authentication
JWT_SECRET="انشئ-نص-عشوائي-طويل-جدا-32-حرف-على-الأقل-random123456789"
JWT_EXPIRES_IN="90d"

# AWS S3
AWS_ACCESS_KEY_ID="AKIAXXXXXXXXXX"
AWS_SECRET_ACCESS_KEY="xxxxxxxxxxxxxxxxxxxxxxxx"
AWS_REGION="eu-west-1"
AWS_S3_BUCKET="market-basha-uploads"

# Firebase (من خطوة 4)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaXXXXXXXXXXXXX"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abc123"
NEXT_PUBLIC_FIREBASE_VAPID_KEY="BLxxxxxxxxxxxxxxxxxx"

# Firebase Service Account (سطر واحد!)
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"xxx","private_key_id":"xxx","private_key":"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n","client_email":"xxx@xxx.iam.gserviceaccount.com",...}'

# App URL (غيّره للدومين لاحقاً)
NEXT_PUBLIC_APP_URL="http://YOUR_LIGHTSAIL_IP:3000"
```

**احفظ:** `Ctrl+O` → `Enter` → `Ctrl+X`

---

## 📋 الخطوة 9: إعداد قاعدة البيانات

```bash
# تطبيق الـ Schema
npx prisma db push

# (اختياري) إنشاء Admin أول
npx prisma db seed
```

---

## 📋 الخطوة 10: بناء وتشغيل

```bash
# بناء التطبيق
npm run build

# تشغيل بـ PM2
pm2 start npm --name "market-basha" -- start

# التشغيل التلقائي عند إعادة التشغيل
pm2 startup
pm2 save

# عرض الحالة
pm2 status
```

---

## 📋 الخطوة 11: فتح Port

1. في Lightsail → **Networking**
2. **Add rule**:
   - Application: Custom
   - Protocol: TCP
   - Port: 3000

الآن يمكنك الوصول: `http://YOUR_IP:3000`

---

## 📋 الخطوة 12: إعداد Nginx + SSL (اختياري)

```bash
# تثبيت Nginx
sudo apt install nginx -y

# إنشاء config
sudo nano /etc/nginx/sites-available/market-basha
```

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# تفعيل
sudo ln -s /etc/nginx/sites-available/market-basha /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL مجاني
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d YOUR_DOMAIN.com
```

---

## 🔧 أوامر مفيدة

```bash
# عرض الـ logs
pm2 logs market-basha

# إعادة تشغيل
pm2 restart market-basha

# تحديث الكود
cd /home/ubuntu/market-basha
git pull
npm install
npm run build
pm2 restart market-basha
```

---

## ✅ قائمة التحقق

- [ ] إنشاء Lightsail Instance (Ubuntu)
- [ ] إنشاء Lightsail Database
- [ ] إنشاء S3 Bucket + IAM User
- [ ] إعداد Firebase + Service Account
- [ ] تثبيت Node.js + Git + PM2
- [ ] Clone المشروع
- [ ] إعداد .env
- [ ] `npx prisma db push`
- [ ] `npm run build`
- [ ] تشغيل بـ PM2
- [ ] فتح Port 3000
- [ ] (اختياري) Nginx + SSL
