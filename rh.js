(function() {
    // 1. Защита от повторного запуска
    if (window.__rh_ultra_button) return;
    window.__rh_ultra_button = true;
    
    console.log('[RH] Инициализация...');

    // 2. Создаем кнопку (ваш стиль)
    const btn = document.createElement('button');
    btn.id = 'rh-ultra-button';
    btn.style.cssText = `
        position: fixed !important;
        right: 20px !important;
        bottom: 80px !important;
        z-index: 999999 !important;
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
        cursor: pointer !important;
    `;
    btn.innerHTML = '<span style="font-size:20px">▶️</span> RH Плеер';

    // 3. Безопасное получение данных
    function getContentInfo() {
        try {
            // Способ 1: Из URL
            const urlMatch = window.location.href.match(/\/(movie|tv)\/(\d+)/);
            if (urlMatch) {
                return {
                    id: urlMatch[2],
                    type: urlMatch[1],
                    source: 'URL'
                };
            }

            // Способ 2: Из Lampa (с полной защитой)
            if (typeof window.Lampa !== 'undefined') {
                try {
                    const card = window.Lampa.Storage.get('card');
                    if (card && card.id) {
                        return {
                            id: card.id,
                            type: card.type || 'movie',
                            source: 'Lampa'
                        };
                    }
                } catch (e) {
                    console.error('[RH] Lampa Error:', e);
                }
            }

            return null;
        } catch (e) {
            console.error('[RH] Global Error:', e);
            return null;
        }
    }

    // 4. Супер-защищенный обработчик клика
    btn.onclick = function() {
        try {
            const content = getContentInfo();
            
            if (!content) {
                alert('❌ Контент не найден!\n\n1. Полностью откройте карточку\n2. Дождитесь загрузки\n3. Обновите страницу (F5)');
                return;
            }

            console.log('[RH] Content found:', content);
            const playUrl = `https://api4.rhhhhhhh.live/play?tmdb_id=${content.id}&type=${content.type}`;
            
            // Пробуем 3 способа открытия
            try {
                // Способ 1: Обычное окно
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                    newWindow.location.href = playUrl;
                } else {
                    // Способ 2: Если блокирует popup
                    window.location.href = playUrl;
                }
            } catch (e) {
                // Способ 3: Через iframe
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = playUrl;
                document.body.appendChild(iframe);
                setTimeout(() => document.body.removeChild(iframe), 1000);
            }
            
        } catch (e) {
            console.error('[RH] Click Error:', e);
            alert('⚠️ Неожиданная ошибка!\n\n' + e.message);
        }
    };

    // 5. Добавляем кнопку с защитой
    function safeAppend() {
        try {
            if (!document.getElementById('rh-ultra-button')) {
                document.body.appendChild(btn);
                console.log('[RH] Кнопка добавлена');
            }
        } catch (e) {
            console.error('[RH] Append Error:', e);
        }
    }

    // 6. Запуск
    if (document.readyState === 'complete') {
        safeAppend();
    } else {
        window.addEventListener('load', safeAppend);
    }

    // 7. Защита от удаления (безопасная версия)
    const safeObserver = new MutationObserver(() => {
        try {
            if (!document.getElementById('rh-ultra-button')) {
                safeAppend();
            }
        } catch (e) {
            console.error('[RH] Observer Error:', e);
        }
    });
    safeObserver.observe(document.body, { childList: true, subtree: true });

    console.log('[RH] Готово!');
})();
