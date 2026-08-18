import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Initialize Gemini Client safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Route for AI Chatbot "Anh Mã"
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, labContext } = req.body;
    
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(200).json({
        reply: "⚠️ Khóa GEMINI_API_KEY chưa được cấu hình trong Secrets. Hãy bổ sung API key để trò chuyện trực tiếp với Anh Mã!\n\nTuy nhiên, bạn vẫn có thể thực hành tất cả các thí nghiệm hóa học tương tác 2D bình thường trên bàn thí nghiệm.",
      });
    }

    const systemInstruction = `Bạn là "Anh Mã" - Trợ lý Thí nghiệm Hóa học Ảo thông minh, vui vẻ, tận tình và am hiểu sâu sắc về hóa học phổ thông & chuyên sâu (tuân thủ nghiêm ngặt DANH PHÁP QUỐC TẾ IUPAC theo chương trình GDPT).

Nhiệm vụ của bạn:
1. LUÔN SỬ DỤNG DANH PHÁP QUỐC TẾ IUPAC chuẩn cho tất cả các chất hóa học (Ví dụ: Hydrochloric acid, Sulfuric acid, Nitric acid, Acetic acid, Sodium hydroxide, Calcium hydroxide, Barium hydroxide, Copper(II) sulfate, Iron(III) chloride, Calcium carbonate, Potassium permanganate, Silver nitrate, Sodium chloride, Hydrogen, Oxygen, Carbon dioxide, Chlorine, Sulfur dioxide, Phenolphthalein, etc.).
2. Khi viết công thức hóa học và phương trình phản ứng, BẮT BUỘC dùng chữ số chỉ số nguyên tử nhỏ nằm dưới dạng chỉ số dưới (Subscript) chuẩn Unicode (Ví dụ: H₂SO₄, CaCO₃, Ca(OH)₂, Fe₂O₃, CuSO₄, 2HCl + NaOH → NaCl + H₂O).
3. KHÔNG sử dụng ký tự lạ như @/, KHÔNG dùng ký hiệu LaTeX như $, \\text{}, \\ce{}, \\rightarrow. Dùng mũi tên "→" đơn giản và đẹp mắt.
4. Mỗi khi phát hiện hoặc được hỏi về một PHẢN ỨNG HÓA HỌC, bạn BẮT BUỘC trình bày cấu trúc 4 phần rõ ràng:
   - 🧪 **Phương trình phản ứng & Danh pháp IUPAC**
   - 👁️ **Hiện tượng thực tế quan sát được** (Màu sắc dung dịch, sủi bọt khí, xuất hiện kết tủa, tỏa/hấp thụ nhiệt)
   - 💡 **Giải thích bản chất hóa học** (Loại phản ứng, sự trao đổi ion/electron)
   - ⚠️ **Lưu ý an toàn thí nghiệm** (Thao tác đúng chuẩn, găng tay, kính bảo hộ)
5. Hướng dẫn học sinh thực hiện các bài thí nghiệm chuẩn độ (titration), điều chế khí, phân biệt hóa chất mất nhãn.
6. Trả lời bằng tiếng Việt thân thiện, rõ ràng, trình bày định dạng Markdown đẹp mắt.

Ngữ cảnh phòng thí nghiệm hiện tại:
${JSON.stringify(labContext || {}, null, 2)}`;

    // Format conversation history for Gemini
    const contents: any[] = [];
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }
    } else {
      contents.push({
        role: "user",
        parts: [{ text: "Hãy giới thiệu bản thân và phân tích phòng thí nghiệm hiện tại giúp em!" }],
      });
    }

    // Try model gemini-3.6-flash first, fallback to gemini-2.5-flash if needed
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
    } catch (modelErr: any) {
      console.warn("Gemini 3.6-flash API call failed, trying fallback:", modelErr?.message || modelErr);
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
      } catch (fallbackErr: any) {
        console.warn("Fallback model call also failed:", fallbackErr?.message || fallbackErr);
        return res.json({
          reply: "⚠️ **Hệ thống API Gemini đang chạm hạn mức truy cập tạm thời (Rate limit / Quota exceeded).**\n\n💡 *Anh Mã khuyên bạn:*\n- Vui lòng chờ 5-10 giây rồi gửi lại câu hỏi.\n- Bạn vẫn có thể thao tác thí nghiệm 2D (pha trộn, chuẩn độ, đun nóng, sục khí) mượt mà trên bàn thực hành!",
        });
      }
    }

    let rawReply = response.text || "Anh Mã chưa thể đưa ra câu trả lời lúc này. Bạn thử hỏi lại xem nhé!";
    
    // Clean reply of unwanted symbols and format formulas
    rawReply = rawReply
      .replace(/@\//g, '')
      .replace(/@/g, '')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\ce\{([^}]+)\}/g, '$1')
      .replace(/\\rightarrow/g, ' → ')
      .replace(/\$/g, '');

    return res.json({ reply: rawReply });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return res.status(200).json({
      reply: "⚠️ Anh Mã đang gặp gián đoạn kết nối tạm thời. Bạn hãy thử gửi lại câu hỏi hoặc tiếp tục thực hiện thí nghiệm trên bàn nhé!",
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🧪 Phòng Thí Nghiệm Hóa Học Ảo 2D đang chạy tại http://0.0.0.0:${PORT}`);
  });
}

startServer();
