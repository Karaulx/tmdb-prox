(() => {
  const source = {
    name: 'Reyohoho proxy',
    weight: 300,

    search(query) {
      if (!query.title) return Promise.resolve({ list: [] });

      const url = `http://your-server/reyohoho-proxy.php?title=${encodeURIComponent(query.title)}`;

      return fetch(url)
        .then(res => res.json())
        .then(data => {
          if (!data.url) return { list: [] };

          return {
            list: [{
              title: query.title,
              url: data.url,
              source: 'reyohoho',
              type: 'movie',
              info: {}
            }]
          };
        })
        .catch(() => ({ list: [] }));
    },

    play(item) {
      return {
        url: item.url,
        type: item.url?.includes('.m3u8') ? 'hls' : 'mp4'
      };
    }
  };

  // Ждём когда компонент Sources загрузится, потом регистрируем наш источник
  function register() {
    if (window.Lampa && Lampa.Component && Lampa.Component.get('Sources')) {
      Lampa.Component.get('Sources').add(source);
    } else {
      setTimeout(register, 100);
    }
  }

  register();
})();
