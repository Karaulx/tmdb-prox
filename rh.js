(function (  ) {
    'use strict';

    function startPlugin() {
      window.ReYohohoFixed = true;

    waitForLampa(function() {
        // ТОЧНАЯ КОПИЯ вашего первоначального кода ▼▼▼
        async function handleReYohohoPlay(data) {
            const movie = data.movie;
            const type = movie.name ? 'tv' : 'movie';
            
            try {
                const contentUrl = `https://reyohoho.github.io/${type}/${movie.tmdb_id || movie.kinopoisk_id}`;
                const html = await fetch(contentUrl).then(r => r.text());
                const videoUrl = extractVideoUrl(html);
                if (!videoUrl) throw new Error('Ссылка на видео не найдена');
                
                Lampa.Player.play(videoUrl, {
                    title: movie.title || movie.name,
                    external: false,
                    headers: {
                        'Referer': 'https://reyohoho.github.io/',
                        'Origin': 'https://reyohoho.github.io'
                    }
                });
                
            } catch (error) {
                console.error('ReYohoho error:', error);
                Lampa.Noty.show('Не удалось начать воспроизведение');
                
                const playerUrl = `https://reyohoho.github.io/player.html?id=${movie.tmdb_id || movie.kinopoisk_id}&type=${type}`;
                Lampa.Player.play(playerUrl, {
                    title: movie.title || movie.name,
                    external: false
                });
            }
        }

        function extractVideoUrl(html) {
            const regex = /(https?:\/\/[^\s"'<>]+\.(m3u8|mp4|mkv|webm)[^\s"'<>]*)/i;
            const match = html.match(regex);
            return match ? match[0] : null;
        }
        // ▲▲▲ Код выше полностью идентичен вашему первоначальному варианту

  if (window.appready) add(); else {
        Lampa.Listener.follow('app', function (e) {
          if (e.type == 'ready') { add(); }
        });
      }
    }

    if (!window.plugin_torrents_ready) startPlugin();

})( );
