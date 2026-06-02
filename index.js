const container = document.querySelector('.slide-container');
const slides = document.querySelectorAll('.v-slide');
const dots = document.querySelectorAll('.dot');
const card = document.getElementById('my-card');
const gestureZone = document.getElementById('gesture-zone');

// ==========================================
// 🌀 0. SECTION-2 SKILLS: 쇼케이스 제어부
// ==========================================
let isSystemExpanded = false; 
let currentTargetAngle = 0;   
const totalSkills = 4;

function toggleSystem() {
    const circusWrapper = document.getElementById('circusWrapper');
    const detailPanel = document.getElementById('detailPanel');
    
    if (!isSystemExpanded) {
        isSystemExpanded = true;
        circusWrapper.classList.remove('collapsed');
        detailPanel.classList.remove('hidden-panel');
        selectSkill(0); 
    } else {
        forceCollapseSystem();
    }
}

function forceCollapseSystem() {
    const circusWrapper = document.getElementById('circusWrapper');
    const detailPanel = document.getElementById('detailPanel');
    
    if (!circusWrapper) return;
    isSystemExpanded = false;
    circusWrapper.classList.add('collapsed'); 
    detailPanel.classList.add('hidden-panel'); 
}

function selectSkill(targetIndex) {
    if (!isSystemExpanded) return; 

    const currentActiveIndex = ((currentTargetAngle / -90) % totalSkills + totalSkills) % totalSkills;
    let diff = targetIndex - currentActiveIndex;
    
    if (diff > 2) diff -= totalSkills;
    if (diff < -2) diff += totalSkills;
    
    currentTargetAngle -= (diff * 90);

    const skillContainer = document.getElementById('skillContainer');
    const skillCards = document.querySelectorAll('.skill-card');
    
    skillContainer.style.transform = `rotate(${currentTargetAngle}deg)`;
    
    skillCards.forEach((cardItem) => {
        const index = cardItem.style.getPropertyValue('--item-index');
        const radius = window.innerWidth <= 480 ? '-100px' : '-130px';
        cardItem.style.transform = `translate(-50%, -50%) rotate(calc(${index} * 90deg)) translateY(${radius}) rotate(calc(${index} * -90deg - ${currentTargetAngle}deg))`;
    });

    syncDetailPanel(targetIndex);
}

function syncDetailPanel(index) {
    const skillCards = document.querySelectorAll('.skill-card');
    const targetCard = document.querySelector(`.skill-card[style*="--item-index: ${index}"]`);
    
    if (targetCard) {
        skillCards.forEach(c => c.classList.remove('active-focus'));
        targetCard.classList.add('active-focus');

        const skillName = targetCard.getAttribute('data-skill');
        const skillDesc = targetCard.getAttribute('data-desc');

        document.getElementById('active-skill-title').innerText = skillName;
        document.getElementById('skill-description').innerText = skillDesc;
    }
}

// ==========================================
// 📌 1. 풀페이지 스크롤 제어부
// ==========================================
function scrollToSlide(index) {
    const slideHeight = window.innerHeight;
    container.scrollTo({ top: slideHeight * index, behavior: 'smooth' });
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
            
            if (index === 1 && isSystemExpanded) {
                forceCollapseSystem();
            }
            if (index === 3) toggleCard(false);
        }
    });
});

window.addEventListener('DOMContentLoaded', () => {
    slides[0].classList.add('active');
});

// ==========================================
// 💳 2. 명함 인터랙션 & 리얼 핸드폰 가속도 물리 엔진
// ==========================================
function toggleCard(select) {
    if (select) {
        card.classList.add('open');
        container.style.overflowY = 'hidden'; 
    } else {
        card.classList.remove('open');
        container.style.overflowY = 'scroll';
    }
}

// 터치 드래그 메커니즘
let startY = 0; let isDragging = false;
function handleStart(e) { isDragging = true; startY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY; }
function handleMove(e) {
    if (!isDragging) return;
    const currentY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
    const diffY = startY - currentY;
    if (card.classList.contains('open') && diffY < 0 && e.cancelable) e.preventDefault(); 
    if (diffY > 50 && !card.classList.contains('open')) { toggleCard(true); isDragging = false; }
    if (diffY < -50 && card.classList.contains('open')) { toggleCard(false); isDragging = false; }
}

gestureZone.addEventListener('touchstart', handleStart, { passive: true });
gestureZone.addEventListener('touchmove', handleMove, { passive: false }); 
gestureZone.addEventListener('touchend', () => isDragging = false);
gestureZone.addEventListener('mousedown', handleStart);
gestureZone.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', () => isDragging = false);


// 📱 [핵심 고도화] 물리 센서 작동 및 권한 획득 처리 엔진
let lastX = null, lastY = null, lastZ = null, lastUpdate = 0;
let isSensorAttached = false; // 중복 등록 방지 가드

function deviceMotionHandler(event) {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    // 스크린샷 속 핸드폰 아이콘 클래스(.shake-icon) 혹은 i 태그 자동 매칭
    const phoneIcon = document.querySelector('.shake-icon') || gestureZone.querySelector('i');

    const curTime = new Date().getTime();
    if ((curTime - lastUpdate) > 30) { // 반응 속도를 더 빠르게 (30ms)
        const diffTime = curTime - lastUpdate; 
        lastUpdate = curTime;

        const x = acceleration.x; 
        const y = acceleration.y; 
        const z = acceleration.z;

        // 1. 손 기울기에 따라 핸드폰 이모지 실시간 꺾임 연동
        if (phoneIcon && x !== null) {
            let tiltAngle = x * -4.0; // 기울기 감도 살짝 상향
            if (tiltAngle > 40) tiltAngle = 40;
            if (tiltAngle < -40) tiltAngle = -40;
            
            phoneIcon.style.transition = 'transform 0.05s ease-out'; // 극도로 부드럽고 민첩하게 반응
            phoneIcon.style.transform = `rotate(${tiltAngle}deg) scale(1.15)`;
        }

        // 2. 폰을 휙 흔들었을 때 명함 카드 오픈 트리거
        if (lastX !== null) {
            const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;
            
            // 흔들림 감지 민감도 최적화 (800)
            if (speed > 800 && !card.classList.contains('open')) { 
                toggleCard(true);
                if (navigator.vibrate) navigator.vibrate(150); // 흔들렸을 때 징~ 진동 피드백
            }
        }
        lastX = x; lastY = y; lastZ = z;
    }
}

// 🔐 [안내] iOS 및 최신 브라우저는 반드시 '사용자의 직접적인 터치'가 있어야만 센서를 켤 수 있습니다.
function activateSensor() {
    if (isSensorAttached) return; // 이미 켜져 있다면 중복 작동 방지

    // 1. iOS 사파리 규격 대응
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(state => { 
                if (state === 'granted') {
                    window.addEventListener('devicemotion', deviceMotionHandler, true);
                    isSensorAttached = true;
                } else {
                    alert('센서 권한이 거부되었습니다. 설정에서 모션 인식을 허용해 주세요!');
                }
            })
            .catch(err => {
                console.error("iOS Sensor Error: ", err);
            });
    } 
    // 2. 안드로이드 크롬 및 일반 모바일 브라우저 규격 대응
    else if (typeof DeviceMotionEvent !== 'undefined') {
        window.addEventListener('devicemotion', deviceMotionHandler, true);
        isSensorAttached = true;
    } else {
        alert('이 기기는 자이로 가속도 센서를 지원하지 않습니다.');
    }
}

// 04번 명함 스크린의 전체 구역에 '터치하면 센서가 깨어나도록' 완벽 결합
if (gestureZone) {
    gestureZone.addEventListener('click', activateSensor);
    gestureZone.addEventListener('touchstart', activateSensor);
}