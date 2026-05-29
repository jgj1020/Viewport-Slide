const container = document.querySelector('.slide-container');
const slides = document.querySelectorAll('.v-slide');
const dots = document.querySelectorAll('.dot');
const card = document.getElementById('my-card');
const gestureZone = document.getElementById('gesture-zone');
const sensorBtn = document.getElementById('sensor-btn');

function scrollToSlide(index) {
    const slideHeight = window.innerHeight;
    container.scrollTo({
        top: slideHeight * index,
        behavior: 'smooth'
    });
}

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

function toggleCard(select) {
    if (select) {
        card.classList.add('open');
    } else {
        card.classList.remove('open');
    }
}

// 🖐️ 드래그 제스처
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

// 📳 흔들기 센서
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
                if (navigator.vibrate) {
                    navigator.vibrate(200);
                }
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