(function() {
    // 1. Защита от дублирования
    if (window.__rh_ultimate_debug) return;
    window.__rh_ultimate_debug = true;

    // 2. Создаем кнопку (ваш оригинальный стиль)
    function createButton() {
        const btn = document.createElement('button');
        btn.id = 'rh-ultimate-button';
        btn.style.cssText = `
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
            cursor: pointer !important;
        `;
        btn.innerHTML = '<span style="font-size:20px">▶️</span> RH Плеер';
        return btn;
    }

    // 3. Полная отладка получения ID
    function debugContentId() {
        let debugInfo = "=== ГЛУБОКАЯ ОТЛАДКА ===\n";
        let foundId = null;
        let foundType = null;

        // Способ 1: Анализ URL
        const urlPath = window.location.pathname;
        debugInfo += `URL: ${urlPath}\n`;
        const urlMatch = urlPath.match(/\/(movie|tv)\/(\d+)/);
        if (urlMatch) {
            foundId = urlMatch[2];
            foundType = urlMatch[1];
            debugInfo += `✅ Нашли в URL: ID=${foundId} (${foundType})\n`;
        } else {
            debugInfo += `❌ Не нашли ID в URL\n`;
        }

        // Способ 2: Данные Lampa
        if (window.Lampa) {
            try {
                const card = window.Lampa.Storage.get('card');
                debugInfo += `Lampa.Storage: ${card ? "Есть данные" : "Нет данных"}\n`;
                
                if (card?.id) {
                    foundId = card.id;
                    foundType = card.type || 'movie';
                    debugInfo += `✅ Нашли в Lampa: ID=${foundId} (${foundType})\n`;
                }
            } catch (e) {
                debugInfo += `❌ Ошибка Lampa: ${e.message}\n`;
            }
        } else {
            debugInfo += `❌ Lampa не найдена\n`;
        }

        // Способ 3: Анализ DOM
        const domTitle = document.querySelector('.card__title');
        if (domTitle) {
            debugInfo += `DOM Заголовок: "${domTitle.textContent.trim()}"\n`;
        } else {
            debugInfo += `❌ Не нашли заголовок в DOM\n`;
        }

        // Итог
        if (foundId) {
            debugInfo += `\n🎯 Результат: ID=${foundId} (${foundType})`;
        } else {
            debugInfo += `\n🔥 Ошибка: ID не найден! Проверьте:\n1. Полностью откройте карточку\n2. Дождитесь загрузки\n3. Обновите страницу (F5)`;
        }

        return {
            id: foundId,
            type: foundType,
            debug: debugInfo
        };
    }

    // 4. Инициализация
    function init() {
        // Создаем кнопку
        const btn = createButton();
        document.body.appendChild(btn);

        // Обработчик клика
        btn.onclick = function() {
            const {id, type, debug} = debugContentId();
            
            if (id) {
                const playUrl = `https://api4.rhhhhhhh.live/play?tmdb_id=${id}&type=${type}`;
                console.log('Opening:', playUrl);
                
                // Пробуем открыть
                try {
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                        newWindow.location.href = playUrl;
                        alert(`${debug}\n\n✅ Плеер должен открыться в новом окне!`);
                    } else {
                        alert(`${debug}\n\n⚠️ Браузер заблокировал popup. Разрешите всплывающие окна!`);
                    }
                } catch (e) {
                    alert(`${debug}\n\n❌ Ошибка: ${e.message}`);
                }
            } else {
                alert(debug);
            }
        };
    }

    // Запуск
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
