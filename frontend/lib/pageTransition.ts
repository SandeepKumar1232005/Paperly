import gsap from 'gsap';

export function navigateWithTransition(callback: () => void) {
  const overlay = document.getElementById('page-transition-overlay');
  if (!overlay) { callback(); return; }

  gsap.to(overlay, {
    yPercent: 0,
    duration: 0.65,
    ease: 'power4.inOut',
    onComplete: () => {
      callback();
      gsap.to(overlay, {
        yPercent: -100,
        duration: 0.65,
        ease: 'power4.inOut',
        delay: 0.05,
        onComplete: () => {
          gsap.set(overlay, { yPercent: 100 });
        }
      });
    }
  });
}
