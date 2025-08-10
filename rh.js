(function() {
    // 1. Защита от повторного запуска
    if (window.__rh_super_button) return;
    window.__rh_super_button = true;
    
    console.log('[RH SUPER BUTTON] Init');

    // 2. Создаем кнопку (ваш оригинальный стиль)
    function createButton() {
        const btn = document.createElement('button');
        btn.id = 'rh-super-btn';
        btn.innerHTML = `
            <style>
                @keyframes rh-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                #rh-super-btn {
                    position: fixed !important;
                    right: 20px !important;
                    bottom: 80px !important;
                    z-index: 2147483647 !important;
                    background: linear-gradient(135deg, #FF0000, #FF4500) !important;
                    color: white !important;
                    padding: 14px 28px !important;
                    border-radius: 12px !important;
                    font-size: 18px !important;
                    font-weight: bold !important;
                    border: none !important;
                    box-shadow: 0 6px 24px rgba(255, 0, 0, 0.4) !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                    animation: rh-pulse 1.5s infinite !important;
                }
            </style>
            <span style="font-size:20px">▶️</span> RH Плеер
        `;
        return btn;
    }

    // 3. Надежный обработчик клика
    function handleClick() {
        console.log('[RH] Button clicked');
        
        // Все способы получить ID
        function getCurrentId() {
            // Из URL
            const urlMatch = window.location.href.match(/\/(movie|tv)\/(\d+)/);
            if (urlMatch) return {id: urlMatch[2], type: urlMatch[1]};
            
            // Из Lampa
            try {
                const card = window.Lampa.Storage.get('card');
                if (card?.id) return {id: card.id, type: card.type || 'movie'};
            } catch (e) {}
            
            // Из сетевых запросов
            const apiCalls = performance.getEntries()
                .filter(entry => entry.initiatorType === 'xmlhttprequest')
                .map(entry => entry.name);
            
            const tmdbMatch = apiCalls.find(url => url.includes('/tmdb_info/'))?.match(/tmdb_info\/(\d+)/);
            if (tmdbMatch) return {id: tmdbMatch[1], type: 'movie'};
            
            return null;
        }

        const content = getCurrentId();
        console.log('[RH] Current content:', content);

        if (content) {
            const playUrl = `https://api4.rhhhhhhh.live/play?tmdb_id=${content.id}&type=${content.type}`;
            console.log('[RH] Opening:', playUrl);
            
            // Три способа открыть URL
            try {
                // Способ 1: Стандартное окно
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                    newWindow.location.href = playUrl;
                } else {
                    // Способ 2: Если блокирует поп-ап
                    window.location.href = playUrl;
                }
            } catch (e) {
                // Способ 3: Экстренное открытие
                document.body.insertAdjacentHTML('beforeend', `
                    <iframe src="${playUrl}" style="width:0;height:0;border:0;"></iframe>
                `);
            }
        } else {
            alert('Не удалось определить контент!\n1. Полностью откройте карточку\n2. Дождитесь загрузки\n3. Попробуйте снова');
        }
    }

    // 4. Умная инициализация
    function init() {
        // Проверяем готовность
        if (!document.body || !window.Lampa) {
            setTimeout(init, 500);
            return;
        }

        // Создаем кнопку
        const btn = createButton();
        document.body.appendChild(btn);
        
        // Вешаем обработчик
        btn.addEventListener('click', handleClick);
        
        console.log('[RH] Button ready');
        
        // Защита от удаления
        setInterval(() => {
            if (!document.getElementById('rh-super-btn')) {
                console.log('[RH] Recreating button...');
                document.body.appendChild(createButton());
            }
        }, 1000);
    }

    // Запускаем
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
