# Babili OS — Master Documentation Structure

> هذا الملف هو نقطة الدخول الرئيسية لجميع وثائق بابلي.
>
> القاعدة:
> أي شخص يدخل المشروع يجب أن يبدأ من هنا.

---

# 1. Core Vision Layer

هذه الطبقة تشرح:
- لماذا يوجد بابلي؟
- ما هي فلسفته؟
- ما الذي يحاول تغييره عالميًا؟

## الملفات

### vision-and-identity.md
الرؤية الأساسية وهوية بابلي.

### core-product-principles.md
القواعد الفكرية والاستراتيجية الثابتة للمشروع.

### system-boundaries.md
ما الذي يدخل ضمن بابلي وما الذي لا يدخل ضمن نطاق المشروع.

### architecture-decision-records.md
القرارات المعمارية الرسمية وأسبابها.

---

# 2. Product Strategy Layer

هذه الطبقة تشرح:
- كيف سيتحول بابلي من فكرة إلى نظام عالمي.

## الملفات

### product-roadmap.md
خارطة الطريق من MVP حتى النظام العالمي للطعام.

### todo-roadmap.md
قائمة المهام الرسمية للمشروع.

### project-management-additions.md
قواعد إدارة المنتج والمراحل والأولويات.

---

# 3. Product Architecture Layer

> هذه الطبقة سيتم بناؤها لاحقًا.

ستشمل:

- Product Architecture
- Domain Architecture
- Services Architecture
- API Contracts
- Event Flows
- Database Design
- Multi-tenant Strategy
- Translation Engine
- Search Architecture
- Payment Architecture

---

# 4. Frontend Layer

ستشمل:

- Public Platform
- Restaurant Dashboard
- Admin Dashboard
- Design System
- UX Rules
- Accessibility
- RTL

---

# 5. Backend Layer

ستشمل:

- Auth Service
- Restaurant Service
- Order Service
- Translation Service
- API Gateway
- Notification Service
- Search Service

---

# 6. Infrastructure Layer

ستشمل:

- Docker
- CI/CD
- Coolify
- Monitoring
- Logging
- Scaling
- Backup
- Disaster Recovery

---

# 7. Security Layer

ستشمل:

- Authentication
- Authorization
- OWASP
- Hardening
- Audit Logs
- Secrets Management
- Threat Modeling

---

# 8. AI & Intelligence Layer

ستشمل:

- AI Translation
- Smart Recommendations
- Discovery Intelligence
- AI Moderation
- Food Graph Intelligence

---

# 9. Social & Discovery Layer

ستشمل:

- Reviews
- Profiles
- Followers
- Food Feed
- Cities
- Trending
- Reputation System

---

# 10. Business Layer

ستشمل:

- Pricing
- Monetization
- Investor Strategy
- Restaurant Growth
- Expansion Strategy
- Legal & Compliance

---

# Documentation Navigation Rule

أي وثيقة جديدة يجب أن:

1. تُربط داخل هذا الملف
2. تُربط بالطبقة المناسبة
3. تحتوي على سبب وجودها
4. لا تكون معزولة عن بقية النظام

---

# Core Rule

بابلي ليس مجموعة Features.

بابلي:

> نظام عالمي مترابط للطعام.

لذلك:
- كل وثيقة يجب أن تخدم الرؤية
- كل قرار يجب أن يخدم النظام
- كل Feature يجب أن ترتبط بالـ Ecosystem
