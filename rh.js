(() => {
  const source = {
    name: 'Reyohoho proxy',
    weight: 300, // приоритет источника

    search: (query) => {
      if (!query.title) return Promise.resolve({list: []});

      const url = `http://your-server/reyohoho-proxy.php?title=${encodeURIComponent(query.title)}`;

      return fetch(url)
        .then(res => res.json())
        .then(data => {
          if (!data.url) return {list: []};

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
        .catch(() => ({list: []}));
    },

    play: (item) => {
      return {
        url: item.url,
        type: 'hls' // или 'mp4' в зависимости от ссылки
      };
    }
  };

  if (window.Lampa && Lampa.Source) {
    Lampa.Source.add(source);
  } else {
    console.warn('Lampa.Source не найден, добавляем позже');
    document.addEventListener('lampa-ready', () => {
      Lampa.Source.add(source);
    });
  }
})();
