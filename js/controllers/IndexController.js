import TagRepository from '../repositories/TagRepository.js';
import TemplateRepository from '../repositories/TemplateRepository.js';

export default class IndexController {
  constructor({ tagsListEl, alertContainerEl, pageTitleEl, sectionTitleEl }) {
    this.tagsListEl = tagsListEl; // contenedor '#tagsList'
    this.alertContainerEl = alertContainerEl; // contenedor '#alertContainer'
    this.pageTitleEl = pageTitleEl; // en tu index.html no hay ID para pageTitle, pero sí puedes ignorar
    this.sectionTitleEl = sectionTitleEl; // idem
    // Inicialmente cargamos todos los tags y templates
    this.tags = TagRepository.getAll();
    this.templates = TemplateRepository.getAll();
  }

  initialize() {
    // Opcional: si quieres cambiar dinámicamente el título
    if (this.pageTitleEl)
      this.pageTitleEl.innerText = 'Administrador de Plantillas';
    if (this.sectionTitleEl)
      this.sectionTitleEl.innerText = 'Etiquetas y Plantillas';
    this.renderTags();
    this.attachDragAndDropListeners();

    // Add validation to "Nueva Plantilla" button
    const nuevaPlantillaBtn = document.querySelector('a[href="template.html"]');
    if (nuevaPlantillaBtn) {
      nuevaPlantillaBtn.addEventListener('click', e => {
        e.preventDefault();
        this.validateNewTemplate();
      });
    }
  }

  validateNewTemplate() {
    const tags = TagRepository.getAll();
    if (tags.length === 0) {
      const alert = document.createElement('div');
      alert.className = 'alert alert-warning alert-dismissible fade show';
      alert.role = 'alert';
      alert.innerHTML = `
        <i class="bi bi-exclamation-triangle me-2"></i>
        No hay etiquetas creadas. Por favor crea una antes de crear una plantilla.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      if (this.alertContainerEl) {
        this.alertContainerEl.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
      }
      return;
    }
    // If there are tags, proceed to template creation
    window.location.href = 'template.html';
  }

  // Renderiza todas las etiquetas (la lógica original de renderTags en app.js)
  renderTags() {
    if (!this.tagsListEl) return;
    this.tagsListEl.innerHTML = '';

    // Recargar cada vez que entramos
    this.tags = TagRepository.getAll();
    this.templates = TemplateRepository.getAll();

    this.tags.forEach((tag, index) => {
      // Filtrar plantillas asociadas a esta etiqueta
      const items = this.templates.filter(t => t.tags.includes(tag.id));

      // Crear elemento padre: <div class="col-md-4" draggable="true" ...>
      const tagDiv = document.createElement('div');
      tagDiv.className = 'col-md-4';
      tagDiv.setAttribute('draggable', 'true');
      tagDiv.dataset.index = index;

      // InnerHTML (mantenemos exacto el mismo markup)
      tagDiv.innerHTML = `
        <div class="tag-card">
          <div class="tag-header" style="cursor: pointer;">
            <button class="drag-handle btn btn-link p-0 me-2">
              <i class="bi bi-grip-vertical"></i>
            </button>
            <span class="tag-color" style="background:${tag.color}"></span>
            <span class="tag-name">${tag.name}</span>
            <div class="dropdown">
              <button class="btn btn-link p-0 tag-options" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <a class="dropdown-item" href="#" onclick="window.indexController.editTag(${index})">
                    <i class="bi bi-pencil me-2"></i>Editar
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" onclick="window.indexController.deleteTag(${index})">
                    <i class="bi bi-trash me-2"></i>Eliminar
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" onclick="window.indexController.shareTag(${index})">
                    <i class="bi bi-share me-2"></i>Compartir
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div class="tag-content" style="display: none;">
            <ul class="list-group list-group-flush">
              ${items
                .map(
                  item => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span>${item.text}</span>
                  <div class="item-actions">
                    <button
                      class="btn btn-link btn-sm p-0 me-2"
                      onclick="window.indexController.insertItem(${index}, ${item.id})"
                      title="Insertar"
                    >
                      <i class="bi bi-check"></i>
                    </button>
                    <button
                      class="btn btn-link btn-sm p-0 me-2"
                      onclick="window.indexController.editItem(${index}, ${item.id})"
                      title="Editar"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-link btn-sm p-0 me-2"
                      onclick="window.indexController.lockItem(${index}, ${item.id})"
                      title="Bloquear"
                    >
                      <i class="bi bi-lock"></i>
                    </button>
                    <button
                      class="btn btn-link btn-sm p-0"
                      onclick="window.indexController.deleteItem(${index}, ${item.id})"
                      title="Eliminar"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </li>`
                )
                .join('')}
            </ul>
          </div>
        </div>`;

      this.tagsListEl.appendChild(tagDiv);

      // Expandir/colapsar
      const header = tagDiv.querySelector('.tag-header');
      const content = tagDiv.querySelector('.tag-content');
      header.addEventListener('click', () => {
        content.style.display =
          content.style.display === 'none' ? 'block' : 'none';
      });

      // Agregamos clase para arrastrar
      tagDiv.addEventListener('dragstart', () => {
        tagDiv.classList.add('dragging');
      });
      tagDiv.addEventListener('dragover', e => {
        e.preventDefault();
        const draggingCard = document.querySelector('.dragging');
        if (draggingCard && draggingCard !== tagDiv) {
          const rect = tagDiv.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          if (e.clientY < midY) {
            this.tagsListEl.insertBefore(draggingCard, tagDiv);
          } else {
            this.tagsListEl.insertBefore(draggingCard, tagDiv.nextSibling);
          }
        }
      });
      tagDiv.addEventListener('dragend', () => {
        tagDiv.classList.remove('dragging');
        this.updateTagOrder();
      });
    });
  }

  // Cuando termina el drag & drop: actualiza el orden en localStorage
  updateTagOrder() {
    const newOrder = Array.from(
      document.querySelectorAll('#tagsList .tag-card .tag-name')
    ).map(span => {
      // Buscar la etiqueta cuyo nombre coincide
      return this.tags.find(t => t.name === span.innerText);
    });
    this.tags = newOrder.filter(Boolean);
    // Guardar el nuevo orden en el repositorio
    this.tags.forEach(tag => TagRepository.save(tag));
    this.renderTags(); // re-renderizamos
  }

  // Métodos CRUD para etiquetas (edit, delete, share)
  editTag(index) {
    const tag = this.tags[index];
    if (!tag) return;
    // Redirige a tag.html?tagId=ID
    window.location.href = `tag.html?tagId=${encodeURIComponent(tag.id)}`;
  }

  deleteTag(index) {
    const tag = this.tags[index];
    if (!tag) return;
    // Verificar plantillas que usan esta etiqueta
    const templatesUsing = this.templates.filter(t => t.tags.includes(tag.id));
    if (templatesUsing.length > 0) {
      const aviso = document.createElement('div');
      aviso.className = 'alert alert-warning alert-dismissible fade show';
      aviso.role = 'alert';
      aviso.innerHTML = `
        <i class="bi bi-exclamation-triangle me-2"></i>
        No se puede eliminar la etiqueta "${tag.name}" porque tiene ${templatesUsing.length} plantilla(s) asociada(s).
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
      if (this.alertContainerEl) {
        this.alertContainerEl.appendChild(aviso);
        setTimeout(() => aviso.remove(), 3000);
      }
      return;
    }
    if (!confirm(`¿Seguro que deseas eliminar la etiqueta "${tag.name}"?`))
      return;
    TagRepository.delete(tag.id);
    this.tags = TagRepository.getAll();
    this.renderTags();
  }

  shareTag(index) {
    const tag = this.tags[index];
    if (!tag) return;
    alert(
      `Compartir la etiqueta "${tag.name}" con otros usuarios (pendiente de implementar).`
    );
  }

  // Métodos CRUD para plantillas
  insertItem(tagIndex, itemId) {
    const item = this.templates.find(t => t.id === itemId);
    if (!item) return;
    navigator.clipboard
      .writeText(item.templateText)
      .then(() => alert('Texto de plantilla copiado al portapapeles.'))
      .catch(() => alert('Error al copiar al portapapeles.'));
  }

  editItem(tagIndex, itemId) {
    const item = this.templates.find(t => t.id === itemId);
    if (!item) return;
    localStorage.setItem('editingTemplate', JSON.stringify(item));
    window.location.href = 'template.html';
  }

  lockItem(tagIndex, itemId) {
    alert('Funcionalidad de permisos pendiente de implementar.');
  }

  deleteItem(tagIndex, itemId) {
    if (!confirm('¿Eliminar esta plantilla de esta etiqueta?')) return;
    const tagId = this.tags[tagIndex].id;
    // Solo eliminar la relación con esa etiqueta:
    const item = this.templates.find(t => t.id === itemId);
    if (!item) return;
    item.tags = item.tags.filter(tid => tid !== tagId);
    TemplateRepository.save(item);
    this.templates = TemplateRepository.getAll();
    this.renderTags();
  }

  // Conectar los listeners necesarios para drag&drop al inicializar
  attachDragAndDropListeners() {
    // Como ya agregamos dentro de renderTags, no hace falta nada extra aquí,
    // pero esta función queda como placeholder en caso de necesitar más lógica.
  }
}
