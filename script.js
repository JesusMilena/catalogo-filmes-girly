// ─── 1. CONFIGURAÇÃO DO FIREBASE (Lembre de colocar suas chaves reais aqui!) ───
const firebaseConfig = {
  apiKey: "AIzaSyASEp0zs9bdo7Yy5sYEU9VN3M49I1wGNEw",
  authDomain: "catalogo-filmes-girly.firebaseapp.com",
  projectId: "catalogo-filmes-girly",
  storageBucket: "catalogo-filmes-girly.firebasestorage.app",
  messagingSenderId: "1012108821991",
  appId: "1:1012108821991:web:564c7aa527a3adedf2a942",
  measurementId: "G-6T71FPHW9G"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ─── 2. CONFIGURAÇÃO DA API TMDB ───
const API_KEY = '71941f7a1e27c838acd0a335b5bae03d'; 
const URL_ROMANCE = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=10749&language=pt-BR`;
const URL_COMEDIA = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=35&language=pt-BR`;

// ─── 3. FUNÇÕES DE INTERFACE (MENU E BANNER) ───

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.style.width = sidebar.style.width === "250px" ? "0" : "250px";
}

async function carregarBannerDestaque() {
    try {
        const resposta = await fetch(URL_ROMANCE);
        const dados = await resposta.json();
        const filme = dados.results[Math.floor(Math.random() * dados.results.length)];
        
        const bannerUrl = `https://image.tmdb.org/t/p/original${filme.backdrop_path}`;
        const bannerElement = document.getElementById('hero-banner');
        
        bannerElement.style.backgroundImage = `linear-gradient(to top, #fff0f5 10%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%), url('${bannerUrl}')`;
        document.getElementById('hero-title').innerText = filme.title;
        document.getElementById('hero-overview').innerText = filme.overview ? filme.overview.substring(0, 150) + '...' : 'Sem sinopse.';
        
        // CORREÇÃO AQUI: Adicionamos o id e a sinopse no clique do banner
        document.getElementById('hero-fav-btn').onclick = () => favoritarFilme(
            filme.id, 
            filme.title.replace(/'/g, "\\'"), 
            filme.poster_path, 
            filme.vote_average, 
            filme.overview ? filme.overview.replace(/'/g, "\\'") : ""
        );
    } catch (erro) {
        console.error("Erro ao carregar banner:", erro);
    }
}

// ─── 4. LÓGICA DE FILMES E CATEGORIAS ───

function criarCardFilme(filme) {
    const card = document.createElement('div');
    card.classList.add('movie-card');
    const imgUrl = filme.poster_path ? `https://image.tmdb.org/t/p/w500${filme.poster_path}` : 'https://placehold.co/500x750/ffb6c1/ffffff?text=Sem+Imagem';

    // CORREÇÃO AQUI: Passamos os 5 parâmetros para a função favoritarFilme
    const tituloLimpo = filme.title.replace(/'/g, "\\'");
    const sinopseLimpa = filme.overview ? filme.overview.replace(/'/g, "\\'") : "Sinopse não disponível.";

    card.innerHTML = `
        <img src="${imgUrl}" alt="${filme.title}">
        <div class="movie-info">
            <h3>${filme.title}</h3>
            <p class="nota">⭐ ${filme.vote_average ? filme.vote_average.toFixed(1) : 'N/A'}</p>
            <p class="sinopse">${filme.overview ? filme.overview.substring(0, 80) + '...' : 'Sinopse não disponível.'}</p>
            <button class="fav-btn" onclick="favoritarFilme(${filme.id}, '${tituloLimpo}', '${filme.poster_path}', ${filme.vote_average}, '${sinopseLimpa}')">❤️ Favoritar</button>
        </div>
    `;
    return card;
}


async function carregarCategorias() {
    try {
        const resRomance = await fetch(URL_ROMANCE);
        const dadosRomance = await resRomance.json();
        dadosRomance.results.forEach(filme => document.getElementById('romance-list').appendChild(criarCardFilme(filme)));

        const resComedia = await fetch(URL_COMEDIA);
        const dadosComedia = await resComedia.json();
        dadosComedia.results.forEach(filme => document.getElementById('comedia-list').appendChild(criarCardFilme(filme)));
    } catch (erro) {
        console.error("Erro ao carregar categorias:", erro);
    }
}

async function filtrarPorGenero(idGenero, nomeGenero) {
    toggleSidebar();
    const sectionBusca = document.getElementById('section-busca');
    const containerBusca = document.getElementById('resultado-busca');
    document.getElementById('titulo-busca').innerText = nomeGenero;
    
    try {
        const resposta = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${idGenero}&language=pt-BR`);
        const dados = await resposta.json();
        containerBusca.innerHTML = ""; 
        sectionBusca.style.display = "block";
        dados.results.forEach(filme => containerBusca.appendChild(criarCardFilme(filme)));
        sectionBusca.scrollIntoView({ behavior: 'smooth' });
    } catch (erro) { console.error(erro); }
}

async function buscarFilmes() {
    const termo = document.getElementById('busca').value;
    const sectionBusca = document.getElementById('section-busca');
    const containerBusca = document.getElementById('resultado-busca');
    
    if (termo.trim() === "") { sectionBusca.style.display = "none"; return; } 

    try {
        const resposta = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${termo}`);
        const dados = await resposta.json();
        containerBusca.innerHTML = ""; 
        if(dados.results.length > 0) {
            sectionBusca.style.display = "block";
            document.getElementById('titulo-busca').innerText = "🔍 Resultados";
            dados.results.forEach(filme => containerBusca.appendChild(criarCardFilme(filme)));
        }
    } catch (erro) { console.error(erro); }
}

// ─── 5. LOGICA DO FIREBASE ───

async function favoritarFilme(id, titulo, posterPath, nota, sinopse) {
    if (!id) return;

    try {
        await db.collection("favoritos").doc(id.toString()).set({
            id: id,
            title: titulo,
            poster_path: posterPath,
            vote_average: nota,
            overview: sinopse, 
            data_salva: new Date()
        });
        alert(`"${titulo}" salvo nos favoritos! 💕`);
    } catch (erro) {
        console.error("Erro ao salvar no Firebase:", erro);
        alert("Ops! Erro ao favoritar.");
    }
}

function escutarFavoritos() {
    db.collection("favoritos").orderBy("data_salva", "desc").onSnapshot((snapshot) => {
        const lista = document.getElementById('favoritos-list');
        lista.innerHTML = ""; 
        
        if(snapshot.empty) {
            lista.innerHTML = "<p style='padding:20px;'>Nenhum favorito ainda.</p>";
            return;
        }

        snapshot.forEach((doc) => {
            const filme = doc.data();
            const card = criarCardFilme(filme);
            
            const btn = card.querySelector('.fav-btn');
            
            btn.innerHTML = "🗑️ Remover";
            btn.style.backgroundColor = "#8b7d7b"; // Um tom mais neutro/cinza para diferenciar
            btn.onclick = () => removerFavorito(filme.id, filme.title);

            lista.appendChild(card);
        });
    });
}

function scrollCarousel(carouselId, scrollAmount) {
    document.getElementById(carouselId).scrollBy({ left: scrollAmount, behavior: 'smooth' });
}
async function removerFavorito(id, titulo) {
    // Pergunta se o usuário tem certeza
    if (confirm(`Deseja remover "${titulo}" dos favoritos?`)) {
        try {
            await db.collection("favoritos").doc(id.toString()).delete();
            alert("Removido com sucesso! 💔");
        } catch (erro) {
            console.error("Erro ao remover:", erro);
            alert("Erro ao remover favorito.");
        }
    }
}

// Inicialização
carregarCategorias();
carregarBannerDestaque();
escutarFavoritos();