const container = document.querySelector('.slide-container');
const slides = document.querySelectorAll('.v-slide');
const dots = document.querySelectorAll('.dot');
const card = document.getElementById('my-card');
const gestureZone = document.getElementById('gesture-zone');
const sensorBtn = document.getElementById('sensor-btn');

// ==========================================
// 🌀 0. SECTION-2 SKILLS: 역동적 닫힘 및 자동 셧다운 기능 엔진
// ==========================================
let isSystemExpanded = false; 
let currentTargetAngle = 0;   
const totalSkills = 4;

// 🕹️ 1) 가운데 버튼 코어 클릭: 접고 펼치는 토글 기능 (트랜스포머 닫힘 트리거 포함)
function toggleSystem() {
    const circusWrapper = document.getElementById('circusWrapper');
    const detailPanel = document.getElementById('detailPanel');
    const coreIcon = document.getElementById('core-icon');
    
    if (!isSystemExpanded) {
        // 시스템 대전개 (오픈)
        isSystemExpanded = true;
        circusWrapper.classList.remove('collapsed');
        detailPanel.classList.remove('hidden-panel');
        coreIcon.className = "fas fa-compress-arrows-alt core-mode-icon"; 
        coreIcon.style.transform = "rotate(-180deg)"; // 아이콘 역회전 리액션
        
        syncDetailPanel(0); // 최초 12시 랭귀지 동기화
    } else {
        // 시스템 강제 셧다운 (닫기 메커니즘 가동)
        forceCollapseSystem();
    }
}

// 🔒 [강력 셧다운 캡슐화]: 외부 스크롤 이탈 시에도 이 함수가 호출되어 완벽히 잠깁니다.
function forceCollapseSystem() {
    const circusWrapper = document.getElementById('circusWrapper');
    const detailPanel = document.getElementById('detailPanel');
    const coreIcon = document.getElementById('core-icon');
    
    if (!circusWrapper) return;
    
    isSystemExpanded = false;
    circusWrapper.classList.add('collapsed'); // CSS상의 540도 블랙홀 회전 닫힘 모션 발동
    detailPanel.classList.add('hidden-panel'); // 하단 텍스트 스르륵 아웃
    
    if(coreIcon) {
        coreIcon.className = "fas fa-expand-arrows-alt core-mode-icon";
        coreIcon.style.transform = "rotate(0deg)";
    }
}

// 🕹️ 2) 주변 기술 아이콘 클릭: 정면 회전 연산 시스템
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
        const radius = window.innerWidth <= 480 ? '-95px' : '-135px';
        cardItem.style.transform = `translate(-50%, -50%) rotate(calc(${index} * 90deg)) translateY(${radius}) rotate(calc(${index} * -90deg - ${currentTargetAngle}deg))`;
    });

    syncDetailPanel(targetIndex);
}

// 📋 [천천히 아래서 위로 무빙 업 설명창 모션 가속기]
function syncDetailPanel(index) {
    const skillCards = document.querySelectorAll('.skill-card');
    const targetCard = document.querySelector(`.skill-card[style*="--item-index: ${index}"]`);
    const textMover = document.getElementById('textMover');
    
    if (targetCard && textMover) {
        skillCards.forEach(c => c.classList.remove('active-focus'));
        targetCard.classList.add('active-focus');

        const skillName = targetCard.getAttribute('data-skill');
        const skillDesc = targetCard.getAttribute('data-desc');

        // 먼저 바닥 아래로 순간이동시켜 눈에 숨기기
        textMover.classList.add('sliding-down');

        // 아주 미세한 브라우저 프레임 틱 연산 간격 부여 후, 천천히 슬라이드 업 로딩 시작
        setTimeout(() => {
            document.getElementById('active-skill-title').innerText = skillName;
            document.getElementById('skill-description').innerText = skillDesc;
            
            textMover.classList.remove('sliding-down'); // 위로 천천히 부드럽게 상승 가동
        }, 100); 
    }
}


// ==========================================
// 📌 1. 우측 점(Dot) 제어 및 [핵심] 스크롤 섹션 변경 시 자동 닫힘 감지기
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
            
            // 💡 [요청 사항 반영] 현재 인덱스가 SKILLS 섹션(1번)이 아니라면 무조건 자동 닫힘 작동!
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
// 💳 2. 명함 센서 인터랙션 사양
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
    if (diffY > 60 && !card.classList.contains('open')) { toggleCard(true); isDragging = false; }
    if (diffY < -60 && card.classList.contains('open')) { toggleCard(false); isDragging = false; }
}

gestureZone.addEventListener('touchstart', handleStart, { passive: true });
gestureZone.addEventListener('touchmove', handleMove, { passive: false }); 
gestureZone.addEventListener('touchend', () => isDragging = false);
gestureZone.addEventListener('mousedown', handleStart);
gestureZone.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', () => isDragging = false);

let lastX = null, lastY = null, lastZ = null, lastUpdate = 0;
function deviceMotionHandler(event) {
    const acceleration = event.accelerationIncludingGravity;
    const curTime = new Date().getTime();
    if ((curTime - lastUpdate) > 100) {
        const diffTime = curTime - lastUpdate; lastUpdate = curTime;
        const x = acceleration.x; const y = acceleration.y; const z = acceleration.z;
        if (lastX !== null) {
            const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;
            if (speed > 800 && !card.classList.contains('open')) { toggleCard(true); if (navigator.vibrate) navigator.vibrate(200); }
        }
        lastX = x; lastY = y; lastZ = z;
    }
}
function initShakeSensor() { window.addEventListener('devicemotion', deviceMotionHandler, true); }
function requestSensorPermission() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission().then(state => { if (state === 'granted') initShakeSensor(); }).catch(console.error);
    } else { initShakeSensor(); }
}