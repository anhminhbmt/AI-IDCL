import React, { useState, useEffect } from 'react';
import {
  Video,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  MonitorUp,
  X,
  LogOut,
  User as UserIcon,
  AlertCircle,
  Loader2,
  Users,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  createMeetSpace,
  MeetSpaceResponse,
  auth,
} from '../services/googleMeet';

interface GoogleMeetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleMeetModal: React.FC<GoogleMeetModalProps> = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cachedToken, setCachedToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);
  const [isCreatingMeet, setIsCreatingMeet] = useState<boolean>(false);
  const [meetSpace, setMeetSpace] = useState<MeetSpaceResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setCachedToken(token);
      },
      () => {
        setCurrentUser(null);
        setCachedToken(null);
      }
    );

    // Initial check
    if (auth.currentUser) {
      setCurrentUser(auth.currentUser);
    }

    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setCachedToken(res.accessToken);
        // Automatically create a meet space once signed in
        await handleCreateMeeting(res.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setErrorMessage(
        err.message || 'Không thể đăng nhập Google. Vui lòng kiểm tra lại cửa sổ popup.'
      );
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleCreateMeeting = async (tokenOverride?: string) => {
    const token = tokenOverride || cachedToken;
    if (!token) {
      handleSignIn();
      return;
    }

    setIsCreatingMeet(true);
    setErrorMessage(null);
    try {
      const space = await createMeetSpace(token);
      setMeetSpace(space);
      // Auto open Meet in a new window/tab
      if (space.meetingUri) {
        window.open(space.meetingUri, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      console.error('Create Meet space error:', err);
      setErrorMessage(
        err.message ||
          'Không thể khởi tạo phòng họp qua Meet API. Bạn có thể sử dụng nút mở Meet nhanh bên dưới.'
      );
    } finally {
      setIsCreatingMeet(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setCachedToken(null);
      setMeetSpace(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 text-slate-100 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Google Meet & Trình Bày Màn Hình</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-700/60 px-2 py-0.5 rounded-full font-medium">
                  Live Stream
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Mở cuộc họp Google Meet để trình bày thí nghiệm ảo trực tiếp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="overflow-y-auto space-y-4 pr-1 text-sm relative z-10">
          {/* User Profile Bar if signed in */}
          {currentUser && (
            <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center space-x-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-9 h-9 rounded-full border border-emerald-500/50 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold text-white">
                    {currentUser.displayName || 'Người dùng Google'}
                  </div>
                  <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đổi tài khoản</span>
              </button>
            </div>
          )}

          {/* Active Meeting Room Space Info */}
          {meetSpace && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Phòng họp Google Meet đã sẵn sàng!</span>
                </span>
                <span className="text-[11px] font-mono bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded border border-emerald-600/40">
                  Mã: {meetSpace.meetingCode || 'Trực tuyến'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={meetSpace.meetingUri}
                  className="flex-1 bg-slate-950 border border-slate-700 text-emerald-300 font-mono text-xs px-3 py-2 rounded-xl focus:outline-none select-all"
                />
                <button
                  onClick={() => handleCopyLink(meetSpace.meetingUri)}
                  className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href={meetSpace.meetingUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-950"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Tham gia Google Meet ngay</span>
                </a>
                <button
                  onClick={() => handleCreateMeeting()}
                  disabled={isCreatingMeet}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all border border-slate-700"
                >
                  {isCreatingMeet ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Tạo phòng mới</span>
                </button>
              </div>
            </div>
          )}

          {/* If no active meeting created yet */}
          {!meetSpace && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
                <p className="leading-relaxed">
                  Tính năng này giúp bạn nhanh chóng tạo một phòng họp trên{' '}
                  <strong className="text-emerald-400">Google Meet</strong> để trình bày và chia
                  sẻ toàn màn hình hoặc tab thí nghiệm ảo này cho học sinh, đồng nghiệp theo thời
                  gian thực.
                </p>
              </div>

              {/* Main Action Buttons */}
              <div className="space-y-2.5">
                {currentUser && cachedToken ? (
                  <button
                    onClick={() => handleCreateMeeting()}
                    disabled={isCreatingMeet}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
                  >
                    {isCreatingMeet ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang tạo phòng họp Google Meet...</span>
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4" />
                        <span>Khởi Tạo Cuộc Họp Google Meet</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSignIn}
                    disabled={isLoadingAuth}
                    className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs rounded-2xl flex items-center justify-center space-x-3 shadow-md transition-all disabled:opacity-50"
                  >
                    {isLoadingAuth ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 48 48">
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                      </svg>
                    )}
                    <span>Đăng nhập Google để tạo phòng Meet</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error notice if any */}
          {errorMessage && (
            <div className="flex items-start space-x-2 bg-red-950/50 border border-red-500/40 rounded-xl p-3 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Step-by-step Presentation Guide Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="text-xs font-bold text-sky-400 flex items-center space-x-2">
              <MonitorUp className="w-4 h-4" />
              <span>Hướng Dẫn 3 Bước Trình Bày Màn Hình:</span>
            </div>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
              <li>
                Bấm vào liên kết phòng họp hoặc nút{' '}
                <strong className="text-emerald-300">Tham gia ngay</strong> trên Google Meet.
              </li>
              <li>
                Trên thanh công cụ phía dưới màn hình Meet, bấm nút{' '}
                <strong className="text-white">"Trình bày ngay" (Share screen)</strong>{' '}
                <span className="text-[11px] text-slate-400">(biểu tượng ô vuông có mũi tên hướng lên)</span>.
              </li>
              <li>
                Chọn tab trình duyệt{' '}
                <strong className="text-amber-300">"Phòng Thí Nghiệm Hóa Học Ảo 2D"</strong> để
                người xem có thể theo dõi mọi thao tác kéo thả và phản ứng hóa học trực tiếp!
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 pt-3 mt-4 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
          <div className="flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hỗ trợ chia sẻ màn hình chất lượng cao 1080p</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
