// Particles.js Initialization
// Background particle effects

(function() {
  'use strict';

  // Check if particlesJS is available
  if (typeof particlesJS === 'undefined') {
    console.warn('Particles.js is not loaded. Particle effects will not work.');
    return;
  }

  // Initialize particles
  function initParticles() {
    // Create particles container
    let particlesContainer = document.getElementById('particles-js');
    
    if (!particlesContainer) {
      // Create container if it doesn't exist
      particlesContainer = document.createElement('div');
      particlesContainer.id = 'particles-js';
      particlesContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
      `;

      // Add to hero section
      const hero = document.querySelector('.hero');
      if (hero) {
        // Ensure hero has proper positioning
        if (getComputedStyle(hero).position === 'static') {
          hero.style.position = 'relative';
        }
        hero.style.zIndex = '1';
        
        // Ensure content is above particles
        const heroContent = hero.querySelector('.hero-title, .hero-description, .search-container');
        if (heroContent) {
          heroContent.style.position = 'relative';
          heroContent.style.zIndex = '2';
        }
        
        hero.insertBefore(particlesContainer, hero.firstChild);
      } else {
        return;
      }
    }

    // Particles configuration
    particlesJS('particles-js', {
      particles: {
        number: {
          value: 50,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: '#667eea'
        },
        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#000000'
          }
        },
        opacity: {
          value: 0.3,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 0.1,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#667eea',
          opacity: 0.2,
          width: 1
        },
        move: {
          enable: true,
          speed: 1,
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'repulse'
          },
          onclick: {
            enable: true,
            mode: 'push'
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 1
            }
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3
          },
          repulse: {
            distance: 100,
            duration: 0.4
          },
          push: {
            particles_nb: 4
          },
          remove: {
            particles_nb: 2
          }
        }
      },
      retina_detect: true
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticles);
  } else {
    initParticles();
  }

  console.log('Particles.js initialized');
})();

