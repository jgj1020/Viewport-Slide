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

// 2. 스크롤 스냅 감지 및 액티브 클래스 부여
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
    
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission !== 'function') {
        if(sensorBtn) sensorBtn.style.display = 'none';
        initShakeSensor();
    }
});

// ⚡ 카드 상태 토글 및 배경 스크롤 제어
function toggleCard(select) {
    if (select) {
        card.classList.add('open');
        // 🚫 카드가 열리면 전체 화면 스크롤을 완전히 잠급니다.
        container.style.overflowY = 'hidden';
    } else {
        card.classList.remove('open');
        // 🔓 카드가 닫히면 전체 화면 스크롤을 다시 허용합니다.
        container.style.overflowY = 'scroll';
    }
}

// ==========================================
// 🖐️ ↕️ 양방향 드래그 제스처 시스템 (스크롤 간섭 차단 예외처리)
// ==========================================
let startY = 0;
let isDragging = false;

function handleStart(e) {
    isDragging = true;
    startY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
}

function handleMove(e) {
    if (!isDragging) return;
    const currentY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
    const diffY = startY - currentY; // 위로 올리면 (+), 아래로 내리면 (-)

    // 카드가 열려있는 상태에서 아래로 쓸어내릴 때 브라우저의 기본 스크롤 동작을 무조건 막음!
    if (card.classList.contains('open') && diffY < 0) {
        if (e.cancelable) e.preventDefault(); 
    }

    // 1. 위로 드래그 -> 카드가 닫혀있을 때 꺼내기
    if (diffY > 60 && !card.classList.contains('open')) {
        toggleCard(true);
        isDragging = false;
    }
    
    // 2. 아래로 드래그 -> 카드가 열려있을 때 집어넣기
    if (diffY < -60 && card.classList.contains('open')) {
        toggleCard(false);
        isDragging = false;
    }
}

function handleEnd() { 
    isDragging = false; 
}

// 스크롤 락을 위해 passive 옵션을 false로 강제 설정하여 preventDefault가 작동하도록 함
gestureZone.addEventListener('touchstart', handleStart, { passive: true });
gestureZone.addEventListener('touchmove', handleMove, { passive: false }); // 중요! false로 변경
gestureZone.addEventListener('touchend', handleEnd);

gestureZone.addEventListener('mousedown', handleStart);
gestureZone.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);


// ==========================================
// 📳 스마트폰 흔들기(Shake) 센서
// ==========================================
let lastX = null, lastY = null, lastZ = null;
let lastUpdate = 0;
const SHAKE_THRESHOLD = 800;

function deviceMotionHandler(event) {
    const acceleration = event.accelerationIncludingGravity;
    const curTime = new Date().getTime();

    if ((curTime - lastUpdate) > 100) {
        const diffTime = curTime - lastUpdate;
        lastUpdate = curTime;

        const x = acceleration.x;
        const y = acceleration.y;
        const z = acceleration.z;

        if (lastX !== null && lastY !== null && lastZ !== null) {
            const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

            if (speed > SHAKE_THRESHOLD && !card.classList.contains('open')) {
                toggleCard(true);
                if (navigator.vibrate) navigator.vibrate(200);
            }
        }
        lastX = x; lastY = y; lastZ = z;
    }
}

function initShakeSensor() {
    window.addEventListener('devicemotion', deviceMotionHandler, true);
}

function requestSensorPermission() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    initShakeSensor();
                    sensorBtn.style.display = 'none';
                } else {
                    alert('흔들기 기능을 쓰려면 센서 권한 허용이 필요합니다.');
                }
            })
            .catch(console.error);
    } else {
        initShakeSensor();
        sensorBtn.style.display = 'none';
    }
}