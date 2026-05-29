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

// 2. 현재 어떤 슬라이드가 뷰포트에 있는지 감지하여 Dot 및 애니메이션 활성화
container.addEventListener('scroll', () => {
    const slideHeight = window.innerHeight;
    const scrollTop = container.scrollTop;
    
    // 현재 스크롤 위치를 기반으로 인덱스 계산 (반올림)
    const currentIndex = Math.round(scrollTop / slideHeight);
    
    // 모든 슬라이드와 점의 클래스 초기화 후 현재 인덱스만 활성화
    slides.forEach((slide, index) => {
        if (index === currentIndex) {
            slide.classList.add('active');
            dots[index].classList.add('active');
        } else {
            slide.classList.remove('active');
            dots[index].classList.remove('active');
        }
    });
});

// 3. 첫 페이지 진입 시 첫 번째 섹션 바로 애니메이션 활성화
window.addEventListener('DOMContentLoaded', () => {
    slides[0].classList.add('active');
});