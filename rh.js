(function(){
    if(window.__rh_final_fix) return;
    window.__rh_final_fix = true;

    console.log('[RH FINAL FIX] Plugin started');

    // Упрощенная конфигурация
    const config = {
        name: "RH Плеер",
        apiUrl: "https://api4.rhhhhhhh.live/play"
    };

    // 1. Проверка видимости
    const isVisible = () => {
        const btn = document.querySelector('.rh-visible-btn');
        return btn && btn.offsetParent !== null;
    };

    // 2. Создание кнопки с упрощенными стилями
    const createButton = () => {
        const existingBtn = document.querySelector('.rh-visible-btn');
        if(existingBtn) return;

        const button = document.createElement('button');
        button.className = 'rh-visible-btn';
        button.textContent = config.name;
        button.style.cssText = `
            position: fixed !important;
            right: 20px !important;
            bottom: 80px !important;
            z-index: 99999 !important;
            background: #FF0000 !important;
            color: white !important;
            padding: 12px 18px !important;
            border: none !important;
            border-radius: 8px !important;
            font-size: 16px !important;
            cursor: pointer !important;
        `;

        button.onclick = () => {
            const card = window.Lampa?.Storage?.get('card') || {};
            if(card.id) {
                window.open(`${config.apiUrl}?tmdb_id=${card.id}&type=${card.type || 'movie'}`, '_blank');
            } else {
                alert('Откройте карточку полностью');
            }
        };

        document.body.appendChild(button);
        console.log('Button added to DOM');
    };

    // 3. Агрессивный мониторинг
    const forceButton = () => {
        createButton();
        
        // Проверка каждую секунду
        const interval = setInterval(() => {
            if(!isVisible()) {
                console.log('Button not visible, recreating...');
                createButton();
            }
        }, 1000);

        // Через 30 секунд останавливаем проверку
        setTimeout(() => clearInterval(interval), 30000);
    };

    // 4. Запуск
    if(document.readyState === 'complete') {
        forceButton();
    } else {
        window.addEventListener('load', forceButton);
    }

    // 5. Дополнительные гарантии
    document.addEventListener('DOMContentLoaded', forceButton);
    setTimeout(forceButton, 5000);
})();
