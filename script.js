const API_KEY = '71941f7a1e27c838acd0a335b5bae03d'; 
const URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`;

async function carregarFilmes() {
    try {
        const resposta = await fetch(URL); // Faz a requisição à API (Fetch API) [cite: 9]
        const dados = await resposta.json();
        const lista = document.getElementById('lista-filmes');

        dados.results.forEach(filme => {
            const card = document.createElement('div');
            card.classList.add('movie-card');

            // Criação dinâmica dos elementos (Manipulação de DOM) [cite: 46]
card.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" alt="${filme.title}">
    <div class="movie-info">
        <h3>${filme.title}</h3>
        <p class="nota">⭐ ${filme.vote_average.toFixed(1)}</p>
        <p class="sinopse">${filme.overview ? filme.overview.substring(0, 100) + '...' : 'Sinopse não disponível.'}</p>
    </div>
`;
            lista.appendChild(card);
        });
    } catch (erro) {
        console.error("Erro ao carregar filmes:", erro);
    }
}
async function buscarFilmes() {
    const termo = document.getElementById('busca').value;
    if (termo === "") return; 

    const URL_BUSCA = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${termo}`;
    
    try {
        const resposta = await fetch(URL_BUSCA);
        const dados = await resposta.json();
        
        const lista = document.getElementById('lista-filmes');
        lista.innerHTML = ""; 

        dados.results.forEach(filme => {
            const card = document.createElement('div');
            card.classList.add('movie-card');

            // Aqui está a correção: usamos exatamente a mesma estrutura da página principal
            card.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" alt="${filme.title}">
                <div class="movie-info">
                    <h3>${filme.title}</h3>
                    <p class="nota">⭐ ${filme.vote_average.toFixed(1)}</p>
                    <p class="sinopse">${filme.overview ? filme.overview : 'Sinopse não disponível.'}</p>
                </div>
            `;
            lista.appendChild(card);
        });
    } catch (erro) {
        console.error("Erro na busca:", erro);
    }
}

carregarFilmes();