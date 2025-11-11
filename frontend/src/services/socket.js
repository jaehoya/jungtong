import { io } from 'socket.io-client';

// 백엔드 서버 주소 (Vite 환경 변수 사용)
const URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const socket = io(URL, {
  autoConnect: false, // 필요에 따라 수동으로 연결을 제어할 수 있습니다.
  transports: ['websocket'],
  path: "/socket.io/",
  // 연결 시 인증 토큰을 함께 전송합니다.
  auth: {
    token: null
  }
});

export const connectSocket = (token) => {
  socket.auth.token = token;
  socket.connect();
};

// 앱 전체에서 socket 상태를 추적하기 위한 이벤트 리스너 (선택 사항)
socket.on('connect', () => {
  // console.log('Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  // console.log('Socket disconnected');
});

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err.message);
  if (err.data && err.data.details) {
    console.error('Authentication details:', err.data.details);
  }
  // 인증 실패 시 처리
  if (err.message === 'Authentication error') {
    // 예: 로그인 페이지로 리디렉션
    // window.location.href = '/login';
  }
});
