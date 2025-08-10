(function(){
    // Защита от повторного запуска
    if(window.__rh_button_exists) return;
    window.__rh_button_exists = true;

    console.log('[RH PLAYER BUTTON] Initializing');

    // Создаем кнопку с максимально высоким z-index и уникальным стилем
    const btn = document.createElement('button');
    btn.id = 'rh-player-btn';
    btn.style.cssText = `
        position: fixed !important;
        right: 25px !important;
        bottom: 100px !important;
        z-index: 999999 !important;
        background: linear-gradient(135deg, #ff3c00, #ff006a) !important;
        color: white !important;
        padding: 12px 24px !important;
        border-radius: 50px !important;
        font-size: 16px !important;
        font-weight: bold !important;
        border: none !important;
        box-shadow: 0 4px 20px rgba(255, 0, 0, 0.3) !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        transition: transform 0.2s !important;
    `;
    
    // Иконка и текст
    btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5V19L19 12L8 5Z" fill="white"/>
        </svg>
        <span>RH Player</span>
    `;

    // Добавляем кнопку в DOM
    document.body.appendChild(btn);

    // Анимация при наведении
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.05)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
    });

    // Логика работы кнопки
    btn.addEventListener('click', () => {
        try {
            // Получаем текущий TMDB ID из Lampa
            const cardData = window.Lampa.Storage.get('card');
            const tmdbId = cardData?.id;
            const contentType = cardData?.type || 'movie';
            
            if(tmdbId) {
                const playUrl = `https://api4.rhhhhhhh.live/play?tmdb_id=${tmdbId}&type=${contentType}`;
                console.log('Opening RH Player:', playUrl);
                window.open(playUrl, '_blank');
            } else {
                alert('TMDB ID not found!\n1. Fully open movie/tv card\n2. Wait for loading\n3. Try again');
            }
        } catch(e) {
            console.error('RH Player Error:', e);
            alert('Error: ' + e.message);
        }
    });

    // Защита от удаления кнопки
    const observer = new MutationObserver(() => {
        if(!document.getElementById('rh-player-btn')) {
            document.body.appendChild(btn);
        }
    });
    observer.observe(document.body, { childList: true });

    console.log('[RH PLAYER BUTTON] Ready');
})();
