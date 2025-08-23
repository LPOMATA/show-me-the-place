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

    // Esta es una simulación de NLP. En un proyecto real, usaríamos un modelo de IA.
    const potentialPlaces = [
        'parís', 'londres', 'nueva york', 'roma', 'tokio', 'san francisco',
        'castillo de hogwarts', 'la comarca', 'rivendel', 'narnia'
    ];

    potentialPlaces.forEach(place => {
        if (lowerText.includes(place)) {
            // Decidimos si el lugar es real o ficticio
            if (['castillo de hogwarts', 'la comarca', 'rivendel', 'narnia'].includes(place)) {
                fictionalPlaces.push(place);
            } else {
                realPlaces.push(place);
            }
        }
    });

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
    const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.length > 0) {
            const result = data[0];
            return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon)
            };
        } else {
            console.warn(`No se encontraron coordenadas para: ${location}`);
            return null;
        }
    } catch (error) {
        console.error("Error al obtener las coordenadas:", error);
        return null;
    }
}

   async function fetchImage(query) {
    const apiKey = "q7GEeSZ9CHeW-DAHU02Ouv78pgdpeOgukli4hLkEwyI"; // <-- ¡Pon tu clave aquí!
    const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${apiKey}&per_page=1`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].urls.regular;
        }
        return null; // Si no hay resultados, no devuelve nada.
    } catch (error) {
        console.error("Error al obtener la imagen de Unsplash:", error);
        return null;
    }
}

async function generateFictionalImage(description) {
    const lowerDescription = description.toLowerCase();

    // Final, permanent links for fictional locations
    if (lowerDescription.includes('la comarca')) {
        return 'https://ibb.co/p2Q5Z0L';
    } else if (lowerDescription.includes('rivendel')) {
        return 'https://ibb.co/f4b1K4v';
    } else if (lowerDescription.includes('castillo de hogwarts')) {
        return 'https://ibb.co/z5p5D2M';
    } else if (lowerDescription.includes('narnia')) {
        return 'https://ibb.co/31C7T2Q';
    }

    // For any other fictional location, use the reliable placeholder service
    const encodedText = encodeURIComponent(description);
    return `https://placehold.co/300x200?text=${encodedText}`;
}
});