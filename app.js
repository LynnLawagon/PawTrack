(() => {
  'use strict';
  const STORAGE_KEY = 'pawtrack_pets_v1';
  const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;
  const $ = (id) => document.getElementById(id);
  const els = {
    form: $('petForm'), id: $('petId'), name: $('petName'), gender: $('petGender'), type: $('petType'),
    imageInput: $('petImage'), preview: $('photoPreview'), removePhoto: $('removePhotoBtn'),
    title: $('formTitle'), subtitle: $('formSubtitle'), save: $('saveBtn'), table: $('petTableBody'),
    empty: $('emptyState'), search: $('searchInput'), filter: $('typeFilter'), toast: $('toast'),
    dialog: $('deleteDialog'), importFile: $('importFile')
  };
  let pets = loadPets();
  let currentImage = '';
  let pendingDeleteId = null;
  let toastTimer;

  function loadPets() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved.filter(p => p && Number.isInteger(Number(p.id)) && typeof p.name === 'string') : [];
    } catch (error) { console.warn('Could not read PawTrack data:', error); return []; }
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pets)); return true; }
    catch (error) {
      showToast(error && error.name === 'QuotaExceededError' ? 'Browser storage is full. Export a backup or use smaller photos.' : 'Could not save data in this browser.');
      return false;
    }
  }
  function escapeHTML(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function showToast(message) {
    els.toast.textContent = message; els.toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2600);
  }
  function nextId() { return pets.reduce((max, pet) => Math.max(max, Number(pet.id) || 0), 0) + 1; }
  function setImage(dataUrl) {
    currentImage = dataUrl || '';
    els.preview.innerHTML = currentImage ? `<img src="${currentImage}" alt="Pet photo preview">` : '<span class="photo-placeholder">♡</span>';
    els.removePhoto.hidden = !currentImage;
  }
  function resetForm() {
    els.form.reset(); els.id.value = ''; setImage('');
    els.title.textContent = 'Add a new pet'; els.subtitle.textContent = 'Enter the details to create a profile.';
    els.save.innerHTML = 'Save pet <span>→</span>';
  }
  function render() {
    const term = els.search.value.trim().toLowerCase();
    const type = els.filter.value;
    const filtered = pets.filter(p => p.name.toLowerCase().includes(term) && (type === 'All' || p.type === type)).sort((a,b) => Number(a.id)-Number(b.id));
    els.table.innerHTML = filtered.map(p => `
      <tr data-id="${Number(p.id)}" tabindex="0" aria-label="Edit ${escapeHTML(p.name)}">
        <td><div class="pet-cell"><div class="pet-thumb">${p.image ? `<img src="${p.image}" alt="">` : '♡'}</div><div><div class="pet-name">${escapeHTML(p.name)}</div><div class="pet-id">PET-${String(p.id).padStart(3,'0')}</div></div></div></td>
        <td><span class="gender-text">${escapeHTML(p.gender)}</span></td>
        <td><span class="type-pill ${p.type === 'Dog' ? 'type-dog' : 'type-cat'}">${escapeHTML(p.type)}</span></td>
        <td><div class="row-actions"><button class="icon-btn edit-btn" type="button" data-action="edit" data-id="${Number(p.id)}" title="Edit pet" aria-label="Edit ${escapeHTML(p.name)}">✎</button><button class="icon-btn delete-btn" type="button" data-action="delete" data-id="${Number(p.id)}" title="Delete pet" aria-label="Delete ${escapeHTML(p.name)}">×</button></div></td>
      </tr>`).join('');
    els.empty.classList.toggle('visible', filtered.length === 0);
    $('recordCount').textContent = `${filtered.length} RECORD${filtered.length === 1 ? '' : 'S'}`;
    $('showingText').textContent = `Showing ${filtered.length} of ${pets.length} pet${pets.length === 1 ? '' : 's'}`;
    $('totalPets').textContent = pets.length;
    $('dogCount').textContent = pets.filter(p => p.type === 'Dog').length;
    $('catCount').textContent = pets.filter(p => p.type === 'Cat').length;
    $('photoCount').textContent = pets.filter(p => !!p.image).length;
  }
  function editPet(id) {
    const pet = pets.find(p => Number(p.id) === Number(id)); if (!pet) return;
    els.id.value = pet.id; els.name.value = pet.name; els.gender.value = pet.gender; els.type.value = pet.type;
    setImage(pet.image || ''); els.title.textContent = 'Update pet profile'; els.subtitle.textContent = 'Make changes to this pet’s information.';
    els.save.innerHTML = 'Update pet <span>→</span>';
    $('pet-form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' }); els.name.focus({preventScroll:true});
  }
  function deletePet(id) { pendingDeleteId = Number(id); els.dialog.showModal(); }
  function handleImage(file) {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { showToast('Please choose a JPG, PNG, or WEBP image.'); return; }
    if (file.size > MAX_IMAGE_BYTES) { showToast('Please choose an image smaller than 1.5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result || ''));
    reader.onerror = () => showToast('Could not read that image. Please try another one.');
    reader.readAsDataURL(file);
  }
  els.form.addEventListener('submit', event => {
    event.preventDefault();
    const name = els.name.value.trim(), gender = els.gender.value, type = els.type.value;
    if (!name || !gender || !type) { showToast('Please complete all required fields.'); return; }
    const editingId = els.id.value ? Number(els.id.value) : null;
    const record = { id: editingId || nextId(), name, gender, type, image: currentImage, updatedAt: new Date().toISOString() };
    const previous = pets;
    pets = editingId ? pets.map(p => Number(p.id) === editingId ? record : p) : [...pets, record];
    if (!persist()) { pets = previous; return; }
    render(); resetForm(); showToast(editingId ? 'Pet profile updated successfully.' : 'Pet added successfully.');
  });
  $('resetBtn').addEventListener('click', resetForm);
  $('newPetBtn').addEventListener('click', () => { resetForm(); $('pet-form-panel').scrollIntoView({behavior:'smooth',block:'start'}); els.name.focus({preventScroll:true}); });
  $('emptyAddBtn').addEventListener('click', () => $('newPetBtn').click());
  els.imageInput.addEventListener('change', e => { handleImage(e.target.files[0]); e.target.value = ''; });
  els.removePhoto.addEventListener('click', () => setImage(''));
  els.search.addEventListener('input', render); els.filter.addEventListener('change', render);
  els.table.addEventListener('click', e => {
    const action = e.target.closest('[data-action]');
    if (action) { const id = Number(action.dataset.id); action.dataset.action === 'edit' ? editPet(id) : deletePet(id); return; }
    const row = e.target.closest('tr[data-id]'); if (row) editPet(Number(row.dataset.id));
  });
  els.table.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr[data-id]')) { e.preventDefault(); editPet(Number(e.target.dataset.id)); } });
  $('cancelDelete').addEventListener('click', () => { pendingDeleteId = null; els.dialog.close(); });
  $('confirmDelete').addEventListener('click', () => {
    const previous = pets; pets = pets.filter(p => Number(p.id) !== pendingDeleteId);
    if (persist()) { render(); if (Number(els.id.value) === pendingDeleteId) resetForm(); showToast('Pet profile deleted.'); }
    else pets = previous;
    pendingDeleteId = null; els.dialog.close();
  });
  $('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ app:'PawTrack', version:1, exportedAt:new Date().toISOString(), pets }, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = `pawtrack-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url); showToast('Backup exported. Keep it somewhere safe.');
  });
  els.importFile.addEventListener('change', async e => {
    const file = e.target.files[0]; e.target.value = ''; if (!file) return;
    try {
      const data = JSON.parse(await file.text()); const imported = Array.isArray(data) ? data : data.pets;
      if (!Array.isArray(imported) || imported.some(p => !p || !Number.isInteger(Number(p.id)) || typeof p.name !== 'string' || !['Male','Female'].includes(p.gender) || !['Dog','Cat'].includes(p.type) || (p.image && !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(String(p.image))))) throw new Error('format');
      const cleaned = imported.map(p => ({id:Number(p.id),name:p.name.slice(0,50),gender:p.gender,type:p.type,image:p.image || '',updatedAt:p.updatedAt || new Date().toISOString()}));
      const previous = pets; pets = cleaned;
      if (persist()) { resetForm(); render(); showToast(`Imported ${pets.length} pet record${pets.length===1?'':'s'}.`); } else pets = previous;
    } catch { showToast('That backup file is not valid. No changes were made.'); }
  });
  $('year').textContent = new Date().getFullYear();
  render();
})();
