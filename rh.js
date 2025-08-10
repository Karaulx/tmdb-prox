(function() {
    // 1. Защита от дублирования
    if (window.__rh_button_v3) return;
    window.__rh_button_v3 = true;
    console.log('[RH] INIT');

    // 2. Функция создания кнопки (ваш оригинальный дизайн)
    function createButton() {
        const btn = document.createElement('button');
        btn.id = 'rh-player-btn-v3';
        btn.innerHTML = `▶️ RH Плеер`;
        
        // Ваши оригинальные стили
        Object.assign(btn.style, {
            position: 'fixed',
            right: '20px',
            bottom: '80px',
            zIndex: '2147483647',
            background: 'linear-gradient(135deg, #FF0000, #FF4500)',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            border: 'none',
            boxShadow: '0 6px 24px rgba(255, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'rh-pulse 1.5s infinite'
        });

        // Ваша анимация
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rh-pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.9; }
            }
        `;
        document.head.appendChild(style);
        
        return btn;
    }

    // 3. Проверка условий для показа кнопки
    function checkConditions() {
        // Проверяем доступность Lampa
        const isLampaReady = () => {
            try {
                return !!window.Lampa;
            } catch (e) {
                return false;
            }
        };

        // Проверяем DOM
        const isDOMReady = () => {
            return document.body && document.head;
        };

        return isDOMReady() && isLampaReady();
    }

    // 4. Главная функция инициализации
    function init() {
        if (!checkConditions()) {
            console.log('[RH] Conditions not ready, retrying...');
            setTimeout(init, 1000);
            return;
        }

        console.log('[RH] Creating button...');
        const btn = createButton();
        document.body.appendChild(btn);

        // Логика клика
        btn.addEventListener('click', function() {
            try {
                const tmdbId = window.Lampa.Storage.get('card')?.id;
                if (tmdbId) {
                    const type = window.location.pathname.includes('/tv/') ? 'tv' : 'movie';
                    window.open(`https://api4.rhhhhhhh.live/play?tmdb_id=${tmdbId}&type=${type}`, '_blank');
                } else {
                    alert('Откройте карточку фильма/сериала полностью и дождитесь загрузки');
                }
            } catch (e) {
                console.error('[RH] Error:', e);
            }
        });

        console.log('[RH] Button created successfully');
    }

    // 5. Запуск с защитой
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

    // 6. Защита от удаления кнопки
    new MutationObserver(() => {
        if (!document.getElementById('rh-player-btn-v3')) {
            console.log('[RH] Button was removed, recreating...');
            init();
        }
    }).observe(document.body, { childList: true });
})();
