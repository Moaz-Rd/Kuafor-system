document.addEventListener('DOMContentLoaded', () => {
  const bookingSection = document.getElementById('booking-section');
  const storesSection = document.getElementById('stores-section');
  const storesContainer = document.getElementById('stores-container');
  const serviceDropdown = document.getElementById('service');
  const storeDropdown = document.getElementById('store');
  const beauticianDropdown = document.getElementById('beautician');
  const appointmentForm = document.getElementById('appointment-form');
  const formFeedback = document.getElementById('form-feedback');
  const summary = document.getElementById('summary');

  const modal = new bootstrap.Modal(document.getElementById('confirmation-modal'));

  document.getElementById('book-appointment').addEventListener('click', () => {
    bookingSection.classList.remove('d-none');
    storesSection.classList.add('d-none');
    populateDropdown('/api/services', serviceDropdown, 'service_name', 'service_id');
    populateDropdown('/api/stores', storeDropdown, 'store_name', 'store_id');
  });

  document.getElementById('view-stores').addEventListener('click', () => {
    storesSection.classList.remove('d-none');
    bookingSection.classList.add('d-none');
    fetchStores();
  });

  function populateDropdown(endpoint, dropdown, labelField, valueField) {
    fetch(`http://localhost:8080${endpoint}`)
      .then(res => res.json())
      .then(data => {
        dropdown.innerHTML = `<option value="">Select ${dropdown.name}</option>`;
        data.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item[valueField];
          opt.textContent = item[labelField];
          dropdown.appendChild(opt);
        });
      })
      .catch(err => {
        console.error('Dropdown error:', err);
        dropdown.innerHTML = `<option>Error loading data</option>`;
      });
  }

  function fetchStores() {
    fetch('http://localhost:8080/api/stores')
      .then(res => res.json())
      .then(stores => {
        storesContainer.innerHTML = '';
        stores.forEach(store => {
          const div = document.createElement('div');
          div.className = 'col-md-4 store-card';
          div.innerHTML = `
            <h5 class="fw-bold">${store.store_name}</h5>
            <p><i class="fa-solid fa-location-dot text-primary"></i> ${store.location}</p>
          `;
          storesContainer.appendChild(div);
        });
      })
      .catch(err => console.error('Store error:', err));
  }

  storeDropdown.addEventListener('change', () => {
    const storeId = storeDropdown.value;
    if (storeId) {
      fetch(`http://localhost:8080/api/beauticians/stores/${storeId}/beauticians`)
        .then(res => res.json())
        .then(data => {
          beauticianDropdown.innerHTML = '<option value="">Choose Beautician</option>';
          data.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.beautician_id;
            opt.textContent = item.name_surname;
            beauticianDropdown.appendChild(opt);
          });
        })
        .catch(err => {
          beauticianDropdown.innerHTML = '<option>No beauticians available</option>';
          console.error('Beautician load error:', err);
        });
    }
  });

  appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
      service_id: serviceDropdown.value,
      store_id: storeDropdown.value,
      beautician_id: beauticianDropdown.value,
      appointment_time: document.getElementById('appointment-time').value
    };
    summary.innerHTML = `
      <strong>Service:</strong> ${serviceDropdown.options[serviceDropdown.selectedIndex].text}<br>
      <strong>Store:</strong> ${storeDropdown.options[storeDropdown.selectedIndex].text}<br>
      <strong>Beautician:</strong> ${beauticianDropdown.options[beauticianDropdown.selectedIndex].text}<br>
      <strong>Time:</strong> ${formData.appointment_time}
    `;
    modal.show();
  });

  document.getElementById('confirm-booking').addEventListener('click', () => {
    formFeedback.textContent = 'Appointment successfully booked!';
    formFeedback.className = 'text-success';
    modal.hide();
    appointmentForm.reset();
  });

  document.getElementById('cancel-booking').addEventListener('click', () => {
    formFeedback.textContent = 'Booking canceled.';
    formFeedback.className = 'text-danger';
    modal.hide();
  });
});
