(function() {
    'use strict';
    
    console.log('[TMDB Proxy] Плагин для Lampa 2.4.6');
    
    // Конфигурация (ЗАМЕНИТЕ НА СВОИ ДАННЫЕ)
    const CONFIG = {
        apiProxy: 'https://novomih25.duckdns.org:9092/3',
        imageProxy: 'https://novomih25.duckdns.org:9092',
        authHeader: 'Basic ' + btoa('jackett:3p4uh49y')
    };

    // 1. Перехват XMLHttpRequest (основной для Lampa 2.x)
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        
        xhr.open = function(method, url) {
            if (/themoviedb\.org/.test(url)) {
                url = url.replace(/^http:/, 'https:')
                         .replace(/api\.themoviedb\.org\/3/, CONFIG.apiProxy)
                         .replace(/image\.tmdb\.org/, CONFIG.imageProxy);
                
                console.log('[TMDB Proxy] API:', url);
                originalOpen.call(this, method, url);
                this.setRequestHeader('Authorization', CONFIG.authHeader);
            } else {
                originalOpen.call(this, method, url);
            }
        };
        
        return xhr;
    };

    // 2. Перехват динамических изображений
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        
        if (tagName.toLowerCase() === 'img') {
            Object.defineProperty(element, 'src', {
                set: function(value) {
                    if (/image\.tmdb\.org/.test(value)) {
                        value = value.replace(/^http:/, 'https:')
                                    .replace(/image\.tmdb\.org/, CONFIG.imageProxy);
                        console.log('[TMDB Proxy] Изображение:', value);
                    }
                    element.setAttribute('src', value);
                },
                get: function() {
                    return element.getAttribute('src');
                }
            });
        }
        
        return element;
    };

    // 3. Перехват статических изображений
    function replaceExistingImages() {
        document.querySelectorAll('img[src*="image.tmdb.org"]').forEach(img => {
            img.src = img.src.replace(/^http:/, 'https:')
                            .replace(/image\.tmdb\.org/, CONFIG.imageProxy);
        });
    }

    // 4. Инициализация
    function init() {
        replaceExistingImages();
        
        // Периодическая проверка новых изображений
        setInterval(replaceExistingImages, 1000);
        
        console.log('[TMDB Proxy] Успешно активирован!');
    }

    // Автозапуск
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
