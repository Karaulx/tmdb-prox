class ReYohohoProvider {
  async getUrl(params) {
    // 1. Получаем reyohohoId из TMDB ID (как в предыдущих примерах)
    const reyohohoId = await this.convertTmdbToReYohoho(params.tmdb_id);

    // 2. Извлекаем поток
    const streamUrl = await this.extractStream(reyohohoId);

    return {
      url: streamUrl,
      name: 'ReYohoho (Direct)',
      title: params.title
    };
  }

  async extractStream(reyohohoId) {
    try {
      // Вариант 1: Через парсинг страницы
      const pageUrl = `https://reyohoho.github.io/reyohoho/movie/${reyohohoId}`;
      const html = await (await fetch(`https://cors-proxy/?url=${encodeURIComponent(pageUrl)}`)).text();
      const m3u8Match = html.match(/(https?:\/\/[^\s]+\.m3u8)/);
      return m3u8Match ? m3u8Match[0] : null;

      // Вариант 2: Через API (если есть)
      // const apiResponse = await fetch(`https://api.reyohoho.live/stream?id=${reyohohoId}`);
      // return apiResponse.json().url;
    } catch (e) {
      console.error("Ошибка извлечения потока:", e);
      return null;
    }
  }
}
