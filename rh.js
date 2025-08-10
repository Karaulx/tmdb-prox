(function() {
    // 1. Защита от повторного запуска
    if (window.__rh_ultra_button) return;
    window.__rh_ultra_button = true;
    
    console.log('[RH] Инициализация...');

    // 2. Создаем кнопку
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
        animation: rhPulse 2s infinite;
    `;
    btn.innerHTML = '<span style="font-size:20px">▶️</span> RH Плеер';

    // 3. Анимация пульсации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rhPulse {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255,0,0,0.4); }
            50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(255,0,0,0.8); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,0,0,0.4); }
        }
    `;
    document.head.appendChild(style);

    // 4. Получение данных о контенте
    function getContentInfo() {
        try {
            // --- Способ 1: По URL ---
            const urlMatch = window.location.href.match(/\/(movie|tv)\/(\d+)/);
            if (urlMatch) {
                return {
                    id: urlMatch[2],
                    type: urlMatch[1],
                    source: 'URL'
                };
            }

            // --- Способ 2: Через Lampa Activity (для 2.4.6) ---
            if (typeof window.Lampa !== 'undefined' && Lampa.Activity && Lampa.Activity.active) {
                try {
                    const active = Lampa.Activity.active();
                    if (active && active.data && active.data.id) {
                        let type = 'movie';
                        if (active.data.movie) type = 'movie';
                        else if (active.data.tv) type = 'tv';
                        else if (active.data.type) type = active.data.type;
                        
                        return {
                            id: active.data.id,
                            type: type,
                            source: 'Lampa.Activity'
                        };
                    }
                } catch (e) {
                    console.error('[RH] Lampa Activity Error:', e);
                }
            }

            return null;
        } catch (e) {
            console.error('[RH] Global Error:', e);
            return null;
        }
    }

    // 5. Обработчик клика
    btn.onclick = function() {
        try {
            const content = getContentInfo();
            
            if (!content) {
                alert('❌ Контент не найден!\n\n1. Откройте карточку фильма/сериала\n2. Дождитесь загрузки\n3. Попробуйте снова');
                return;
            }

            console.log('[RH] Контент найден:', content);
            const playUrl = `https://api4.rhhhhhhh.live/play?tmdb_id=${content.id}&type=${content.type}`;
            
            try {
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                    newWindow.location.href = playUrl;
                } else {
                    window.location.href = playUrl;
                }
            } catch (e) {
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

    // 6. Функция добавления кнопки
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

    // 7. Запуск
    if (document.readyState === 'complete') {
        safeAppend();
    } else {
        window.addEventListener('load', safeAppend);
    }

    // 8. Защита от удаления
    setInterval(() => {
        if (!document.getElementById('rh-ultra-button')) {
            safeAppend();
        }
    }, 2000);

    console.log('[RH] Готово!');
})();
