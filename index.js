const container = document.querySelector('.slide-container');
const slides = document.querySelectorAll('.v-slide');
const dots = document.querySelectorAll('.dot');
const card = document.getElementById('my-card');
const gestureZone = document.getElementById('gesture-zone');
const sensorBtn = document.getElementById('sensor-btn');

// 1. 점(Dot) 클릭 이동
function scrollToSlide(index) {
    const slideHeight = window.innerHeight;
    container.scrollTo({
        top: slideHeight * index,
        behavior: 'smooth'
    });
}

// 2. 스크롤 스냅 감지
container.addEventListener('scroll', () => {
    const slideHeight = window.innerHeight;
    const scrollTop = container.scrollTop;
    const currentIndex = Math.round(scrollTop / slideHeight);
    
    slides.forEach((slide, index) => {
        if (index === currentIndex) {
            slide.classList.add('active');
            dots[index].classList.add('active');
        } else {
            slide.classList.remove('active');
            dots[index].classList.remove('active');
            if (index === 3) toggleCard(false);
        }
    });
});

window.addEventListener('DOMContentLoaded', () => {
    slides[0].classList.add('active');
    
    // 안드로이드 같은 기기는 버튼을 누를 필요가 없으므로 미리 숨김 체크 (iOS만 유효하게 동작)
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission !== 'function') {
        if(sensorBtn) sensorBtn.style.display = 'none';
        initShakeSensor(); // 즉시 가속도계 활성화
    }
});

function toggleCard(select) {
    if (select) {
        card.classList.add('open');
    } else {
        card.classList.remove('open');
    }
}

// ==========================================
// 🖐️ 드래그 제스처 메커니즘
// ==========================================
let startY = 0;
let isDragging = false;

function handleStart(e) {
    if (card.classList.contains('open')) return;
    isDragging = true;
    startY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
}

function handleMove(e) {
    if (!isDragging) return;
    const currentY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
    const diffY = startY - currentY;

    if (diffY > 60) {
        toggleCard(true);
        isDragging = false;
    }
}

function handleEnd() { isDragging = false; }

gestureZone.addEventListener('touchstart', handleStart, { passive: true });
gestureZone.addEventListener('touchmove', handleMove, { passive: true });
gestureZone.addEventListener('touchend', handleEnd);
gestureZone.addEventListener('mousedown', handleStart);
gestureZone.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);


// ==========================================
// 📳 스마트폰 흔들기(Shake) 센서 시스템
// ==========================================
let lastX = null, lastY = null, lastZ = null;
let lastUpdate = 0;
const SHAKE_THRESHOLD = 800; // 흔들기 민감도 (숫자가 낮을수록 더 잘 반응함)

// 모바일 가속도 감지 이벤트 핸들러
function deviceMotionHandler(event) {
    const acceleration = event.accelerationIncludingGravity;
    const curTime = new Date().getTime();

    // 0.1초마다 센서값 체크
    if ((curTime - lastUpdate) > 100) {
        const diffTime = curTime - lastUpdate;
        lastUpdate = curTime;

        const x = acceleration.x;
        const y = acceleration.y;
        const z = acceleration.z;

        if (lastX !== null && lastY !== null && lastZ !== null) {
            // 움직임 변화량 물리 공식 계산
            const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

            // 정해진 기준치보다 세게 흔들리면 카드 오픈!
            if (speed > SHAKE_THRESHOLD && !card.classList.contains('open')) {
                toggleCard(true);
                
                // 가벼운 진동 효과 (안드로이드만 지원)
                if (navigator.vibrate) {
                    navigator.vibrate(200);
                }
            }
        }

        lastX = x;
        lastY = y;
        lastZ = z;
    }
}

// 센서 리스너 등록 함수
function initShakeSensor() {
    window.addEventListener('devicemotion', deviceMotionHandler, true);
}

// 아이폰(iOS) 전용 자이로스코프 센서 권한 요청 허용 장치
function requestSensorPermission() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    initShakeSensor(); // 권한 획득 성공 시 센서 작동
                    sensorBtn.style.display = 'none'; // 버튼 숨기기
                } else {
                    alert('흔들기 기능을 쓰려면 센서 권한 허용이 필요합니다.');
                }
            })
            .catch(console.error);
    } else {
        // 일반 브라우저나 안드로이드는 권한 팝업 없이 바로 실행
        initShakeSensor();
        sensorBtn.style.display = 'none';
    }
}