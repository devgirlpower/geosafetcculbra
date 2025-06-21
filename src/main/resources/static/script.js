// inicializa mapa com posição padrão (ex: Porto Alegre)
const map = L.map('map').setView([-30.0346, -51.2177], 13);

// camada base OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// camada para áreas afetadas (polígonos)
const areasLayer = new L.FeatureGroup();
map.addLayer(areasLayer);

// controle de desenho (apenas polígonos)
const drawControl = new L.Control.Draw({
    edit: {
        featureGroup: areasLayer,
        remove: true
    },
    draw: {
        polygon: true,
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false
    }
});
map.addControl(drawControl);

// função para setar estilo do polígono conforme status flooded
function getPolygonStyle(flooded) {
    return {
        color: flooded ? '#1abc9c' : '#e74c3c',
        fillColor: flooded ? '#1abc9c80' : '#e74c3c80',
        weight: 3
    };
}

// ao criar novo polígono
map.on(L.Draw.Event.CREATED, function (e) {
    const layer = e.layer;
    areasLayer.addLayer(layer);

    // extrai coordenadas (array de [lat, lng])
    const coords = layer.getLatLngs()[0].map(p => [p.lat, p.lng]);

    // prepara objeto área com flooded default false
    const areaObj = { coordinates: coords, flooded: false };

    // envia para backend POST
    fetch(`${window.location.origin}/api/areas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(areaObj)
    })
        .then(res => res.json())
        .then(data => {
            layer._areaId = data.id;
            layer._flooded = false;
            layer.setStyle(getPolygonStyle(false));

            // adiciona evento click para alternar flooded
            layer.on('click', () => toggleFloodedStatus(layer));
        })
        .catch(() => {
            alert('Erro ao salvar área!');
            areasLayer.removeLayer(layer);
        });
});

// função para alternar status flooded e atualizar backend
function toggleFloodedStatus(layer) {
    const newFlooded = !layer._flooded;
    // muda estilo visual
    layer.setStyle(getPolygonStyle(newFlooded));

    // atualiza no backend via PUT
    fetch(`${window.location.origin}/api/areas/${layer._areaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flooded: newFlooded })
    })
        .then(response => {
            if (!response.ok) throw new Error('Falha ao atualizar status');
            layer._flooded = newFlooded;
        })
        .catch(() => {
            alert('Erro ao atualizar status da área!');
            // reverte estilo no erro
            layer.setStyle(getPolygonStyle(layer._flooded));
        });
}

// função para carregar áreas do backend e adicioná-las ao mapa
function carregarAreas() {
    fetch(`${window.location.origin}/api/areas`)
        .then(res => res.json())
        .then(areas => {
            areas.forEach(area => {
                const flooded = area.flooded === true;
                const polygon = L.polygon(area.coordinates, getPolygonStyle(flooded));
                polygon._areaId = area.id;
                polygon._flooded = flooded;

                // adiciona evento click para alternar flooded
                polygon.on('click', () => toggleFloodedStatus(polygon));

                areasLayer.addLayer(polygon);
            });
        })
        .catch(() => {
            alert('Erro ao carregar áreas do backend.');
        });
}

// chama a função para carregar áreas ao iniciar
carregarAreas();

// mostra localização atual do usuário (se permitir)
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // marcador azul para o usuário
        const userMarker = L.circleMarker([lat, lng], {
            radius: 8,
            fillColor: '#3498db',
            color: '#2980b9',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map).bindPopup("Você está aqui").openPopup();

        // centraliza mapa na localização atual
        map.setView([lat, lng], 14);
    }, () => {
        console.warn("Usuário negou acesso à localização.");
    });
} else {
    console.warn("Geolocalização não suportada pelo navegador.");
}

// --- ALERTAS ---

// Seleciona o formulário e lista de alertas
const alertForm = document.getElementById('alertForm');
const alertsList = document.getElementById('alertsList');
function adicionarMarcadorAbrigo(shelter) {
    const coords = shelter.location.coordinates; // [lng, lat]
    const latlng = [coords[1], coords[0]]; // converte para [lat, lng]
    const marker = L.marker(latlng).addTo(sheltersLayer);
    marker.bindPopup(`<b>${shelter.name}</b><br>${shelter.address || ''}<br>Status: ${shelter.status}`);
    marker._shelterId = shelter.id;
}

// Função para adicionar alerta na tela
function adicionarAlertaNaTela(alert) {
    const li = document.createElement('li');
    li.textContent = `[${alert.level.toUpperCase()}] ${alert.message}`;
    alertsList.prepend(li); // adiciona no topo da lista
}

// Evento submit para envio do alerta
alertForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const message = document.getElementById('message').value.trim();
    const level = document.getElementById('level').value;

    if (!message) {
        alert('Por favor, insira uma mensagem para o alerta.');
        return;
    }

    const alertData = { message, level };

    fetch(`${window.location.origin}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
    })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }
            return response.json();
        })
        .then(data => {
            adicionarAlertaNaTela(data);
            alertForm.reset();
        })
        .catch(error => {
            alert('Erro ao enviar alerta: ' + error.message);
        });
});

// Carrega alertas salvos na inicialização
function carregarAlertas() {
    fetch(`${window.location.origin}/alerts`)
        .then(res => res.json())
        .then(alerts => {
            alerts.reverse().forEach(adicionarAlertaNaTela); // mais recente primeiro
        })
        .catch(err => console.error('Erro ao carregar alertas:', err));
}

carregarAlertas();
// camada para abrigos
const sheltersLayer = new L.FeatureGroup();
map.addLayer(sheltersLayer);

// array local para abrigos
let shelters = [];

// função para criar marcador no mapa
function adicionarMarcadorAbrigo(shelter) {
    const coords = shelter.location.coordinates; // [lng, lat]
    const latlng = [coords[1], coords[0]]; // converte para [lat, lng]
    const marker = L.marker(latlng).addTo(sheltersLayer);
    marker.bindPopup(`<b>${shelter.name}</b><br>${shelter.address || ''}<br>Status: ${shelter.status}`);
    marker._shelterId = shelter.id;
}

// carrega abrigos do backend
function carregarAbrigos() {
    fetch(`${window.location.origin}/shelters`)
        .then(res => res.json())
        .then(data => {
            shelters = data;
            sheltersLayer.clearLayers();
            shelters.forEach(adicionarMarcadorAbrigo);
        })
        .catch(() => alert('Erro ao carregar abrigos'));
}

carregarAbrigos();

// cadastra abrigo ao dar duplo clique no mapa
map.on('dblclick', function(e) {
    const latlng = e.latlng;

    const popupContent = `
        <div>
            <label for="inputShelterName">Nome do Abrigo:</label><br>
            <input id="inputShelterName" type="text" placeholder="Nome do abrigo" style="width: 150px;" /><br>
            <label for="inputShelterAddress">Endereço:</label><br>
            <input id="inputShelterAddress" type="text" placeholder="Endereço do abrigo" style="width: 150px;" /><br>
            <button id="saveShelterBtn">Salvar</button>
        </div>
    `;

    const popup = L.popup()
        .setLatLng(latlng)
        .setContent(popupContent)
        .openOn(map);

    map.once('popupopen', () => {
        const btn = document.getElementById('saveShelterBtn');
        const nameInput = document.getElementById('inputShelterName');
        const addressInput = document.getElementById('inputShelterAddress');

        if (!btn || !nameInput || !addressInput) {
            console.error('Elementos do popup não encontrados');
            return;
        }

        // Usa 'once' para evitar múltiplos handlers
        btn.addEventListener('click', function onClick() {
            const name = nameInput.value.trim();
            const address = addressInput.value.trim();

            if (!name) {
                alert('Informe o nome do abrigo.');
                return;
            }
            if (!address) {
                alert('Informe o endereço do abrigo.');
                return;
            }

            const shelterData = {
                name: name,
                address: address,
                status: 'Available',
                location: {
                    type: "Point",
                    coordinates: [latlng.lng, latlng.lat]
                }
            };

            fetch(`${window.location.origin}/shelters`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(shelterData)
            })
                .then(res => {
                    if (!res.ok) throw new Error('Erro ao salvar abrigo');
                    return res.json();
                })
                .then(savedShelter => {
                    shelters.push(savedShelter);
                    adicionarMarcadorAbrigo(savedShelter);
                    map.closePopup();
                })
                .catch(err => alert(err.message));

            // Remove o listener para não acumular múltiplos
            btn.removeEventListener('click', onClick);
        });
    });
});
