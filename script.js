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
            console.log('🔎 Buscando lugares en:', query);

            const extractedLocations = await simulateNLPExtraction(query);
            console.log('📦 Lugares extraídos (simulado):', extractedLocations);

            if (extractedLocations.real.length > 0) {
                console.log('🗺️ Mostrando lugares reales en el mapa...');
                displayRealLocations(extractedLocations.real);
                resultsSection.classList.remove('hidden');
            } else {
                resultsSection.classList.add('hidden');
            }

            if (extractedLocations.fictional.length > 0) {
                console.log('🏰 Mostrando lugares ficticios generados...');
                displayFictionalLocations(extractedLocations.fictional);
                fictionalSection.classList.remove('hidden');
            } else {
                fictionalSection.classList.add('hidden');
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

    async function simulateNLPExtraction(text) {
        const lowerText = text.toLowerCase();
        let realPlaces = [];
        let fictionalPlaces = [];

        if (lowerText.includes('paris')) {
            realPlaces.push('París, Francia');
        }
        if (lowerText.includes('londres')) {
            realPlaces.push('Londres, Reino Unido');
        }
        if (lowerText.includes('nueva york')) {
            realPlaces.push('Nueva York, EE.UU.');
        }
        
        if (lowerText.includes('castillo') && lowerText.includes('botes') && lowerText.includes('lago')) {
            fictionalPlaces.push('El Castillo de Hogwarts');
        } else if (lowerText.includes('shire') || lowerText.includes('rivendel')) {
            fictionalPlaces.push('La Comarca', 'Rivendel');
        }
        
        return { real: realPlaces, fictional: fictionalPlaces };
    }

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
            console.log(`➡️ Procesando lugar: ${location}`);
            try {
                const coordinates = await getCoordinates(location);
                if (coordinates) {
                    console.log('📍 Coordenadas obtenidas:', coordinates);
                    const marker = L.marker([coordinates.latitude, coordinates.longitude]).addTo(map);
                    marker.bindPopup(location).openPopup();
                    map.setView([coordinates.latitude, coordinates.longitude], 8);

                    const imageUrl = await fetchImage(location);
                    if (imageUrl) {
                        console.log('🖼️ Imagen obtenida:', imageUrl);
                        const imgElement = document.createElement('img');
                        imgElement.src = imageUrl;
                        imgElement.alt = `Imagen de ${location}`;
                        imageGallery.appendChild(imgElement);
                        addSnapshot(imageUrl);
                    }
                }
            } catch (error) {
                console.error(`❌ Error al procesar ${location}:`, error);
            }
        }
    }

    async function displayFictionalLocations(locations) {
        console.log('➡️ Función displayFictionalLocations iniciada.');
        fictionalGallery.innerHTML = '';
        for (const location of locations) {
            console.log(`🏰 Procesando lugar ficticio: ${location}`);
            const fictionalImageUrl = await generateFictionalImage(location);
            if (fictionalImageUrl) {
                console.log('🖼️ Imagen ficticia obtenida:', fictionalImageUrl);
                const imgElement = document.createElement('img');
                imgElement.src = fictionalImageUrl;
                imgElement.alt = `Imagen de ${location} (ficticio)`;
                fictionalGallery.appendChild(imgElement);
                addSnapshot(fictionalImageUrl);
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

    async function getCoordinates(location) {
        const locationLower = location.toLowerCase();
        if (locationLower.includes('parís')) return { latitude: 48.8566, longitude: 2.3522 };
        if (locationLower.includes('londres')) return { latitude: 51.5074, longitude: 0.1278 };
        if (locationLower.includes('nueva york')) return { latitude: 40.7128, longitude: -74.0060 };
        return null;
    }

    async function fetchImage(query) {
        const locationLower = query.toLowerCase();
        if (locationLower.includes('parís')) return 'https://source.unsplash.com/300x200/?paris';
        if (locationLower.includes('londres')) return 'https://source.unsplash.com/300x200/?london';
        if (locationLower.includes('nueva york')) return 'https://source.unsplash.com/300x200/?new york city';
        return null;
    }

    async function generateFictionalImage(description) {
        if (description.includes('Hogwarts')) {
            return 'https://images.unsplash.com/photo-1541817454-942f741639d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDk0NTZ8MHwxfHNlYXJjaHwyMHx8Y2FzdGxlJTIwb24lMjBhJTIwbGFrZXxlbnwwfHx8fDE3MjQyNjg4MzJ8MA&ixlib=rb-4.0.3&q=80&w=400';
        }
        return `https://via.placeholder.com/300x200?text=${encodeURIComponent(description)}`;
    }
});