import Tag from '../models/Tag.js';
import TagRepository from '../repositories/TagRepository.js';

export default class TagFormController {
  constructor({
    formEl,
    nameInputEl,
    colorInputEl,
    alertContainerEl,
    pageTitleEl,
    formHeaderEl,
    submitBtnEl,
  }) {
    this.formEl = formEl; // #tagForm
    this.nameInputEl = nameInputEl; // #tagName
    this.colorInputEl = colorInputEl; // #tagColor
    this.alertContainerEl = alertContainerEl; // #alertContainer
    this.pageTitleEl = pageTitleEl; // #pageTitle
    this.formHeaderEl = formHeaderEl; // #formHeader
    this.submitBtnEl = submitBtnEl; // #submitBtn
    this.editingTag = null;
  }

  initialize() {
    const params = new URLSearchParams(window.location.search);
    const tagIdParam = params.get('tagId');

    // Cargar etiquetas existentes
    this.tags = TagRepository.getAll();

    if (tagIdParam) {
      // Modo edición
      const tag = TagRepository.getById(tagIdParam);
      if (!tag) {
        this.showAlert('Etiqueta no encontrada.', 'danger');
        setTimeout(() => (window.location.href = 'index.html'), 2000);
        return;
      }
      this.editingTag = tag;
      this.pageTitleEl.textContent = 'Editar Etiqueta';
      this.formHeaderEl.textContent = 'Editar Etiqueta';
      this.submitBtnEl.textContent = 'Actualizar etiqueta';
      this.nameInputEl.value = tag.name;
      this.colorInputEl.value = tag.color;
    }

    this.formEl.addEventListener('submit', this.handleSubmit.bind(this));
  }

  handleSubmit(event) {
    event.preventDefault();
    const nombre = this.nameInputEl.value.trim();
    const color = this.colorInputEl.value;
    if (!nombre) {
      this.showAlert('El nombre de la etiqueta no puede ir vacío.', 'warning');
      return;
    }

    if (this.editingTag) {
      // Actualizar
      this.editingTag.name = nombre;
      this.editingTag.color = color;
      TagRepository.save(this.editingTag);
    } else {
      // Crear nueva
      const newId = TagRepository.getNextId();
      const newTag = new Tag(newId, nombre, color);
      TagRepository.save(newTag);
    }
    window.location.href = 'index.html';
  }

  showAlert(message, type = 'warning') {
    this.alertContainerEl.innerHTML = '';
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    this.alertContainerEl.appendChild(alertDiv);
  }
}
