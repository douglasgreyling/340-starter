let selectedVehicles = {
  1: null,
  2: null,
  3: null
};

let availableSlots = [1, 2, 3];

document.addEventListener('DOMContentLoaded', function() {
  updateCompareButton();
  setupClassificationFilter();
});

function selectVehicle(id, make, model, year, thumbnail, price) {
  let slot = getNextAvailableSlot();

  if (!slot) {
    alert('Maximum of 3 vehicles can be selected for comparison.');
    return;
  }

  if (isVehicleAlreadySelected(id)) {
    alert('This vehicle is already selected for comparison.');
    return;
  }

  selectedVehicles[slot] = {
    id: id,
    make: make,
    model: model,
    year: year,
    thumbnail: thumbnail,
    price: price
  };

  updateVehicleSlot(slot);
  updateVehicleCardSelection();
  updateCompareButton();

  availableSlots = availableSlots.filter(s => s !== slot);
}

function clearVehicle(slot) {
  selectedVehicles[slot] = null;

  updateVehicleSlot(slot);
  updateVehicleCardSelection();
  updateCompareButton();


  if (!availableSlots.includes(slot)) {
    availableSlots.push(slot);
    availableSlots.sort();
  }
}

function getNextAvailableSlot() {
  return availableSlots.length > 0 ? availableSlots[0] : null;
}

function isVehicleAlreadySelected(vehicleId) {
  return Object.values(selectedVehicles).some(vehicle =>
    vehicle && vehicle.id === vehicleId
  );
}

function updateVehicleSlot(slot) {
  const slotElement = document.getElementById(`selected-vehicle-${slot}`);
  const inputElement = document.getElementById(`vehicle${slot}-input`);

  if (selectedVehicles[slot]) {
    const vehicle = selectedVehicles[slot];
    slotElement.innerHTML = `
      <img src="${vehicle.thumbnail}"
           alt="${vehicle.make} ${vehicle.model}"
           style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">
      <div style="margin-left: 10px; flex: 1;">
        <strong>${vehicle.make} ${vehicle.model}</strong><br>
        <small>Year: ${vehicle.year} | $${Number(vehicle.price).toLocaleString('en-US')}</small>
      </div>
    `;
    slotElement.className = 'selected-vehicle has-selection';
    slotElement.style.display = 'flex';
    slotElement.style.alignItems = 'center';
    slotElement.style.textAlign = 'left';
    slotElement.style.padding = '10px';

    inputElement.value = vehicle.id;
  } else {
    slotElement.innerHTML = '<p class="placeholder">Click a vehicle below to select</p>';
    slotElement.className = 'selected-vehicle';
    slotElement.style.display = 'flex';
    slotElement.style.textAlign = 'center';

    inputElement.value = '';
  }
}

function updateVehicleCardSelection() {
  const allCards = document.querySelectorAll('.vehicle-card');

  allCards.forEach(card => {
    const vehicleId = card.dataset.vehicleId;
    const isSelected = isVehicleAlreadySelected(vehicleId);

    if (isSelected) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

function updateCompareButton() {
  const compareBtn = document.getElementById('compareBtn');
  const hasSelection = Object.values(selectedVehicles).some(vehicle => vehicle !== null);

  compareBtn.disabled = !hasSelection;

  if (hasSelection) {
    const count = Object.values(selectedVehicles).filter(v => v !== null).length;
    compareBtn.textContent = `Compare ${count} Vehicle${count > 1 ? 's' : ''}`;
  } else {
    compareBtn.textContent = 'Compare Selected Vehicles';
  }
}

function setupClassificationFilter() {
  const filterSelect = document.getElementById('classificationFilter');

  filterSelect.addEventListener('change', function() {
    const selectedClassification = this.value;
    const vehicleCards = document.querySelectorAll('.vehicle-card');

    vehicleCards.forEach(card => {
      if (selectedClassification === '' || card.dataset.classificationId === selectedClassification) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

async function loadVehiclesByClassification(classificationId) {
  try {
    const response = await fetch(`/compare/ajax/vehicles/${classificationId}`);
    const vehicles = await response.json();

    updateVehicleGrid(vehicles);
  } catch (error) {
    console.error('Error loading vehicles:', error);
  }
}

function updateVehicleGrid(vehicles) {
  const grid = document.getElementById('vehicleGrid');

  if (vehicles.length === 0) {
    grid.innerHTML = '<p>No vehicles found for this classification.</p>';
    return;
  }

  let html = '';
  vehicles.forEach(vehicle => {
    html += `
      <div class="vehicle-card"
           data-vehicle-id="${vehicle.inv_id}"
           data-classification="${vehicle.classification_name}"
           data-classification-id="${vehicle.classification_id}"
           onclick="selectVehicle('${vehicle.inv_id}', '${vehicle.inv_make}', '${vehicle.inv_model}', '${vehicle.inv_year}', '${vehicle.inv_thumbnail}', '${vehicle.inv_price}')">

        <img src="${vehicle.inv_thumbnail}"
             alt="${vehicle.inv_make} ${vehicle.inv_model}"
             onerror="this.src='/images/vehicles/no-image-tn.png'">

        <div class="vehicle-info">
          <h4>${vehicle.inv_make} ${vehicle.inv_model}</h4>
          <p class="year">Year: ${vehicle.inv_year}</p>
          <p class="price">$${Number(vehicle.inv_price).toLocaleString('en-US')}</p>
          <p class="classification">${vehicle.classification_name}</p>
        </div>

        <div class="selection-overlay">
          <span class="checkmark">✓</span>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
  updateVehicleCardSelection();
}