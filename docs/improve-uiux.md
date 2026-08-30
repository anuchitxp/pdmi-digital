# แนะนำการปรับปรุง UI/UX สำหรับ PDMI

--

## 1. เปลี่ยน Layout เป็นแบบ Card-based Grid

แทนที่จะแสดงข้อมูลเรียงเป็นรายการแนวตั้ง ให้ใช้ **Card Grid** ที่每组ข้อมูลมี Card ของตัวเอง พร้อมไอคอนและสีที่แตกต่างกัน

```css
/* ตัวอย่างโครงสร้าง Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
```

---

## 2. ใช้สีและไอคอนเพื่อสื่อความหมาย

- **Patients** → ไอคอนผู้ป่วย สีน้ำเงินหลัก
- **LDL-C at goal** → ไอคอนหัวใจ สีแดง/ส้ม
- **BP at goal** → ไอคอนความดัน สีเขียว
- **HbA1c at goal** → ไอคอนน้ำตาล สีม่วง

ตัวอย่างการใช้สีตามสถานะ (goal achievement) แทนที่จะเป็นสีเดียวกันทั้งหมด:

```css
.stat-card .value {
  font-size: 2.4rem;
  font-weight: 700;
}

.stat-card .sub {
  font-size: 0.9rem;
  color: #6b7280;
}

/* สีตามเป้าหมาย */
.goal-high { color: #10b981; }   /* 67%+ */
.goal-medium { color: #f59e0b; } /* 40-66% */
.goal-low { color: #ef4444; }    /* <40% */
```

---

## 3. เพิ่ม Progress Bar หรือ Circular Gauge

แทนที่จะแสดงแค่เปอร์เซ็นต์ตัวเลข ให้ใช้ **วงกลมแบบ Gauge** หรือ **Progress Bar** แบบเส้น เพื่อให้เห็นภาพความใกล้เคียงเป้าหมายได้ง่ายขึ้น

```html
<!-- ตัวอย่าง Circular Gauge อย่างง่ายด้วย SVG -->
<div class="gauge">
  <svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" stroke-width="10"/>
    <circle cx="60" cy="60" r="50" fill="none" stroke="#4d6bfe" stroke-width="10"
            stroke-dasharray="314" stroke-dashoffset="157" stroke-linecap="round"
            transform="rotate(-90 60 60)"/>
    <text x="60" y="60" text-anchor="middle" dy="0.3em" font-size="24" font-weight="bold">50%</text>
  </svg>
</div>
```

---

## 4. จัดกลุ่ม "Overdue follow-ups" ให้เป็น Alert Banner

แทนที่จะเป็นข้อความเล็ก ๆ ที่ด้านล่าง ให้ใช้ **Banner แบบมีสี** พร้อมไอคอนเตือน ถ้าไม่มีรายการค้าง ก็แสดงข้อความแบบ Positive ด้วยสีเขียว

```html
<div class="alert alert-success">
  <span class="icon">✅</span>
  No overdue follow-ups — ทุกอย่างเป็นไปตามแผน
</div>
```

---

## 5. ปรับ Typography และ Spacing

- ใช้ **font-family** สมัยใหม่ เช่น `Inter`, `SF Pro`, หรือ `Poppins`
- เพิ่ม **letter-spacing** เล็กน้อยให้ตัวเลขดูโดดเด่น
- ใช้ **ขนาดตัวอักษรแบบ Hierarchy**: ค่าใหญ่สุด (ตัวเลข), รองลงมา (ชื่อเมตริก), เล็กสุด (คำอธิบายเพิ่มเติม)

```css
body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: #f8fafc;
  color: #111827;
}

.stat-card .value {
  font-size: 2.8rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.stat-card .label {
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
}
```

---

## 6. เพิ่ม Micro-interactions

- **Hover effect** บน Card (ยกขึ้นเล็กน้อย + เงา)
- **Smooth transition** เมื่อโหลดข้อมูล (fade-in)
- **Tooltip** เมื่อชี้ไปที่ค่าเปอร์เซ็นต์ แสดงรายละเอียดเพิ่มเติม (เช่น จำนวนผู้ป่วยที่วัดทั้งหมด)

---

## 7. ใช้ Dark Mode หรือ Light Mode ที่ปรับได้

ให้ผู้ใช้สามารถสลับธีมได้ โดยใช้ CSS Variables:

```css
:root {
  --bg: #ffffff;
  --card-bg: #f9fafb;
  --text: #111827;
}

[data-theme="dark"] {
  --bg: #0f172a;
  --card-bg: #1e293b;
  --text: #f1f5f9;
}
```

---

## 8. จัดเรียงข้อมูลตามความสำคัญ

- **Patients (active)** ควรเป็น Card ใหญ่ที่สุด หรืออยู่บนสุด
- กลุ่ม "At goal" ควรเรียงตามลำดับความสำคัญทางคลินิก (LDL-C → BP → HbA1c)
- เพิ่ม **Mini Chart** แนวโน้ม (trend) ข้างใต้ค่าแต่ละตัว ถ้ามีข้อมูลย้อนหลัง

---

## 9. ปรับให้ Responsive

ใช้ CSS Grid + Flexbox เพื่อให้แดชบอร์ดใช้งานได้ดีทั้งบน Desktop, Tablet และ Mobile

```css
@media (max-width: 640px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .stat-card .value {
    font-size: 2rem;
  }
}
```

--
