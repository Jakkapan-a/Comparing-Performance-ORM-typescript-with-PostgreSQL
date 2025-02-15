# ใช้ Node.js Alpine ที่มีขนาดเล็ก
FROM node:22.14.0-alpine3.20

# ตั้งค่า Working Directory
WORKDIR /app

# คัดลอกไฟล์ package.json และติดตั้ง Dependencies
COPY package.json /app
RUN npm install

# คัดลอกไฟล์โปรเจคทั้งหมด
COPY . /app

# ตั้งค่าให้ Container รันตลอดเวลา
CMD ["tail", "-f", "/dev/null"]