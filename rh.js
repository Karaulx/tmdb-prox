(function() {
    // 1. Защита от повторного запуска
    if (window.__rh_button_final) return;
    window.__rh_button_final = true;
    
    // 2. Создаем контейнер для диагностики
    const createDebugPanel = () => {
        const panel = document.createElement('div');
        panel.id = 'rh-debug-panel';
        panel.style.cssText = `
            position: fixed;
            left: 20px;
            bottom: 20px;
            z-index: 999999;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: Arial;
            max-width: 300px;
            display: none;
        `;
        document.body.appendChild(panel);
        return panel;
    };

    // 3. Ваша кнопка с улучшениями
    const createButton = () => {
        const btn = document.createElement('button');
        btn.id = 'rh-main-button';
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
        return btn;
    };

    // 4. Логика работы
    const init = () => {
        // Создаем элементы
        const debugPanel = createDebugPanel();
        const btn = createButton();
        document.body.appendChild(btn);
        
        // Функция диагностики
        const checkSystem = () => {
            let report = '';
            
            // Проверяем URL
            const url = window.location.href;
            report += `URL: ${url}\n`;
            
            // Пытаемся получить ID
            let contentId, contentType;
            
            // Из URL
            const urlMatch = url.match(/\/(movie|tv)\/(\d+)/);
            if (urlMatch) {
                contentType = urlMatch[1];
                contentId = urlMatch[2];
                report += `ID из URL: ${contentId} (${contentType})\n`;
            }
            
            // Из Lampa
            if (window.Lampa) {
                try {
                    const card = window.Lampa.Storage.get('card');
                    if (card?.id) {
                        contentId = card.id;
                        contentType = card.type || 'movie';
                        report += `ID из Lampa: ${contentId} (${contentType})\n`;
                    }
                } catch (e) {
                    report += `Ошибка Lampa: ${e.message}\n`;
                }
            }
            
            return {report, contentId, contentType};
        };
        
        // Обработчик клика
        btn.onclick = () => {
            const {report, contentId, contentType} = checkSystem();
            
            if (contentId) {
                const playUrl = `https://api4.rhhhhhhh.live/play?tmdb_id=${contentId}&type=${contentType}`;
                
                // Пробуем открыть
                try {
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                        newWindow.location.href = playUrl;
                        debugPanel.innerHTML = `${report}\n\nУспешно открыли плеер!`;
                    } else {
                        debugPanel.innerHTML = `${report}\n\nБраузер заблокировал открытие окна. Разрешите всплывающие окна.`;
                    }
                } catch (e) {
                    debugPanel.innerHTML = `${report}\n\nОшибка: ${e.message}`;
                }
            } else {
                debugPanel.innerHTML = `${report}\n\nНе найден ID контента. Откройте карточку полностью.`;
            }
            
            // Показываем панель диагностики
            debugPanel.style.display = 'block';
            setTimeout(() => { debugPanel.style.display = 'none'; }, 5000);
        };
        
        // Кнопка закрытия диагностики
        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 10px;
            cursor: pointer;
            font-size: 20px;
        `;
        closeBtn.onclick = () => {
            debugPanel.style.display = 'none';
        };
        debugPanel.appendChild(closeBtn);
        
        console.log('RH Player Button initialized');
    };
    
    // Запускаем когда страница загрузится
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
