(function(){
    // 1. Защита от дублирования
    if(window.__rh_nuclear_v9) return;
    window.__rh_nuclear_v9 = true;

    console.log('[RH NUCLEAR v9] Initializing nuclear solution');

    // 2. Функция для модификации ядра Lampa
    function injectSource() {
        // 3. Получаем объект Lampa любым способом
        const lampa = window.Lampa || window.top?.Lampa || window.parent?.Lampa;
        if(!lampa) {
            console.warn('[RH NUCLEAR v9] Lampa not found');
            return false;
        }

        console.log('[RH NUCLEAR v9] Lampa found, injecting source...');

        // 4. Создаем наш источник
        const source = {
            name: "RH Nuclear Source",
            id: "rh_nuclear_v9",
            version: "9.0",
            type: "universal",
            priority: 1,
            active: true,
            
            search: function(query, tmdb_id, callback) {
                console.log('[RH NUCLEAR v9] Search:', query, tmdb_id);
                
                // Тестовые данные с реальным работающим видео
                callback([{
                    title: `${query} [RH NUCLEAR TEST]`,
                    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                    quality: "1080p",
                    translation: "оригинал",
                    type: "video",
                    tmdb_id: tmdb_id,
                    iframe: false,
                    external: false,
                    origin: 'RH Source'
                }]);
            },
            
            sources: function(item, callback) {
                this.search(item.title, item.id, callback);
            }
        };

        // 5. Внедряем источник напрямую в механизм поиска Lampa
        try {
            // Вариант 1: Модифицируем Sources если доступен
            if(lampa.Sources && !lampa.Sources.list().find(s => s.id === 'rh_nuclear_v9')) {
                lampa.Sources.add(source);
                console.log('[RH NUCLEAR v9] Injected via Sources.add()');
            }
            
            // Вариант 2: Перехватываем метод поиска
            if(lampa.API?.search) {
                const originalSearch = lampa.API.search;
                lampa.API.search = function(...args) {
                    // Сначала пробуем наш источник
                    const testResults = source.search(args[0], args[1], r => r);
                    if(testResults && testResults.length > 0) {
                        return Promise.resolve(testResults);
                    }
                    // Затем стандартный поиск
                    return originalSearch.apply(this, args);
                };
                console.log('[RH NUCLEAR v9] Search method hijacked');
            }
            
            // Вариант 3: Добавляем в список источников напрямую
            if(lampa.Plugins && Array.isArray(lampa.Plugins)) {
                lampa.Plugins.push(source);
                console.log('[RH NUCLEAR v9] Injected directly to Plugins array');
            }
            
            // Вариант 4: Создаем свою вкладку в интерфейсе
            setTimeout(() => {
                try {
                    if(lampa.Tabs && lampa.Tabs.add) {
                        lampa.Tabs.add({
                            id: 'rh_nuclear_tab',
                            name: 'RH Source',
                            icon: 'plugin',
                            component: {
                                template: `<div>RH Nuclear Source is working!</div>`
                            }
                        });
                        console.log('[RH NUCLEAR v9] Custom tab added');
                    }
                } catch(e) {}
            }, 3000);
            
            return true;
        } catch(e) {
            console.error('[RH NUCLEAR v9] Injection error:', e);
            return false;
        }
    }

    // 6. Проверка успешности внедрения
    function verifyInjection() {
        try {
            const lampa = window.Lampa || window.top?.Lampa;
            if(!lampa) return;

            // Проверяем все возможные места
            let found = false;
            
            if(lampa.Sources) {
                found = lampa.Sources.list().some(s => s.id === 'rh_nuclear_v9');
                console.log('[RH NUCLEAR v9] Check Sources:', found);
            }
            
            if(!found && lampa.Plugins) {
                found = lampa.Plugins.some(p => p.id === 'rh_nuclear_v9');
                console.log('[RH NUCLEAR v9] Check Plugins:', found);
            }
            
            if(!found) {
                console.warn('[RH NUCLEAR v9] Source not found in standard places, trying direct call...');
                try {
                    const testSource = {
                        search: (q, id, cb) => cb([{
                            title: 'Test',
                            url: 'https://test.com/video.mp4',
                            type: 'video'
                        }])
                    };
                    lampa.API.search('Test', 123, console.log);
                } catch(e) {
                    console.error('[RH NUCLEAR v9] Direct test failed:', e);
                }
            }
        } catch(e) {
            console.error('[RH NUCLEAR v9] Verification error:', e);
        }
    }

    // 7. Запускаем внедрение
    if(!injectSource()) {
        const interval = setInterval(() => {
            if(injectSource()) {
                clearInterval(interval);
                // Проверка через 3 секунды после успешного внедрения
                setTimeout(verifyInjection, 3000);
            }
        }, 500);
        
        setTimeout(() => {
            clearInterval(interval);
            console.warn('[RH NUCLEAR v9] Injection timeout');
            verifyInjection();
        }, 10000);
    } else {
        setTimeout(verifyInjection, 3000);
    }

    // 8. Альтернативный метод - переопределение Sources
    setTimeout(() => {
        try {
            const lampa = window.Lampa || window.top?.Lampa;
            if(!lampa || !lampa.Sources) return;

            const originalGet = lampa.Sources.get;
            lampa.Sources.get = function(...args) {
                const original = originalGet.apply(this, args);
                return original.concat([{
                    id: 'rh_nuclear_override',
                    name: 'RH Override',
                    search: (q, id, cb) => cb([{
                        title: `${q} [RH OVERRIDE]`,
                        url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
                        type: 'video',
                        quality: '1080p'
                    }])
                }]);
            };
            console.log('[RH NUCLEAR v9] Sources.get method overridden');
        } catch(e) {
            console.error('[RH NUCLEAR v9] Override error:', e);
        }
    }, 5000);
})();
