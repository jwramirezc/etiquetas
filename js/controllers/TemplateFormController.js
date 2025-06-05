import Template from '../models/Template.js';
import TemplateRepository from '../repositories/TemplateRepository.js';
import TagRepository from '../repositories/TagRepository.js';

export default class TemplateFormController {
  constructor({
    formEl,
    nameInputEl,
    textInputEl,
    tagInputEl,
    tagSuggestionsEl,
    tagContainerEl,
    alertContainerEl,
    sectionTitleEl,
  }) {
    this.formEl = formEl; // #templateForm
    this.nameInputEl = nameInputEl; // #templateName
    this.textInputEl = textInputEl; // #templateText
    this.tagInputEl = tagInputEl; // #tagInput
    this.tagSuggestionsEl = tagSuggestionsEl; // #tagSuggestions
    this.tagContainerEl = tagContainerEl; // #tagContainer
    this.alertContainerEl = alertContainerEl; // #alertContainer
    this.sectionTitleEl = sectionTitleEl; // #sectionTitle
    this.editingTemplate = null;
    this.availableTags = TagRepository.getAll(); // Todas las etiquetas
    this.selectedTagIds = new Set();
  }

  initialize() {
    // 1) Verificar si existe editingTemplate en localStorage
    const raw = localStorage.getItem('editingTemplate');
    if (raw) {
      this.editingTemplate = JSON.parse(raw);
      localStorage.removeItem('editingTemplate');
      // Precargar valores
      this.nameInputEl.value = this.editingTemplate.text;
      this.textInputEl.value = this.editingTemplate.templateText;
      this.editingTemplate.tags.forEach(tagId => {
        const tagObj = this.availableTags.find(t => t.id === tagId);
        if (tagObj) this.addTagToContainer(tagObj);
        this.selectedTagIds.add(tagId);
      });
      this.sectionTitleEl.textContent = 'Editar Plantilla';
    }

    // 2) Configurar autocompletar etiquetas
    this.tagInputEl.addEventListener('input', this.handleTagInput.bind(this));
    this.tagInputEl.addEventListener(
      'keydown',
      this.handleTagKeydown.bind(this)
    );

    // 3) Escuchar "submit" del formulario
    this.formEl.addEventListener('submit', this.handleSubmit.bind(this));
  }

  handleTagInput() {
    const query = this.tagInputEl.value.trim().toLowerCase();
    this.tagSuggestionsEl.innerHTML = '';
    if (!query) {
      this.tagSuggestionsEl.classList.remove('show');
      return;
    }
    const matches = this.availableTags.filter(t =>
      t.name.toLowerCase().includes(query)
    );
    matches.forEach(t => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'dropdown-item d-flex align-items-center';
      itemDiv.style.cursor = 'pointer';
      itemDiv.innerHTML = `
        <span class="tag-color me-2" style="background:${t.color}"></span>
        <span>${t.name}</span>
      `;
      itemDiv.addEventListener('click', () => {
        if (!this.selectedTagIds.has(t.id)) {
          this.addTagToContainer(t);
          this.selectedTagIds.add(t.id);
        }
        this.tagInputEl.value = '';
        this.tagSuggestionsEl.classList.remove('show');
      });
      this.tagSuggestionsEl.appendChild(itemDiv);
    });
    if (matches.length > 0) {
      this.tagSuggestionsEl.classList.add('show');
    } else {
      this.tagSuggestionsEl.classList.remove('show');
    }
  }

  handleTagKeydown(e) {
    if (
      e.key === 'Enter' &&
      this.tagSuggestionsEl.querySelector('.dropdown-item')
    ) {
      e.preventDefault();
      this.tagSuggestionsEl.querySelector('.dropdown-item').click();
    } else if (e.key === 'Escape') {
      this.tagSuggestionsEl.classList.remove('show');
    }
  }

  addTagToContainer(tagObj) {
    const span = document.createElement('span');
    span.className = 'selected-tag';
    span.dataset.id = tagObj.id;
    span.innerHTML = `
      <span class="selected-tag-color" style="background:${tagObj.color};"></span>
      ${tagObj.name}
      <span class="remove-tag">&times;</span>
    `;
    span.querySelector('.remove-tag').addEventListener('click', () => {
      this.selectedTagIds.delete(tagObj.id);
      this.tagContainerEl.removeChild(span);
    });
    this.tagContainerEl.appendChild(span);
  }

  handleSubmit(e) {
    e.preventDefault();
    const nombre = this.nameInputEl.value.trim();
    const texto = this.textInputEl.value.trim();
    if (!nombre || !texto) {
      this.showAlert(
        'Debes completar nombre y texto de la plantilla.',
        'warning'
      );
      return;
    }

    // Si no hay etiquetas seleccionadas, asignar a "Sin clasificar"
    if (this.selectedTagIds.size === 0) {
      const unclassifiedTag = this.availableTags.find(
        t => t.name === 'Sin clasificar'
      );
      if (unclassifiedTag) {
        this.selectedTagIds.add(unclassifiedTag.id);
      }
    }

    // Construir objeto Template
    const data = {
      id: this.editingTemplate
        ? this.editingTemplate.id
        : TemplateRepository.getNextId(),
      text: nombre,
      templateText: texto,
      tags: Array.from(this.selectedTagIds),
    };
    const templateInstance = new Template(
      data.id,
      data.text,
      data.templateText,
      data.tags
    );

    // Guardar
    TemplateRepository.save(templateInstance);

    // Mostrar alerta de éxito
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-success alert-dismissible fade show';
    alerta.role = 'alert';
    alerta.innerHTML = `
      <i class="bi bi-check-circle me-2"></i>
      Plantilla guardada correctamente
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    this.alertContainerEl.appendChild(alerta);
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  }

  showAlert(message, type = 'warning') {
    this.alertContainerEl.innerHTML = '';
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    this.alertContainerEl.appendChild(alertDiv);
  }
}
