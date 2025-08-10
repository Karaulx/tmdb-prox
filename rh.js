(function(){
    if(window.__rh_full_debug) return;
    window.__rh_full_debug = true;
    
    console.log('[RH FULL DEBUG] Init');

    // Конфигурация
    const config = {
        name: "▶️ RH Плеер",
        apiUrl: "https://api4.rhhhhhhh.live/play",
        btnId: "rh-debug-btn",
        debug: true
    };

    // 1. Стиль с гарантированной видимостью
    const style = document.createElement('style');
    style.textContent = `
        #${config.btnId} {
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
        }
        #${config.btnId}:hover {
            opacity: 0.9 !important;
        }
    `;
    document.head.appendChild(style);

    // 2. Функция логирования
    const log = (message) => {
        if(config.debug) {
            console.log(`[RH DEBUG] ${message}`);
            // Дополнительно можно отправлять логи на сервер
        }
    };

    // 3. Получение данных карточки
    const getCardData = () => {
        try {
            const card = window.Lampa?.Storage?.get('card') || {};
            if(card.id) {
                log(`Card data: ${JSON.stringify(card)}`);
                return card;
            }
            
            // Альтернативные методы
            const urlMatch = window.location.href.match(/\/(movie|tv)\/(\d+)/);
            if(urlMatch) {
                return {id: urlMatch[2], type: urlMatch[1]};
            }
            
            return null;
        } catch(e) {
            log(`Error getting card: ${e.message}`);
            return null;
        }
    };

    // 4. Создание кнопки с полной диагностикой
    const createButton = () => {
        // Удаляем старую кнопку если есть
        const oldBtn = document.getElementById(config.btnId);
        if(oldBtn) {
            log('Removing old button');
            oldBtn.remove();
        }

        // Создаем новую кнопку
        const btn = document.createElement('button');
        btn.id = config.btnId;
        btn.textContent = config.name;
        
        // Вешаем несколько обработчиков для диагностики
        btn.addEventListener('click', () => {
            log('Button clicked (click event)');
            handleClick();
        });
        
        btn.onmousedown = () => log('Button mouse down');
        btn.onmouseup = () => log('Button mouse up');
        
        document.body.appendChild(btn);
        log('Button created');
    };

    // 5. Обработчик клика с диагностикой
    const handleClick = () => {
        log('HandleClick started');
        
        const card = getCardData();
        if(!card?.id) {
            log('No card ID available');
            alert('Данные карточки не загружены. Пожалуйста, откройте карточку полностью и попробуйте снова.');
            return;
        }

        log(`Sending request with ID: ${card.id}`);
        
        // Формируем URL с timestamp для избежания кеширования
        const params = new URLSearchParams({
            tmdb_id: card.id,
            type: card.type || 'movie',
            _: Date.now() // Добавляем timestamp
        });
        
        const url = `${config.apiUrl}?${params.toString()}`;
        log(`Final URL: ${url}`);
        
        // Открываем в новом окне с принудительным обходом кеша
        const newWindow = window.open('', '_blank');
        if(newWindow) {
            newWindow.location = url;
            log('New window opened');
        } else {
            log('Window blocked by popup blocker');
            alert('Пожалуйста, разрешите всплывающие окна для этого сайта');
        }
    };

    // 6. Инициализация с несколькими проверками
    const init = () => {
        log('Initialization started');
        
        createButton();
        
        // Проверка каждые 2 секунды
        const interval = setInterval(() => {
            if(!document.getElementById(config.btnId)) {
                log('Button missing, recreating...');
                createButton();
            }
        }, 2000);
        
        // Остановка через 30 секунд
        setTimeout(() => {
            clearInterval(interval);
            log('Initialization completed');
        }, 30000);
    };

    // Запускаем при полной загрузке
    if(document.readyState === 'complete') {
        setTimeout(init, 500);
    } else {
        window.addEventListener('load', () => setTimeout(init, 500));
    }
    
    // Дублирующий запуск для надежности
    setTimeout(init, 3000);
})();
