# Trình Giả Lập An Toàn Phòng Thí Nghiệm (Lab Safety Simulator)

Đây là một ứng dụng web tương tác (mini-game) được thiết kế nhằm mục đích giáo dục, giúp học sinh làm quen và nắm vững các quy tắc an toàn trong phòng thí nghiệm hóa học/sinh học thông qua các trải nghiệm thực hành ảo.

## 🎮 Các Màn Chơi (Stages)

Trò chơi được chia làm 4 nhiệm vụ chính, mô phỏng các quy trình an toàn thực tế:

1. **Nhiệm vụ 1: Chuẩn bị PPE (Personal Protective Equipment)**
   - **Mục tiêu:** Trang bị đầy đủ đồ bảo hộ cá nhân trước khi vào phòng lab.
   - **Cách chơi:** Kéo thả các vật phẩm bảo hộ (Áo blouse, Kính bảo hộ, Găng tay, Giày, Mũ, Khẩu trang) vào nhân vật.

2. **Nhiệm vụ 2: Pha chế Axit**
   - **Mục tiêu:** Nắm vững nguyên tắc pha loãng axit an toàn.
   - **Cách chơi:** Kéo bình Axit rót vào cốc Nước. Tuyệt đối tuân thủ quy tắc "Luôn rót từ từ Axit vào Nước, KHÔNG LÀM NGƯỢC LẠI".

3. **Nhiệm vụ 3: Phân Loại Rác Thải**
   - **Mục tiêu:** Phân loại đúng các loại rác thải trong phòng thí nghiệm để bảo vệ môi trường và tránh rủi ro lây nhiễm/hóa chất.
   - **Cách chơi:** Kéo thả các vật phẩm rác vào đúng thùng:
     - 🔴 **Thùng Đỏ:** Rác sắc nhọn (kim tiêm, mảnh vỡ thủy tinh...)
     - 🟠 **Thùng Cam:** Rác hóa chất độc hại.
     - 🟢 **Thùng Xanh:** Rác sinh hoạt thông thường.

4. **Nhiệm vụ 4: Giải Mã Ký Hiệu GHS**
   - **Mục tiêu:** Nhận biết các biểu tượng cảnh báo nguy hiểm hóa chất toàn cầu (GHS).
   - **Cách chơi:** Chọn và ghép đúng 8 cặp thẻ bài bao gồm Hình ảnh biểu tượng và Ý nghĩa tương ứng (Ví dụ: 💥 - Chất nổ, 💀 - Độc tính).

## 🛠 Công Nghệ Sử Dụng

- **Frontend Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Game Engine (Mô phỏng 2.5D):** Vanilla JavaScript + HTML5 Canvas (tại `public/safety_gate.html`)
- **Icons:** Lucide Icons

## 🚀 Cài Đặt & Khởi Chạy (Dành cho Developer)

Đảm bảo bạn đã cài đặt Node.js trên máy tính của mình.

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Khởi chạy môi trường phát triển (Dev Server):**
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại `http://localhost:3000`

3. **Build bản Production:**
   ```bash
   npm run build
   ```

## 📁 Cấu Trúc Thư Mục Chính

- `/public/safety_gate.html`: Chứa core logic game và engine dựng hình Canvas 2.5D cho 4 màn chơi.
- `/src/`: Chứa mã nguồn React (giao diện bọc ngoài, route, logic của các trang khác).
- `/src/index.css`: Cấu hình Tailwind.

## 🤝 Đóng Góp
Mọi đóng góp nhằm cải thiện đồ họa, thêm màn chơi mới hoặc tối ưu hóa hiệu suất trò chơi đều được chào đón. Vui lòng tạo Pull Request hoặc Mở Issue trên kho lưu trữ (Repository).
