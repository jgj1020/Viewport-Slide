const container = document.querySelector('.slide-container');
const slides = document.querySelectorAll('.v-slide');
const dots = document.querySelectorAll('.dot');
const card = document.getElementById('my-card');
const gestureZone = document.getElementById('gesture-zone');

// ==========================================
// 🌀 0. SECTION-2 SKILLS: 쇼케이스 제어부 (자동 열림 버그 완전 박멸)
// ==========================================
let isSystemExpanded = false; 
let currentTargetAngle = 0;   
const totalSkills = 4;

function toggleSystem() {
    const circusWrapper = document.getElementById('circusWrapper');
    const detailPanel = document.getElementById('detailPanel');
    
    if (!isSystemExpanded) {
        isSystemExpanded = true;
        if(circusWrapper) circusWrapper.classList.remove('collapsed');
        if(detailPanel) detailPanel.classList.remove('hidden-panel');
        selectSkill(0); 
    } else {
        forceCollapseSystem();
    }
}

function forceCollapseSystem() {
    const circusWrapper = document.getElementById('circusWrapper');
    const detailPanel = document.getElementById('detailPanel');
    
    isSystemExpanded = false;
    if (circusWrapper) circusWrapper.classList.add('collapsed'); 
    if (detailPanel) detailPanel.classList.add('hidden-panel'); 
}

function selectSkill(targetIndex) {
    const currentActiveIndex = ((currentTargetAngle / -90) % totalSkills + totalSkills) % totalSkills;
    let diff = targetIndex - currentActiveIndex;
    
    if (diff > 2) diff -= totalSkills;
    if (diff < -2) diff += totalSkills;
    
    currentTargetAngle -= (diff * 90);

    const skillContainer = document.getElementById('skillContainer');
    const skillCards = document.querySelectorAll('.skill-card');
    
    if (skillContainer) {
        skillContainer.style.transform = `rotate(${currentTargetAngle}deg)`;
    }
    
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

        const titleEl = document.getElementById('active-skill-title');
        const descEl = document.getElementById('skill-description');
        if (titleEl) titleEl.innerText = skillName;
        if (descEl) descEl.innerText = skillDesc;
    }
}

// ==========================================
// 📌 1. 풀페이지 스크롤 제어부 (강제 자동 활성화 코드 삭제)
// ==========================================
function updateNavigation(currentIndex) {
    slides.forEach((slide, index) => {
        if (index === currentIndex) {
            slide.classList.add('active');
            if (dots[index]) dots[index].classList.add('active');
            // 💡 [수정] index === 1 일 때 자동으로 toggleSystem()을 호출하던 버그 코드를 완전히 제거했습니다.
        } else {
            slide.classList.remove('active');
            if (dots[index]) dots[index].classList.remove('active');
            
            // 2번째 페이지를 '완전히 벗어날 때만' 안전하게 닫아줍니다.
            if (index === 1 && isSystemExpanded && currentIndex !== 1) {
                forceCollapseSystem();
            }
            if (index === 3) toggleCard(false);
        }
    });
}

function scrollToSlide(index) {
    const slideHeight = window.innerHeight;
    container.scrollTo({ top: slideHeight * index, behavior: 'smooth' });
}

container.addEventListener('scroll', () => {
    const slideHeight = window.innerHeight;
    const scrollTop = container.scrollTop;
    const currentIndex = Math.round(scrollTop / slideHeight);
    updateNavigation(currentIndex);
});

window.addEventListener('DOMContentLoaded', () => {
    container.scrollTop = 0;
    updateNavigation(0);
    
    // 첫 로드 시 스킬창은 철저하게 닫힌 상태(collapsed)로 대기합니다.
    const circusWrapper = document.getElementById('circusWrapper');
    if (circusWrapper) circusWrapper.classList.add('collapsed');
    isSystemExpanded = false;

    initIdleVibration();
    autoInitSensor(); 
});

// ==========================================
// 💳 2. 명함 인터랙션 & 리얼 가속도 모션 엔진
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

if (gestureZone) {
    gestureZone.addEventListener('touchstart', handleStart, { passive: true });
    gestureZone.addEventListener('touchmove', handleMove, { passive: false }); 
    gestureZone.addEventListener('touchend', () => isDragging = false);
    gestureZone.addEventListener('mousedown', handleStart);
    gestureZone.addEventListener('mousemove', handleMove);
}
window.addEventListener('mouseup', () => isDragging = false);

// 📱 상시 째깍째깍 대기 흔들기 효과
let idleAngle = 0;
let idleDirection = 1;
let sensorActive = false; 

function initIdleVibration() {
    setInterval(() => {
        if (sensorActive) return; 
        
        const phoneIcon = document.querySelector('.shake-icon') || (gestureZone && gestureZone.querySelector('i'));
        if (!phoneIcon) return;
        
        idleAngle += 1.2 * idleDirection;
        if (idleAngle > 12 || idleAngle < -12) {
            idleDirection *= -1; 
        }
        phoneIcon.style.transition = 'transform 0.08s ease-in-out';
        phoneIcon.style.transform = `rotate(${idleAngle}deg) scale(1.08)`;
    }, 60);
}

// 리얼 하드웨어 모션 센서 연동 가동부
let lastX = null, lastY = null, lastZ = null, lastUpdate = 0;
let isSensorAttached = false; 

function deviceMotionHandler(event) {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    sensorActive = true; 
    const phoneIcon = document.querySelector('.shake-icon') || (gestureZone && gestureZone.querySelector('i'));
    const curTime = new Date().getTime();

    if ((curTime - lastUpdate) > 30) { 
        const diffTime = curTime - lastUpdate; 
        lastUpdate = curTime;

        const x = acceleration.x; 
        const y = acceleration.y; 
        const z = acceleration.z;

        if (phoneIcon && x !== null) {
            let tiltAngle = x * -4.0; 
            if (tiltAngle > 40) tiltAngle = 40;
            if (tiltAngle < -40) tiltAngle = -40;
            
            phoneIcon.style.transition = 'transform 0.05s ease-out'; 
            phoneIcon.style.transform = `rotate(${tiltAngle}deg) scale(1.15)`;
        }

        if (lastX !== null) {
            const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;
            if (speed > 800 && !card.classList.contains('open')) { 
                toggleCard(true);
                if (navigator.vibrate) navigator.vibrate(150); 
            }
        }
        lastX = x; lastY = y; lastZ = z;
    }
}

function activateSensor() {
    if (isSensorAttached) return; 

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(state => { 
                if (state === 'granted') {
                    window.addEventListener('devicemotion', deviceMotionHandler, true);
                    isSensorAttached = true;
                }
            }).catch(console.error);
    } else if (typeof DeviceMotionEvent !== 'undefined') {
        window.addEventListener('devicemotion', deviceMotionHandler, true);
        isSensorAttached = true;
    }
}

function autoInitSensor() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission !== 'function') {
        window.addEventListener('devicemotion', deviceMotionHandler, true);
        isSensorAttached = true;
    }
}

if (gestureZone) {
    gestureZone.addEventListener('click', activateSensor);
    gestureZone.addEventListener('touchstart', activateSensor);
}