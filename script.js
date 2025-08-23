document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Documento cargado. Escuchando evento de clic en el botón...');

    const bookInput = document.getElementById('book-input');
    const searchButton = document.getElementById('search-button');
    const resultsSection = document.getElementById('results-section');
    const mapContainer = document.getElementById('map-container');
    const imageGallery = document.getElementById('image-gallery');
    const fictionalSection = document.getElementById('fictional-section');
    const fictionalGallery = document.getElementById('fictional-gallery');
    const feedbackButton = document.getElementById('feedback-button');

    const latestSnapsSection = document.getElementById('latest-snaps');
    const latestSnapsContainer = document.getElementById('latest-snaps-container');

    let map;

    searchButton.addEventListener('click', async () => {
    console.log('➡️ Clic en el botón detectado. Iniciando búsqueda...');
    const query = bookInput.value.trim();
    if (query) {
        console.log('🔎 Enviando consulta al backend:', query);

        try {
            const response = await fetch('http://localhost:3000/search-places', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📦 Datos recibidos del backend:', data);

            // Mostrar la portada si existe
            if (data.coverUrl) {
                const coverImg = document.createElement('img');
                coverImg.src = data.coverUrl;
                coverImg.alt = `Portada de ${query}`;
                document.getElementById('book-cover-container').innerHTML = ''; // Limpiar el contenedor
                document.getElementById('book-cover-container').appendChild(coverImg);
            } else {
                document.getElementById('book-cover-container').innerHTML = '';
            }

            if (data.real.length > 0) {
                console.log('🗺️ Mostrando lugares reales en el mapa...');
                displayRealLocations(data.real);
                resultsSection.classList.remove('hidden');
            } else {
                resultsSection.classList.add('hidden');
            }

            if (data.fictional.length > 0) {
                console.log('🏰 Mostrando lugares ficticios generados...');
                displayFictionalLocations(data.fictional);
                fictionalSection.classList.remove('hidden');
            } else {
                fictionalSection.classList.add('hidden');
            }
        } catch (error) {
            console.error('❌ Error al conectar con el backend:', error);
            alert('No se pudo conectar con el servidor. Asegúrate de que tu backend esté ejecutándose.');
        }
    } else {
        alert('Por favor, ingresa el nombre de un libro o un pasaje.');
    }
});

    feedbackButton.addEventListener('click', () => {
        const subject = "Feedback sobre Explorador de Mundos Literarios";
        const body = "Escribe aquí tu feedback o sugerencias:\n\n";
        const mailtoLink = `mailto:lpomata@hotmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    });

    async function displayRealLocations(locations) {
        console.log('➡️ Función displayRealLocations iniciada.');
        if (!map) {
            console.log('🗺️ El mapa no existe, inicializándolo...');
            map = L.map('map-container').setView([0, 0], 2);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            console.log('✔️ Mapa inicializado correctamente.');
        } else {
            console.log('🧹 Limpiando marcadores de mapa anteriores.');
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) map.removeLayer(layer);
            });
        }

        imageGallery.innerHTML = '';
        for (const location of locations) {
            console.log(`➡️ Procesando lugar: ${location.name}`);
            try {
                const marker = L.marker([location.lat, location.lon]).addTo(map);
                marker.bindPopup(location.name).openPopup();
                map.setView([location.lat, location.lon], 8);

                if (location.imageUrl) {
                    console.log('🖼️ Imagen obtenida:', location.imageUrl);
                    const imgElement = document.createElement('img');
                    imgElement.src = location.imageUrl;
                    imgElement.alt = `Imagen de ${location.name}`;
                    imageGallery.appendChild(imgElement);
                    addSnapshot(location.imageUrl);
                }
            } catch (error) {
                console.error(`❌ Error al procesar ${location.name}:`, error);
            }
        }
    }

    async function displayFictionalLocations(locations) {
        console.log('➡️ Función displayFictionalLocations iniciada.');
        fictionalGallery.innerHTML = '';
        for (const location of locations) {
            console.log(`🏰 Procesando lugar ficticio: ${location.name}`);
            if (location.imageUrl) {
                console.log('🖼️ Imagen ficticia obtenida:', location.imageUrl);
                const imgElement = document.createElement('img');
                imgElement.src = location.imageUrl;
                imgElement.alt = `Imagen de ${location.name} (ficticio)`;
                fictionalGallery.appendChild(imgElement);
                addSnapshot(location.imageUrl);
            }
        }
    }

    function addSnapshot(imageUrl) {
        const snapDiv = document.createElement('div');
        snapDiv.classList.add('snap-item');
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        snapDiv.appendChild(imgElement);
        
        if (latestSnapsContainer.firstChild) {
            latestSnapsContainer.insertBefore(snapDiv, latestSnapsContainer.firstChild);
        } else {
            latestSnapsContainer.appendChild(snapDiv);
        }

        while (latestSnapsContainer.children.length > 5) {
            latestSnapsContainer.removeChild(latestSnapsContainer.lastChild);
        }
        latestSnapsSection.classList.remove('hidden');
    }
});