(function() {
    // 1. Проверяем, не запускали ли скрипт ранее
    if (window.__rh_super_button) return;
    window.__rh_super_button = true;
    console.log('[RH] Инициализация...');

    // 2. Создаем кнопку с вашим стилем
    const btn = document.createElement('button');
    btn.id = 'rh-super-button';
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

    // 3. Функция для показа диагностики
    function showDebugInfo() {
        let debug = "=== RH DEBUG ===\n";
        
        // Проверяем URL
        const url = window.location.href;
        debug += `URL: ${url}\n`;
        
        // Пытаемся найти ID в URL
        const urlMatch = url.match(/\/(movie|tv)\/(\d+)/);
        if (urlMatch) {
            debug += `✅ Нашли ID в URL: ${urlMatch[2]} (${urlMatch[1]})\n`;
        } else {
            debug += `❌ Не нашли ID в URL\n`;
        }
        
        // Проверяем Lampa
        if (window.Lampa) {
            debug += "✅ Lampa доступна\n";
            try {
                const card = window.Lampa.Storage.get('card');
                if (card?.id) {
                    debug += `✅ Нашли карточку: ID=${card.id}, тип=${card.type}\n`;
                } else {
                    debug += "❌ Нет данных карточки в Storage\n";
                }
            } catch (e) {
                debug += `❌ Ошибка Lampa: ${e.message}\n`;
            }
        } else {
            debug += "❌ Lampa не найдена\n";
        }
        
        return debug;
    }

    // 4. Обработчик клика
    btn.onclick = function() {
        const debugInfo = showDebugInfo();
        
        // Пытаемся получить ID
        let contentId, contentType;
        
        // Сначала из URL
        const urlMatch = window.location.href.match(/\/(movie|tv)\/(\d+)/);
        if (urlMatch) {
            contentId = urlMatch[2];
            contentType = urlMatch[1];
        } 
        // Затем из Lampa
        else if (window.Lampa) {
            try {
                const card = window.Lampa.Storage.get('card');
                if (card?.id) {
                    contentId = card.id;
                    contentType = card.type || 'movie';
                }
            } catch (e) {
                console.error('Lampa error:', e);
            }
        }
        
        if (contentId) {
            const playUrl = `https://api4.rhhhhhhh.live/play?tmdb_id=${contentId}&type=${contentType}`;
            debugInfo += `\nПытаемся открыть: ${playUrl}`;
            
            try {
                window.open(playUrl, '_blank');
                debugInfo += "\n✅ Команда window.open выполнена";
            } catch (e) {
                debugInfo += `\n❌ Ошибка при открытии: ${e.message}`;
            }
        } else {
            debugInfo += "\n❌ Не удалось определить ID контента";
        }
        
        alert(debugInfo);
    };

    // 5. Добавляем кнопку на страницу
    function addButton() {
        if (!document.getElementById('rh-super-button')) {
            document.body.appendChild(btn);
            console.log('[RH] Кнопка добавлена');
        }
    }

    // 6. Запускаем
    if (document.readyState === 'complete') {
        addButton();
    } else {
        window.addEventListener('load', addButton);
    }

    // 7. Защита от удаления
    setInterval(addButton, 1000);
})();
