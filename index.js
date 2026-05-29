const container = document.querySelector('.slide-container');
const slides = document.querySelectorAll('.v-slide');
const dots = document.querySelectorAll('.dot');
const card = document.getElementById('my-card');
const gestureZone = document.getElementById('gesture-zone');

// 1. 점(Dot) 클릭 이동
function scrollToSlide(index) {
    const slideHeight = window.innerHeight;
    container.scrollTo({
        top: slideHeight * index,
        behavior: 'smooth'
    });
}

// 2. 스크롤 스냅 감지 및 초기화
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
            // 4번 섹션을 벗어나면 켜져있던 카드도 다시 집어넣음
            if (index === 3) toggleCard(false);
        }
    });
});

window.addEventListener('DOMContentLoaded', () => {
    slides[0].classList.add('active');
});

// ==========================================
// 🖐️ 제스처 및 스왑 메커니즘 (삼성 페이 카드 컨트롤)
// ==========================================
let startY = 0;
let isDragging = false;

function toggleCard(select) {
    if (select) {
        card.classList.add('open');
    } else {
        card.classList.remove('open');
    }
}

// 터치 및 마우스 스타트 지점 기록
function handleStart(e) {
    // 이미 카드가 열려있으면 제스처 작동 안 함
    if (card.classList.contains('open')) return;
    isDragging = true;
    startY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
}

// 터치 및 마우스 이동 중 계산
function handleMove(e) {
    if (!isDragging) return;
    const currentY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
    const diffY = startY - currentY; // 위로 올린 거리 측정

    // 위로 60픽셀 이상 슥 올렸다면 카드 대포 발사!
    if (diffY > 60) {
        toggleCard(true);
        isDragging = false;
    }
}

function handleEnd() {
    isDragging = false;
}

// 4번 섹션 전역에 제스처 이벤트 리스너 바인딩 (모바일+PC 완벽 지원)
gestureZone.addEventListener('touchstart', handleStart, { passive: true });
gestureZone.addEventListener('touchmove', handleMove, { passive: true });
gestureZone.addEventListener('touchend', handleEnd);

gestureZone.addEventListener('mousedown', handleStart);
gestureZone.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);