(function(){
    if(window.__rh_guaranteed_loader) return;
    window.__rh_guaranteed_loader = true;

    console.log('[RH GUARANTEED LOADER] Initializing');

    // 1. Конфигурация
    const config = {
        name: "▶️ Смотреть",
        apiUrl: "https://api4.rhhhhhhh.live/play",
        btnId: "rh-guaranteed-btn",
        retryDelay: 500,
        maxRetries: 20 // 10 секунд максимум
    };

    // 2. Создаем кнопку с абсолютным позиционированием
    const createButton = () => {
        const btn = document.createElement('button');
        btn.id = config.btnId;
        btn.textContent = config.name;
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

    // 3. Получаем TMDB ID всеми возможными способами
    const getTmdbId = () => {
        // Способ 1: Через Lampa Storage
        try {
            const card = window.Lampa?.Storage?.get('card');
            if(card?.id) return {id: card.id, type: card.type || 'movie'};
        } catch(e) {}

        // Способ 2: Из URL страницы
        const urlMatch = window.location.href.match(/\/(movie|tv)\/(\d+)/);
        if(urlMatch) return {id: urlMatch[2], type: urlMatch[1]};

        // Способ 3: Из meta-тегов
        const metaId = document.querySelector('meta[property="tmdb:id"], meta[name="tmdb_id"]');
        if(metaId) {
            return {
                id: metaId.getAttribute('content') || metaId.getAttribute('value'),
                type: document.querySelector('meta[property="tmdb:type"]')?.content || 'movie'
            };
        }

        return null;
    };

    // 4. Основная функция
    const init = (retryCount = 0) => {
        const tmdbData = getTmdbId();
        const btn = document.getElementById(config.btnId) || createButton();

        if(tmdbData?.id) {
            // Если ID получен - настраиваем кнопку
            btn.onclick = () => {
                const params = new URLSearchParams({
                    tmdb_id: tmdbData.id,
                    type: tmdbData.type,
                    _: Date.now() // Для избежания кеширования
                });
                window.open(`${config.apiUrl}?${params.toString()}`, '_blank');
            };
            btn.style.display = 'block';
            console.log(`TMDB ID found: ${tmdbData.id}`);
        } else if(retryCount < config.maxRetries) {
            // Если ID еще не доступен - повторяем попытку
            btn.style.display = 'none';
            setTimeout(() => init(retryCount + 1), config.retryDelay);
        } else {
            // Превышено количество попыток
            btn.style.display = 'block';
            btn.onclick = () => alert('Не удалось получить данные карточки. Пожалуйста, обновите страницу.');
            console.warn('Failed to get TMDB ID after retries');
        }
    };

    // 5. Запускаем при полной загрузке страницы
    if(document.readyState === 'complete') {
        setTimeout(init, 1000);
    } else {
        window.addEventListener('load', () => setTimeout(init, 1000));
    }

    // 6. Дополнительный запуск через 3 секунды для надежности
    setTimeout(init, 3000);
})();
