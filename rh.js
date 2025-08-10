(function() {
    // 1. Проверяем, не запускали ли мы уже этот скрипт
    if (window.__rh_final_button) return;
    window.__rh_final_button = true;
    
    // 2. Функция для показа уведомлений
    function showAlert(message) {
        alert('RH DEBUG:\n' + message);
    }

    // 3. Создаем кнопку (ваш оригинальный стиль)
    function createButton() {
        const btn = document.createElement('button');
        btn.id = 'rh-final-btn';
        
        // Ваши стили
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
        `;
        
        btn.innerHTML = '<span style="font-size:20px">▶️</span> RH Плеер';
        return btn;
    }

    // 4. Основная функция при клике
    function onButtonClick() {
        let debugInfo = '';
        
        // Проверяем URL страницы
        const path = window.location.pathname;
        debugInfo += `Текущий URL: ${path}\n`;
        
        // Пытаемся определить ID и тип контента
        let contentId, contentType;
        
        // Вариант 1: Из URL (/movie/123 или /tv/456)
        const urlMatch = path.match(/\/(movie|tv)\/(\d+)/);
        if (urlMatch) {
            contentType = urlMatch[1];
            contentId = urlMatch[2];
            debugInfo += `Нашли ID в URL: ${contentId} (тип: ${contentType})\n`;
        }
        
        // Вариант 2: Из данных Lampa
        if (!contentId && window.Lampa) {
            try {
                const card = window.Lampa.Storage.get('card');
                if (card && card.id) {
                    contentId = card.id;
                    contentType = card.type || 'movie';
                    debugInfo += `Нашли ID в Lampa: ${contentId} (тип: ${contentType})\n`;
                }
            } catch (e) {
                debugInfo += `Ошибка при чтении данных Lampa: ${e.message}\n`;
            }
        }
        
        if (contentId) {
            const playUrl = `https://api4.rhhhhhhh.live/play?tmdb_id=${contentId}&type=${contentType}`;
            debugInfo += `Пытаемся открыть: ${playUrl}\n`;
            
            // Пробуем открыть плеер
            try {
                window.open(playUrl, '_blank');
                debugInfo += 'Успешно вызвали window.open\n';
            } catch (e) {
                debugInfo += `Ошибка при открытии: ${e.message}\n`;
            }
        } else {
            debugInfo += 'Не удалось определить ID контента\n';
            debugInfo += '1. Полностью откройте карточку фильма/сериала\n';
            debugInfo += '2. Дождитесь загрузки\n';
            debugInfo += '3. Попробуйте снова';
        }
        
        showAlert(debugInfo);
    }

    // 5. Добавляем кнопку на страницу
    function addButton() {
        // Проверяем, не добавлена ли кнопка
        if (document.getElementById('rh-final-btn')) return;
        
        const btn = createButton();
        btn.onclick = onButtonClick;
        document.body.appendChild(btn);
        
        showAlert('Кнопка успешно добавлена!\nНажмите на нее для диагностики.');
    }

    // 6. Запускаем
    if (document.readyState === 'complete') {
        addButton();
    } else {
        window.addEventListener('load', addButton);
    }
})();
