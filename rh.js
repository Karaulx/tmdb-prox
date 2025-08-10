(function() {
    // 1. Защита от повторного запуска
    if (window.__rh_ultra_button) return;
    window.__rh_ultra_button = true;

    console.log('[RH] Инициализация для Lampa 2.4.6...');

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

    // 4. Получение данных
    function getContentInfo() {
        try {
            // --- Способ 1: URL ---
            const urlMatch = window.location.href.match(/\/(movie|tv)\/(\d+)/);
            if (urlMatch) {
                return {
                    id: urlMatch[2],
                    type: urlMatch[1],
                    source: 'URL'
                };
            }

            // --- Способ 2: Глобальный объект Lampa ---
            if (window.activity && window.activity.data && window.activity.data.id) {
                let type = 'movie';
                if (window.activity.data.movie) type = 'movie';
                else if (window.activity.data.tv) type = 'tv';
                else if (window.activity.data.type) type = window.activity.data.type;

                return {
                    id: window.activity.data.id,
                    type: type,
                    source: 'window.activity'
                };
            }

            return null;
        } catch (e) {
            console.error('[RH] Ошибка при получении данных:', e);
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

    // 6. Добавление кнопки
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

    // 7. Запуск при загрузке
    if (document.readyState === 'complete') {
        safeAppend();
    } else {
        window.addEventListener('load', safeAppend);
    }

    // 8. Проверка при переходах внутри Lampa
    let lastId = null;
    setInterval(() => {
        const info = getContentInfo();
        if (info && info.id !== lastId) {
            lastId = info.id;
            console.log('[RH] Обновлено: ', info);
        }
        if (!document.getElementById('rh-ultra-button')) {
            safeAppend();
        }
    }, 1500);

    console.log('[RH] Готово для Lampa 2.4.6!');
})();
