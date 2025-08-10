(function(){
    // 1. Создаем кнопку в любом случае
    const btn = document.createElement('button');
    btn.id = 'rh-universal-btn';
    btn.style.cssText = `
        position: fixed !important;
        right: 20px !important;
        bottom: 80px !important;
        z-index: 99999 !important;
        background: #FF0000 !important;
        color: white !important;
        padding: 12px 24px !important;
        border-radius: 8px !important;
        font-size: 16px !important;
        font-weight: bold !important;
        cursor: pointer !important;
    `;
    btn.textContent = '▶️ RH Universal Player';
    document.body.appendChild(btn);

    // 2. Все возможные способы получить ID
    const getId = () => {
        // Способ 1: Из URL
        const urlMatch = window.location.href.match(/\/(movie|tv)\/(\d+)/);
        if(urlMatch) return {id: urlMatch[2], type: urlMatch[1]};
        
        // Способ 2: Из API запросов на странице
        const apiCalls = Array.from(performance.getEntriesByType("resource"))
            .filter(r => r.name.includes('themoviedb'));
        
        for(let call of apiCalls) {
            const match = call.name.match(/(movie|tv)\/(\d+)/);
            if(match) return {id: match[2], type: match[1]};
        }
        
        return null;
    };

    // 3. Резервные плееры
    const backupPlayers = [
        `https://v2.vidsrc.me/embed/${getId()?.id}`,
        `https://www.2embed.cc/embed/${getId()?.id}`,
        `https://multiembed.mov/?video_id=${getId()?.id}`
    ];

    // 4. Обработчик клика
    btn.onclick = () => {
        const idData = getId();
        
        if(idData) {
            // Пробуем ваш API
            const yourApiUrl = `https://api4.rhhhhhhh.live/play?tmdb_id=${idData.id}&type=${idData.type}`;
            
            // Пробуем открыть ваш API
            window.open(yourApiUrl, '_blank');
            
            // Если не получилось через 2 секунды - предлагаем альтернативы
            setTimeout(() => {
                if(confirm('Не удалось загрузить. Попробовать резервный плеер?')) {
                    const randomPlayer = backupPlayers[Math.floor(Math.random() * backupPlayers.length)];
                    window.open(randomPlayer, '_blank');
                }
            }, 2000);
        } else {
            alert('ID не найден. Откройте карточку полностью и попробуйте снова.');
        }
    };

    console.log('Universal RH Player activated');
})();
