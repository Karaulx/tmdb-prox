(function() {
    // Ждем полной загрузки страницы
    if (document.readyState !== 'complete') {
        window.addEventListener('load', initButton);
    } else {
        setTimeout(initButton, 1000);
    }

    function initButton() {
        // Проверяем, существует ли уже кнопка
        if (document.getElementById('rh-player-btn') || window.__rh_button_initialized) {
            console.log('[RH] Кнопка уже существует');
            return;
        }
        window.__rh_button_initialized = true;

        console.log('[RH] Инициализация кнопки...');

        // Создаем кнопку
        const btn = document.createElement('button');
        btn.id = 'rh-player-btn';
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M8 5V19L19 12L8 5Z" fill="white"/>
            </svg>
            <span>RH Player</span>
        `;
        
        // Стили с важными !important
        Object.assign(btn.style, {
            position: 'fixed',
            right: '25px',
            bottom: '100px',
            'z-index': '999999',
            background: 'linear-gradient(135deg, #ff3c00, #ff006a)',
            color: 'white',
            padding: '12px 24px',
            'border-radius': '50px',
            'font-size': '16px',
            'font-weight': 'bold',
            border: 'none',
            'box-shadow': '0 4px 20px rgba(255, 0, 0, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            'align-items': 'center',
            gap: '8px',
            transition: 'transform 0.2s'
        });

        // Добавляем кнопку в DOM
        document.body.appendChild(btn);
        console.log('[RH] Кнопка добавлена в DOM');

        // Обработчик клика
        btn.onclick = function() {
            try {
                console.log('[RH] Попытка получить данные...');
                
                // Альтернативные способы получения ID
                const getTmdbId = () => {
                    // 1. Из URL
                    const urlMatch = window.location.href.match(/\/(movie|tv)\/(\d+)/);
                    if (urlMatch) return urlMatch[2];
                    
                    // 2. Из глобальных переменных Lampa
                    try {
                        if (window.Lampa?.Storage?.get('card')?.id) {
                            return window.Lampa.Storage.get('card').id;
                        }
                    } catch(e) {}
                    
                    return null;
                };

                const tmdbId = getTmdbId();
                console.log('[RH] TMDB ID:', tmdbId);

                if (tmdbId) {
                    const contentType = window.location.href.includes('/tv/') ? 'tv' : 'movie';
                    const playUrl = `https://api4.rhhhhhhh.live/play?tmdb_id=${tmdbId}&type=${contentType}`;
                    console.log('[RH] Открываю плеер:', playUrl);
                    window.open(playUrl, '_blank');
                } else {
                    alert('Не удалось определить ID контента!\n1. Полностью откройте карточку\n2. Дождитесь загрузки\n3. Попробуйте снова');
                }
            } catch(e) {
                console.error('[RH] Ошибка:', e);
                alert('Ошибка: ' + e.message);
            }
        };

        // Защита от удаления
        const observer = new MutationObserver(function(mutations) {
            if (!document.getElementById('rh-player-btn')) {
                console.log('[RH] Кнопка удалена, восстанавливаю...');
                document.body.appendChild(btn);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        console.log('[RH] Кнопка готова к использованию');
    }
})();
