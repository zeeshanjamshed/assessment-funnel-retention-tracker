

(function (window) {
    'use strict';

    const FunnelTracker = {
        config: {
            apiUrl: '',
            quizId: '',
            sessionId: '',
            debug: false
        },


        generateSessionId: function () {
            return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },


        getSessionId: function () {
            let sessionId = sessionStorage.getItem('funnel_session_id');
            if (!sessionId) {
                sessionId = this.generateSessionId();
                sessionStorage.setItem('funnel_session_id', sessionId);
            }

            // For testing: Add browser tab identifier to ensure unique sessions
            const tabId = sessionStorage.getItem('funnel_tab_id') || Math.random().toString(36).substr(2, 5);
            sessionStorage.setItem('funnel_tab_id', tabId);

            return sessionId + '_' + tabId;
        },


        extractQuizIdFromUrl: function (url) {
            try {
                const urlObj = new URL(url);
                const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
                return pathSegments[pathSegments.length - 1] || 'unknown';
            } catch (error) {
                console.error('Error extracting quiz ID from URL:', error);
                return 'unknown';
            }
        },


        sendTrackingData: function (endpoint, data) {
            if (!this.config.apiUrl) {
                console.error('FunnelTracker: API URL not configured');
                return;
            }

            const payload = {
                ...data,
                quizId: this.config.quizId,
                sessionId: this.config.sessionId,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent || 'Unknown Browser',
                url: window.location.href,
            };

            if (this.config.debug) {
                console.log('FunnelTracker: Sending data to', endpoint, payload);
            }

            fetch(`${this.config.apiUrl}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(error => {
                console.error('FunnelTracker: Error sending data:', error);
            });
        },


        trackEntry: function () {
            this.sendTrackingData('entry', {});

            if (this.config.debug) {
                console.log('FunnelTracker: Entry tracked for quiz', this.config.quizId);
            }
        },


        trackSlide: function (slideId, slideTitle, slideSequence) {
            if (!slideId || slideSequence === undefined) {
                console.error('FunnelTracker: slideId and slideSequence are required');
                return;
            }

            this.sendTrackingData('slide', {
                slideId: slideId,
                slideTitle: slideTitle || '',
                slideSequence: parseInt(slideSequence)
            });

            if (this.config.debug) {
                console.log('FunnelTracker: Slide tracked', {
                    slideId,
                    slideTitle,
                    slideSequence
                });
            }
        },


        autoTrackSlides: function () {

            const slideSelectors = [
                '.quiz-slide',
                '[data-slide]',
                '.slide',
                '.step',
                '.question',
                '[data-step]',
                'section',
                '[data-testid*="question"]',
                '[class*="question"]',
                '[class*="step"]',
                'div[class*="slide"]',
                'form'
            ];

            let slides = [];


            for (const selector of slideSelectors) {
                slides = document.querySelectorAll(selector);
                if (slides.length > 0) break;
            }

            if (slides.length === 0) {
                if (this.config.debug) {
                    console.log('FunnelTracker: No slides found with common selectors');
                }
                return;
            }


            this.trackVisibleSlides(slides);


            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const slide = entry.target;
                        const slideId = slide.dataset.slide ||
                            slide.dataset.step ||
                            slide.id ||
                            `slide-${Array.from(slides).indexOf(slide) + 1}`;

                        const slideTitle = slide.dataset.title ||
                            slide.querySelector('h1, h2, h3, h4, .title, [class*="title"], [class*="question"]')?.textContent?.trim() ||
                            slide.textContent?.substring(0, 50).trim() ||
                            '';

                        const slideSequence = parseInt(slide.dataset.sequence) ||
                            parseInt(slide.dataset.step) ||
                            Array.from(slides).indexOf(slide) + 1;

                        this.trackSlide(slideId, slideTitle, slideSequence);
                    }
                });
            }, {
                threshold: 0.3,
                rootMargin: '50px'
            });


            slides.forEach(slide => observer.observe(slide));

            if (this.config.debug) {
                console.log(`FunnelTracker: Auto-tracking ${slides.length} slides`);
            }
        },


        trackVisibleSlides: function (slides) {
            slides.forEach((slide, index) => {

                if (slide.classList.contains('active') ||
                    slide.style.display !== 'none' &&
                    slide.offsetParent !== null) {

                    const slideId = slide.dataset.slide ||
                        slide.dataset.step ||
                        slide.id ||
                        `slide-${index + 1}`;

                    const slideTitle = slide.dataset.title ||
                        slide.querySelector('h1, h2, h3, h4, .title, [class*="title"], [class*="question"]')?.textContent?.trim() ||
                        slide.textContent?.substring(0, 50).trim() ||
                        '';

                    const slideSequence = parseInt(slide.dataset.sequence) ||
                        parseInt(slide.dataset.step) ||
                        index + 1;

                    this.trackSlide(slideId, slideTitle, slideSequence);
                }
            });
        },


        init: function (options = {}) {

            this.config = {
                ...this.config,
                ...options
            };


            if (!this.config.quizId) {
                this.config.quizId = this.extractQuizIdFromUrl(window.location.href);
            }


            this.config.sessionId = this.getSessionId();

            if (this.config.debug) {
                console.log('FunnelTracker: Initialized with config', this.config);
            }


            this.trackEntry();


            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.autoTrackSlides();
                });
            } else {
                this.autoTrackSlides();
            }


            window.addEventListener('beforeunload', () => {

                if (this.config.debug) {
                    console.log('FunnelTracker: Page unloading');
                }
            });
        }
    };


    window.FunnelTracker = FunnelTracker;

})(window);
