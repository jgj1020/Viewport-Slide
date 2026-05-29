const container = document.querySelector('.slide-container');
const slides = document.querySelectorAll('.v-slide');
const dots = document.querySelectorAll('.dot');

// 1. 점(Dot) 클릭 시 해당 슬라이드로 이동하는 함수
function scrollToSlide(index) {
    const slideHeight = window.innerHeight;
    container.scrollTo({
        top: slideHeight * index,
        behavior: 'smooth'
    });
}

// 2. 현재 어떤 슬라이드가 뷰포트에 있는지 감지하여 Dot 활성화
container.addEventListener('scroll', () => {
    const slideHeight = window.innerHeight;
    const scrollTop = container.scrollTop;
    
    // 현재 스크롤 위치를 기반으로 인덱스 계산 (반올림 처리)
    const currentIndex = Math.round(scrollTop / slideHeight);
    
    // 모든 점의 active 클래스 제거 후 현재 인덱스만 추가
    dots.forEach((dot, index) => {
        if (index === currentIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
});