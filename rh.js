(function(){
    if(window.__rh_universal_loader) return;
    window.__rh_universal_loader = true;

    console.log('[RH UNIVERSAL LOADER] Initializing');

    // 1. Конфигурация
    const config = {
        name: "▶️ RH Плеер",
        apiBase: "https://api4.rhhhhhhh.live",
        btnId: "rh-universal-btn",
        retryDelay: 500,
        maxRetries: 30
    };

    // 2. Создаем кнопку
    const createButton = () => {
        const btn = document.createElement('button');
        btn.id = config.btnId;
        btn.style.cssText = `
            position: fixed !important;
            right: 20px !important;
            bottom: 80px !important;
            z-index: 99999 !important;
            background: #FF0000 !important;
            color: white !important;
            padding: 12px 18px !important;
            border-radius: 8px !important;
            font-size: 16px !important;
            font-weight: bold !important;
            cursor: pointer !important;
            border: none !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        `;
        document.body.appendChild(btn);
        return btn;
    };

    // 3. Получаем ID из всех возможных источников
    const getContentId = () => {
        // Проверяем разные форматы ID
        const idFormats = [
            // TMDB ID
            () => {
                const card = window.Lampa?.Storage?.get('card');
                if(card?.id) return {id: card.id, type: 'tmdb'};
                return null;
            },
            
            // Kinopoisk ID из URL API
            () => {
                if(window._last_api_request) {
                    const kpMatch = window._last_api_request.match(/kp_info2\/(\d+)/);
                    if(kpMatch) return {id: kpMatch[1], type: 'kp'};
                }
                return null;
            },
            
            // IMDB ID из URL API
            () => {
                if(window._last_api_request) {
                    const imdbMatch = window._last_api_request.match(/imdb_to_kp\/(tt\d+)/);
                    if(imdbMatch) return {id: imdbMatch[1], type: 'imdb'};
                }
                return null;
            },
            
            // Из URL страницы
            () => {
                const urlMatch = window.location.href.match(/\/(movie|tv)\/(\d+)/);
                if(urlMatch) return {id: urlMatch[2], type: 'tmdb'};
                return null;
            }
        ];

        // Пробуем все форматы по очереди
        for(const format of idFormats) {
            try {
                const result = format();
                if(result?.id) return result;
            } catch(e) {
                console.error('Error checking ID format:', e);
            }
        }

        return null;
    };

    // 4. Перехватчик API запросов
    const hookApiRequests = () => {
        if(window.XMLHttpRequest.isHooked) return;

        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if(url.includes(config.apiBase)) {
                window._last_api_request = url;
                console.log('API request detected:', url);
            }
            return originalOpen.apply(this, arguments);
        };

        window.XMLHttpRequest.isHooked = true;
    };

    // 5. Формирование правильного URL
    const getPlayUrl = (idInfo) => {
        if(!idInfo) return null;

        switch(idInfo.type) {
            case 'tmdb':
                return `${config.apiBase}/play?tmdb_id=${idInfo.id}`;
            case 'kp':
                return `${config.apiBase}/play?kp_id=${idInfo.id}`;
            case 'imdb':
                return `${config.apiBase}/play?imdb_id=${idInfo.id}`;
            default:
                return null;
        }
    };

    // 6. Основная логика
    const init = (retryCount = 0) => {
        hookApiRequests();
        const btn = document.getElementById(config.btnId) || createButton();

        const idInfo = getContentId();
        const playUrl = getPlayUrl(idInfo);

        if(playUrl) {
            btn.textContent = config.name;
            btn.onclick = () => {
                console.log('Opening:', playUrl);
                window.open(playUrl, '_blank');
            };
            btn.style.display = 'block';
            console.log('Successfully initialized with ID:', idInfo);
            return;
        }

        if(retryCount < config.maxRetries) {
            setTimeout(() => init(retryCount + 1), config.retryDelay);
        } else {
            btn.textContent = '❌ Ошибка загрузки';
            btn.onclick = () => alert('Пожалуйста, полностью откройте карточку и попробуйте снова');
            btn.style.display = 'block';
            console.error('Failed to detect content ID');
        }
    };

    // 7. Запуск
    if(document.readyState === 'complete') {
        setTimeout(init, 1000);
    } else {
        window.addEventListener('load', () => setTimeout(init, 1000));
    }

    // Дублирующий запуск через 3 секунды
    setTimeout(init, 3000);
})();
