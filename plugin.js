const originalRequest = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
    if (/themoviedb\.org/.test(url)) {
        // Удаляем лишний 'https://' при замене
        const newUrl = url
            .replace(/https:\/\/api\.themoviedb\.org\/3/, CONFIG.proxy)
            .replace(/https:\/\/image\.tmdb\.org/, CONFIG.proxy.replace('/3', ''))
            .replace(/http:\/\/api\.themoviedb\.org\/3/, CONFIG.proxy); // На случай HTTP

        console.log('[TMDB Proxy] Перенаправление:', url, '→', newUrl);
        
        this.setRequestHeader('Authorization', 'Basic ' + btoa(
            CONFIG.credentials.username + ':' + CONFIG.credentials.password
        ));
        
        arguments[1] = newUrl; // Подменяем URL
    }
    return originalRequest.apply(this, arguments);
};
