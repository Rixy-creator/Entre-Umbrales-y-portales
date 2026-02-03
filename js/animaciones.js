// Script para ocultar/mostrar el navbar al hacer scroll
$(document).ready(function() {
    let lastScrollTop = 0;
    const navbar = $('.navbar');
    const scrollThreshold = 50; // Píxeles que se deben desplazar antes de ocultar/mostrar
    
    $(window).scroll(function() {
        let scrollTop = $(this).scrollTop();
        
        // Si estamos en la parte superior de la página, siempre mostrar el navbar
        if (scrollTop < scrollThreshold) {
            navbar.removeClass('navbar-hidden').addClass('navbar-visible');
            return;
        }
        
        // Detectar dirección del scroll
        if (scrollTop > lastScrollTop) {
            // Scrolling hacia abajo - ocultar navbar
            navbar.removeClass('navbar-visible').addClass('navbar-hidden');
        } else {
            // Scrolling hacia arriba - mostrar navbar
            navbar.removeClass('navbar-hidden').addClass('navbar-visible');
        }
        
        lastScrollTop = scrollTop;
    });
});

// Scroll reveal: usa IntersectionObserver para activar la clase .active en elementos con .reveal
(function(){
    try {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('active'); });
            return;
        }

        const reveals = document.querySelectorAll('.reveal');
        if (!reveals.length) return;

        const observer = new IntersectionObserver(function(entries, obs){
            entries.forEach(function(entry){
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseInt(el.dataset.delay) || 0;
                    setTimeout(function(){ el.classList.add('active'); }, delay);
                    obs.unobserve(el);
                }
            });
        }, { root: null, rootMargin: '0px 0px -20% 0px', threshold: 0.25 });

        reveals.forEach(function(r){ observer.observe(r); });
    } catch (e) {
        // silencioso en caso de error
        document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('active'); });
    }
})();


