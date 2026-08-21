# -*- coding: utf-8 -*-
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add reactionTimerRef to T6
old_refs = 'const handledReactionsRef = Qe.useRef(new Set());'
new_refs = 'const handledReactionsRef = Qe.useRef(new Set());  const reactionTimerRef = Qe.useRef(null);  const pendingRxKeyRef = Qe.useRef(null);'

if old_refs in text:
    text = text.replace(old_refs, new_refs, 1)
    print("1. Added reactionTimerRef and pendingRxKeyRef successfully")
else:
    print("WARNING: old_refs not found")

# 2. Update Reaction completion listener to delay for 10 seconds (10000ms) after effects end
old_listener = '''  // REACTION COMPLETION LISTENER:
  // Triggers ONLY after ALL visual reaction effects have finished!
  Qe.useEffect(()=>{
    if (!r || r.length === 0) {
      handledReactionsRef.current.clear();
      wasReactingRef.current = false;
      return;
    }

    // Check if any reaction effect is actively running right now
    const isAnyFxActive = r.some(K => {
      if (!K.content) return false;
      if (K.content.reactionFxTimer != null && K.content.reactionFxTimer > 0) return true;
      if (K.content.activeGas != null && K.content.activeGas.rate > 0) return true;
      if (K.content.isBoiling) return true;
      if (K.isBurning && K.content.volumeMl > 0) return true;
      if (K.hasDroppingFunnel && K.valveOpen && K.droppingFunnelVolumeMl > 0) return true;
      return false;
    });

    if (isAnyFxActive) {
      wasReactingRef.current = true;
      return; // Do NOT trigger while effects are still running!
    }

    // Reaction effects are completely done!
    // Find if there is a completed reaction that hasn't been announced yet
    const completedEq = r.find(K => K.content && K.content.lastReactionMarkdown && K.content.lastReactionMarkdown.trim() !== "");
    if (completedEq && completedEq.content.lastReactionMarkdown) {
      const rxKey = completedEq.content.lastReactionMarkdown.trim();
      if (!handledReactionsRef.current.has(rxKey)) {
        handledReactionsRef.current.add(rxKey);
        wasReactingRef.current = false;
        // Auto open chat drawer if closed
        if (!a) l(!0);
        // Trigger auto detection
        M(rxKey, true, { equation: rxKey, equipmentName: completedEq.name });
      }
    }
  }, [r, a, l]);'''

new_listener = '''  // REACTION COMPLETION LISTENER:
  // After ALL visual reaction effects have completely finished, wait 10 seconds before Anh Mã detects and explains the experiment!
  Qe.useEffect(()=>{
    if (!r || r.length === 0) {
      if (reactionTimerRef.current) {
        clearTimeout(reactionTimerRef.current);
        reactionTimerRef.current = null;
      }
      pendingRxKeyRef.current = null;
      handledReactionsRef.current.clear();
      wasReactingRef.current = false;
      return;
    }

    // Check if any reaction effect is actively running right now
    const isAnyFxActive = r.some(K => {
      if (!K.content) return false;
      if (K.content.reactionFxTimer != null && K.content.reactionFxTimer > 0) return true;
      if (K.content.activeGas != null && K.content.activeGas.rate > 0) return true;
      if (K.content.isBoiling) return true;
      if (K.isBurning && K.content.volumeMl > 0) return true;
      if (K.hasDroppingFunnel && K.valveOpen && K.droppingFunnelVolumeMl > 0) return true;
      return false;
    });

    if (isAnyFxActive) {
      wasReactingRef.current = true;
      // If a timer was counting down, reset it while new reaction effects are ongoing
      if (reactionTimerRef.current) {
        clearTimeout(reactionTimerRef.current);
        reactionTimerRef.current = null;
        pendingRxKeyRef.current = null;
      }
      return; // Do NOT trigger while effects are still running!
    }

    // Reaction effects are completely finished!
    // Find if there is a completed reaction that hasn't been announced yet
    const completedEq = r.find(K => K.content && K.content.lastReactionMarkdown && K.content.lastReactionMarkdown.trim() !== "");
    if (completedEq && completedEq.content.lastReactionMarkdown) {
      const rxKey = completedEq.content.lastReactionMarkdown.trim();
      if (!handledReactionsRef.current.has(rxKey)) {
        // If we are not already waiting on this exact reaction, start 10s timer
        if (pendingRxKeyRef.current !== rxKey) {
          if (reactionTimerRef.current) {
            clearTimeout(reactionTimerRef.current);
          }
          pendingRxKeyRef.current = rxKey;
          // Sau khi các hiệu ứng kết thúc, chờ 10 giây (10000ms) rồi Anh Mã mới phát hiện và giải thích phản ứng
          reactionTimerRef.current = setTimeout(() => {
            reactionTimerRef.current = null;
            pendingRxKeyRef.current = null;
            handledReactionsRef.current.add(rxKey);
            wasReactingRef.current = false;
            // Tự động mở khung chat nếu đang đóng
            if (!a) l(!0);
            // Kích hoạt phát hiện phản ứng tự động và giải thích chi tiết
            M(rxKey, true, { equation: rxKey, equipmentName: completedEq.name });
          }, 10000);
        }
      }
    }
  }, [r, a, l]);'''

if old_listener in text:
    text = text.replace(old_listener, new_listener, 1)
    print("2. Updated reaction completion listener to wait 10 seconds successfully")
else:
    print("WARNING: old_listener not found")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("index.html updated successfully!")
