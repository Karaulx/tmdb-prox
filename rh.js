(function(){
    if(window.lampa_extensions && !window.lampa_extensions.rh_provider) {
        window.lampa_extensions.rh_provider = true;
        
        class RHProvider {
            constructor(){
                this.name = 'RH Video';
                this.id = 'rh';
                this.type = 'plugin';
                this.active = true;
            }

            init(){
                this.apiUrl = 'https://api4.rhhhhhhh.live';
                this.cdnUrl = 'https://hye1eaipby4w.xh8007l.ws';
            }

            getInfo(params){
                return new Promise((resolve) => {
                    if(params.tmdb_id){
                        fetch(`${this.apiUrl}/tmdb_info/${params.tmdb_id}`)
                            .then(r=>r.json())
                            .then(data=>{
                                resolve({
                                    id: params.tmdb_id,
                                    title: data.title || params.title,
                                    year: data.year || params.year,
                                    type: params.type,
                                    source: this.id
                                })
                            })
                            .catch(()=>resolve(false))
                    }
                    else resolve(false)
                })
            }

            getStream(params){
                return new Promise((resolve) => {
                    if(params.tmdb_id){
                        fetch(`${this.apiUrl}/play?tmdb_id=${params.tmdb_id}`)
                            .then(r=>r.json())
                            .then(data=>{
                                if(data.url){
                                    resolve([{
                                        title: 'RH Quality',
                                        url: data.url.replace('{cdn}', this.cdnUrl),
                                        type: params.type === 'movie' ? 'movie' : 'series',
                                        headers: {
                                            'Referer': this.apiUrl,
                                            'Origin': this.apiUrl
                                        }
                                    }])
                                }
                                else resolve([])
                            })
                            .catch(()=>resolve([]))
                    }
                    else resolve([])
                })
            }

            getExternalPlayer(params){
                return Promise.resolve({
                    url: `${this.apiUrl}/play?tmdb_id=${params.tmdb_id}&autoplay=true`,
                    name: this.name
                })
            }
        }

        // Регистрация провайдера
        if(window.plugin_provider) {
            window.plugin_provider(new RHProvider());
        }
        else {
            window.extensions_provider = window.extensions_provider || [];
            window.extensions_provider.push(new RHProvider());
        }

        console.log('RH Provider (TMDB) initialized');
    }
})();
