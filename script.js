document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('hero-canvas');
    const context = canvas.getContext('2d');
    const frameCount = 145;
    const images = [];
    let loadedImages = 0;

    // Preload images
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const paddedIndex = i.toString().padStart(3, '0');
        img.src = `images/frame_${paddedIndex}.png`;
        
        img.onload = () => {
            loadedImages++;
            if (i === 1) { // Draw the first image right away if it's loaded
                setupCanvas(img);
            }
        };
        images.push(img);
    }

    function setupCanvas(img) {
        canvas.width = img.naturalWidth || 1920;
        canvas.height = img.naturalHeight || 1080;
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.classList.add('loaded');
    }

    // Fallback if the first image was cached and loaded instantly
    if (images[0] && images[0].complete) {
        setupCanvas(images[0]);
    }

    const heroSequence = document.querySelector('.hero-sequence');
    const texts = document.querySelectorAll('.scroll-text');
    
    // Define animation timings for the texts (start fraction, end fraction)
    const textAnimations = [
        { start: 0.05, end: 0.35 }, // Text 1 fades in quickly
        { start: 0.50, end: 0.90 }  // Text 2 fades in as the explosion happens
    ];

    let lastScrollTop = 0;
    let ticking = false;

    function updateAnimation(scrollTop) {
        const maxScroll = heroSequence.scrollHeight - window.innerHeight;
        if (maxScroll <= 0) return;
        
        let scrollFraction = scrollTop / maxScroll;
        // Clamp
        scrollFraction = Math.max(0, Math.min(scrollFraction, 1));

        // Figure out which frame to draw
        const frameIndex = Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount));
        
        if (images[frameIndex] && images[frameIndex].complete) {
            const img = images[frameIndex];
            const w = img.naturalWidth || 1920;
            const h = img.naturalHeight || 1080;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, w, h);
        }

        // Animate text overlays
        texts.forEach((text, index) => {
            const anim = textAnimations[index];
            if (anim) {
                if (scrollFraction >= anim.start && scrollFraction <= anim.end) {
                    let opacity = 1;
                    const fadeDuration = 0.08;
                    // Fade in
                    if (scrollFraction < anim.start + fadeDuration) {
                        opacity = (scrollFraction - anim.start) / fadeDuration;
                    } 
                    // Fade out
                    else if (scrollFraction > anim.end - fadeDuration) {
                        opacity = (anim.end - scrollFraction) / fadeDuration;
                    }
                    text.style.opacity = opacity;
                    text.style.transform = `translate(-50%, -${50 + opacity * 10}%)`;
                } else {
                    text.style.opacity = 0;
                    text.style.transform = `translate(-50%, -50%)`;
                }
            }
        });
    }

    window.addEventListener('scroll', () => {
        lastScrollTop = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateAnimation(lastScrollTop);
                ticking = false;
            });
            ticking = true;
        }
    });

    // Initial call
    updateAnimation(window.scrollY);
});
