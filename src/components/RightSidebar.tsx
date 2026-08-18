import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { EquipmentInstance } from '../types/chemistry';
import { CHEMICAL_REACTIONS } from '../engine/ChemicalDatabase';
import { formatChemicalText } from '../utils/chemicalFormatter';
import { HippoIcon } from './HippoIcon';
import {
  Send,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface RightSidebarProps {
  equipments: EquipmentInstance[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

function generateLocalReactionExplanation(prompt: string, equipments: EquipmentInstance[]): string | null {
  const isExp4 = equipments.some(
    (e) => e.name.includes('CaCO3') || e.name.includes('NaHCO3') || e.name.includes('CO2') || e.isCo2Collector
  );

  if (isExp4) {
    return `🧪 **[ANH MÃ PHÂN TÍCH THÍ NGHIỆM ĐIỀU CHẾ & LÀM KHÔ KHÍ CO₂]**

### PHẦN 1: Quy Trình Chi Tiết Thí Nghiệm (Sơ Đồ Hình 1)

#### 1. Phương Trình Hóa Học Trong Hệ Thống
- **Tại bình phản ứng (Bình tam giác):**
  \`CaCO₃ (r) + 2HCl (dd) → CaCl₂ (dd) + CO₂↑ (k) + H₂O (l)\`
- **Tại Bình rửa 1 (Hấp thụ hơi HCl dư - Dung dịch NaHCO₃ bão hòa):**
  *(Chứa dung dịch NaHCO₃ bão hòa để giữ lại khí HCl bay hơi theo mà không làm thất thoát CO₂)*
  \`HCl + NaHCO₃ → NaCl + CO₂↑ + H₂O\`
- **Tại Bình rửa 2 (Làm khô khí CO₂ - Dung dịch H₂SO₄ đặc):**
  Dung dịch H₂SO₄ đặc có tính háo nước cao sẽ hấp thụ hoàn toàn hơi nước (H₂O) đi qua, thu được khí CO₂ khô tinh khiết.

#### 2. Vai Trò Của Từng Dụng Cụ Trong Sơ Đồ
- **Bình tam giác + Phễu nhỏ giọt:** Nơi xảy ra phản ứng điều chế khí CO₂ từ đá vôi và axit.
- **Bình rửa 1 (Chứa dung dịch NaHCO₃ bão hòa):** Giữ lại hơi axit HCl bị cuốn theo dòng khí.
- **Bình rửa 2 (Chứa dung dịch H₂SO₄ đặc):** Giữ lại hơi nước, làm khô dòng khí.
- **Bình thu khí (Bình cầu đặt ngửa):** Thu khí CO₂ khô bằng phương pháp dời chỗ không khí (đặt ngửa bình vì CO₂ nặng hơn không khí, M_CO₂ = 44 g/mol > 29 g/mol).

#### 3. Quy Trình Vận Hành & Hiệu Ứng Quan Sát

| Thao tác / Vị trí | Hiện tượng quan sát | Bản chất khoa học & Hiệu ứng 2D |
| :--- | :--- | :--- |
| **1. Mở khóa phễu nhỏ giọt** | Dung dịch HCl chảy từng giọt xuống bình tam giác chứa các viên đá vôi CaCO₃. | Kích hoạt phản ứng. Bề mặt đá vôi sủi bọt khí mãnh liệt, đá vôi tan dần. |
| **2. Khí đi qua Bình 1** | Dòng khí sục qua dung dịch NaHCO₃ bão hòa, xuất hiện bọt khí liên tục. | Hơi HCl bị giữ lại hoàn toàn. Dòng khí thoát ra khỏi Bình 1 là CO₂ ẩm và tinh khiết hơn. |
| **3. Khí đi qua Bình 2** | Dòng khí tiếp tục sục qua dung dịch H₂SO₄ đặc. | H₂SO₄ đặc giữ lại toàn bộ hơi nước. Khí thoát ra là CO₂ khô. |
| **4. Thu khí tại Bình cầu** | Khí CO₂ chìm xuống đáy bình cầu và dâng dần lên, đẩy không khí ra ngoài. | Thu thành công khí CO₂ khô. Đưa bông/nút bịt nhẹ miệng bình để giữ khí. |`;
  }

  const rxnEq = equipments.find((eq) => eq.content.lastReactionMarkdown && eq.content.lastReactionMarkdown.trim() !== '');
  const rxnMarkdown = rxnEq?.content.lastReactionMarkdown;

  const matchedRule = rxnMarkdown
    ? CHEMICAL_REACTIONS.find(
        (r) =>
          r.equationMarkdown === rxnMarkdown ||
          r.name === rxnMarkdown ||
          r.id === rxnMarkdown ||
          rxnMarkdown.includes(r.id) ||
          r.equationMarkdown.replace(/\s+/g, '') === rxnMarkdown.replace(/\s+/g, '')
      )
    : CHEMICAL_REACTIONS.find((r) =>
        r.reactants.every((rec) =>
          equipments.some(
            (eq) =>
              eq.content.speciesMoles[rec.formula] > 0.00001 ||
              eq.content.precipitates.some((p) => p.formula === rec.formula)
          )
        )
      );

  if (matchedRule) {
    const bubbleInfo = matchedRule.eventTriggers?.bubbleEffect
      ? `- **Sủi bọt khí:** Giải phóng khí **${matchedRule.eventTriggers.bubbleEffect.gasName}** (${matchedRule.eventTriggers.bubbleEffect.gasFormula}) thoát ra mạnh mẽ.`
      : '';
    const colorInfo = matchedRule.eventTriggers?.colorTransition
      ? `- **Đổi màu dung dịch:** Dung dịch chuyển màu đặc trưng.`
      : '';
    const heatInfo = matchedRule.eventTriggers?.heatEffect
      ? `- **Tỏa nhiệt:** Tỏa nhiệt lượng làm ấm dụng cụ thí nghiệm.`
      : '';

    return `🧪 **[ANH MÃ PHÂN TÍCH PHẢN ỨNG HÓA HỌC]**

📌 **1. Phương trình phản ứng (Chuẩn IUPAC):**
**${matchedRule.equationMarkdown}**

👁️ **2. Hiện tượng thực tế quan sát được:**
- ${matchedRule.description}
${bubbleInfo}
${colorInfo}
${heatInfo}

💡 **3. Bản chất hóa học & Động học:**
Các chất tham gia va chạm ion/phân tử và tiêu thụ theo tỉ lệ số mol tối ưu. Thời gian hoàn thành phản ứng phụ thuộc trực tiếp vào số mol ban đầu và nhiệt độ đun nóng.

⚠️ **4. Cảnh báo an toàn thí nghiệm:**
- Mang kính bảo hộ và găng tay phòng thí nghiệm.
- Khi đun nóng hoặc sủi bọt khí, không kề sát mặt trực tiếp vào miệng bình chứa.`;
  }

  if (rxnMarkdown) {
    return `🧪 **[ANH MÃ PHÂN TÍCH PHẢN ỨNG HÓA HỌC]**

📌 **1. Phương trình phản ứng:**
**${rxnMarkdown}**

👁️ **2. Hiện tượng quan sát được:**
Phản ứng hóa học đang diễn ra làm biến đổi nồng độ các chất trong dung dịch, có sự thay đổi màu sắc, sủi bọt khí hoặc biến thiên nhiệt độ.

💡 **3. Bản chất hóa học:**
Các ion/chất tham gia tương tác hình thành các liên kết hóa học mới bền vững hơn.

⚠️ **4. Lưu ý an toàn:**
Thao tác cẩn trọng với hóa chất đậm đặc và dụng cụ đun nóng.`;
  }

  return null;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  equipments,
  isOpen,
  setIsOpen,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Xin chào! Anh là **Anh Mã** - Trợ lý Thí nghiệm Hóa học Ảo của em. Anh có thể quan sát trực tiếp các phản ứng đang diễn ra trên bàn thí nghiệm, tự động giải thích hiện tượng, hướng dẫn từng bước và đưa ra các cảnh báo an toàn quan trọng. Em muốn tìm hiểu gì nào?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const lastExplainedRxnRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Welcome message trigger when CO2 experiment is active
  useEffect(() => {
    const isExp4 = equipments.some(
      (e) => e.name.includes('CaCO3') || e.name.includes('NaHCO3') || e.isCo2Collector
    );

    if (isExp4) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === 'welcome_co2')) return prev;
        return [
          ...prev,
          {
            id: 'welcome_co2',
            role: 'assistant',
            content:
              '👋 **Xin chào! Anh là Anh Mã.**\n\nDưới đây là quy trình chi tiết Thí nghiệm **Điều chế & Làm khô khí CO₂** (CaCO₃ + HCl):\n\n1. **Phản ứng chính:** `CaCO₃ (r) + 2HCl (dd) → CaCl₂ (dd) + CO₂↑ (k) + H₂O (l)`\n2. **Bình 1 (Rửa khí HCl dư bằng NaHCO₃ bão hòa):** `HCl + NaHCO₃ → NaCl + CO₂↑ + H₂O`\n3. **Bình 2 (Làm khô bằng H₂SO₄ đặc):** H₂SO₄ đặc hút ẩm hoàn toàn hơi H₂O.\n4. **Bình thu khí (Bình cầu ngửa):** Khí CO₂ khô chìm xuống đáy dâng dần lên đẩy không khí ra ngoài.\n\n👉 Em hãy mở khóa phễu nhỏ giọt HCl 2M để bắt đầu quan sát các hiệu ứng nhé!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      });
    }
  }, [equipments]);

  // Extract concise JSON Lab Context for Gemini
  const getLabContextJSON = () => {
    const isExp3 = equipments.some(
      (e) =>
        e.name.includes('MnO2') ||
        e.name.includes('Cl2') ||
        e.name.includes('HCl đặc') ||
        e.name.includes('Phễu / Pipet Nhỏ Giọt Axit HCl đặc')
    );
    return equipments.map((eq) => ({
      name: eq.name,
      type: eq.type,
      volumeMl: eq.content.volumeMl,
      temperatureC: eq.content.temperatureC,
      pH: isExp3 ? null : eq.content.pH,
      dissolvedSpecies: eq.content.speciesMoles,
      precipitates: eq.content.precipitates.map((p) => `${p.name} (${p.formula}, ${p.massGram.toFixed(2)}g)`),
      activeGas: eq.content.activeGas?.name || null,
      lastReactionMarkdown: eq.content.lastReactionMarkdown || null,
      indicator: eq.content.indicatorType || null,
      isBurning: eq.isBurning || false,
      splintState: eq.splintState || null,
      flameColor: eq.flameColor || null,
    }));
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          labContext: getLabContextJSON(),
        }),
      });

      const data = await response.json();
      let replyText = data.reply;

      if (!replyText || replyText.includes('GEMINI_API_KEY chưa được cấu hình') || replyText.includes('Rate limit')) {
        const localExp = generateLocalReactionExplanation(textToSend, equipments);
        if (localExp) {
          replyText = localExp;
        }
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyText || 'Anh Mã đang quan sát thí nghiệm và sẽ giải thích ngay cho em!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const localExp = generateLocalReactionExplanation(textToSend, equipments);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: localExp || '⚠️ Có lỗi kết nối khi hỏi Anh Mã. Em vui lòng thử lại sau nhé!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-detect & auto-explain chemical reactions when they happen
  useEffect(() => {
    // A reaction is STILL HAPPENING if any equipment has activeGas or reactionFxTimer > 0
    // "mọi hiệu ứng của thí nghiệm hoàn tất" -> Wait until animations/bubbling stops!
    const isAnimating = equipments.some((eq) => {
      if (eq.content.activeGas != null && eq.content.activeGas.rate > 0) return true;
      if (eq.content.reactionFxTimer != null && eq.content.reactionFxTimer > 0) return true;
      // Also if preset timer is running (we can guess by checking if it's bubbling or if dropping funnel is open)
      // Actually, preset experiments already set activeGas/reactionFxTimer while running.
      return false;
    });

    if (isAnimating) return; // WAIT UNTIL ALL EFFECTS COMPLETED

    const rxnEq = equipments.find(
      (eq) => eq.content.lastReactionMarkdown && eq.content.lastReactionMarkdown.trim() !== ''
    );

    if (rxnEq && rxnEq.content.lastReactionMarkdown) {
      const rxnMd = rxnEq.content.lastReactionMarkdown;

      if (rxnMd !== lastExplainedRxnRef.current) {
        lastExplainedRxnRef.current = rxnMd;

        if (!isOpen) {
          setIsOpen(true);
        }

        const autoPrompt = `🧪 [Phát hiện phản ứng vừa xảy ra trên bàn thí nghiệm]:
Phương trình: ${rxnMd}
Dụng cụ: ${rxnEq.name}

Anh Mã hãy giải thích chi tiết:
1. Hiện tượng quan sát được (màu sắc, sủi bọt, kết tủa, thay đổi nhiệt độ).
2. Phương trình phản ứng và danh pháp IUPAC.
3. Bản chất hóa học & Lưu ý an toàn thí nghiệm!`;

        handleSendMessage(autoPrompt);
      }
    } else if (equipments.length === 0) {
      lastExplainedRxnRef.current = null;
    }
  }, [equipments]);

  return (
    <div
      className={`relative flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100 transition-all duration-300 z-20 shadow-2xl ${
        isOpen ? 'w-80' : 'w-12'
      }`}
    >
      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-3.5 top-5 bg-blue-600 hover:bg-blue-500 text-white p-1 rounded-full shadow-lg border border-slate-700 transition-transform z-30"
        title={isOpen ? 'Thu gọn' : 'Mở rộng'}
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {isOpen ? (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
                <HippoIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-100 flex items-center space-x-1.5">
                  <span>Trợ Lý "Anh Mã"</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </h2>
                <p className="text-[10px] text-slate-400">Gemini AI Assistant Context-Aware</p>
              </div>
            </div>
          </div>

          {/* Quick Context Prompt Shortcuts */}
          <div className="p-2 border-b border-slate-800 bg-slate-950/40 flex items-center space-x-1.5 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => handleSendMessage('Hãy giải thích hiện tượng hóa học đang xảy ra trên bàn thí nghiệm!')}
              className="px-2.5 py-1 text-[11px] font-medium bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-700/50 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Phân tích phản ứng</span>
            </button>
            <button
              onClick={() => handleSendMessage('Đưa ra cảnh báo an toàn cho các hóa chất đang có trên bàn!')}
              className="px-2.5 py-1 text-[11px] font-medium bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border border-amber-700/50 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1"
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Cảnh báo an toàn</span>
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed shadow-md ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{formatChemicalText(msg.content)}</p>
                  ) : (
                    <div className="markdown-body text-xs space-y-1 [&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:text-blue-300 [&_code]:bg-slate-900 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-cyan-300">
                      <Markdown>{formatChemicalText(msg.content)}</Markdown>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-blue-400 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60 w-fit">
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                <span>Anh Mã đang phân tích dữ liệu hóa học...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Hỏi Anh Mã về phản ứng, công thức..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-slate-400"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading}
                className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl shadow-md transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center pt-6 space-y-6 text-slate-400">
          <HippoIcon className="w-5 h-5 text-blue-400" />
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
      )}
    </div>
  );
};
