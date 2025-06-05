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

    // Crear el modal de confirmación si no existe
    if (!document.getElementById('deleteConfirmModal')) {
      const modalHTML = `
        <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-labelledby="deleteConfirmModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="deleteConfirmModalLabel">Confirmar eliminación</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p id="deleteConfirmMessage"></p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger" id="deleteConfirmButton">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
  }

  showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
      <i class="bi bi-${
        type === 'success'
          ? 'check-circle'
          : type === 'warning'
          ? 'exclamation-triangle'
          : 'info-circle'
      } me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    if (this.alertContainerEl) {
      this.alertContainerEl.appendChild(alert);
      setTimeout(() => alert.remove(), 3000);
    }
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
      this.showAlert(
        'No hay etiquetas creadas. Por favor crea una antes de crear una plantilla.',
        'warning'
      );
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
            ${
              tag.name !== 'Sin clasificar'
                ? `
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
            `
                : ''
            }
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
      const dragHandle = tagDiv.querySelector('.drag-handle');
      dragHandle.addEventListener('mousedown', e => {
        e.stopPropagation(); // Prevent the click from triggering the header click
      });

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
    )
      .map(span => {
        // Buscar la etiqueta cuyo nombre coincide
        return this.tags.find(t => t.name === span.innerText);
      })
      .filter(Boolean); // Remove any null/undefined values

    // Actualizar el array local
    this.tags = newOrder;

    // Guardar el nuevo orden en localStorage
    localStorage.setItem(
      TagRepository.STORAGE_KEY,
      JSON.stringify(newOrder.map(tag => tag.toJSON()))
    );
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
      this.showAlert(
        `No se puede eliminar la etiqueta "${tag.name}" porque tiene ${templatesUsing.length} plantilla(s) asociada(s).`,
        'warning'
      );
      return;
    }

    this.showDeleteConfirm(
      `¿Seguro que deseas eliminar la etiqueta "${tag.name}"?`,
      () => {
        TagRepository.delete(tag.id);
        this.tags = TagRepository.getAll();
        this.renderTags();
      }
    );
  }

  shareTag(index) {
    const tag = this.tags[index];
    if (!tag) return;
    this.showAlert(
      `Compartir la etiqueta "${tag.name}" con otros usuarios (pendiente de implementar).`,
      'info'
    );
  }

  // Métodos CRUD para plantillas
  insertItem(tagIndex, itemId) {
    const item = this.templates.find(t => t.id === itemId);
    if (!item) return;
    navigator.clipboard
      .writeText(item.templateText)
      .then(() =>
        this.showAlert('Texto de plantilla copiado al portapapeles.', 'success')
      )
      .catch(() =>
        this.showAlert('Error al copiar al portapapeles.', 'danger')
      );
  }

  editItem(tagIndex, itemId) {
    const item = this.templates.find(t => t.id === itemId);
    if (!item) return;
    localStorage.setItem('editingTemplate', JSON.stringify(item));
    window.location.href = 'template.html';
  }

  lockItem(tagIndex, itemId) {
    this.showAlert(
      'Funcionalidad de permisos pendiente de implementar.',
      'info'
    );
  }

  deleteItem(tagIndex, itemId) {
    const tag = this.tags[tagIndex];
    const item = this.templates.find(t => t.id === itemId);
    if (!item) return;

    this.showDeleteConfirm('¿Eliminar esta plantilla de esta etiqueta?', () => {
      const tagId = tag.id;
      // Solo eliminar la relación con esa etiqueta:
      item.tags = item.tags.filter(tid => tid !== tagId);
      TemplateRepository.save(item);
      this.templates = TemplateRepository.getAll();
      this.renderTags();
    });
  }

  showDeleteConfirm(message, onConfirm) {
    const modal = new bootstrap.Modal(
      document.getElementById('deleteConfirmModal')
    );
    const messageEl = document.getElementById('deleteConfirmMessage');
    const confirmButton = document.getElementById('deleteConfirmButton');

    messageEl.textContent = message;

    // Remover listeners anteriores
    const newConfirmButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

    // Agregar nuevo listener
    newConfirmButton.addEventListener('click', () => {
      modal.hide();
      onConfirm();
    });

    modal.show();
  }

  // Conectar los listeners necesarios para drag&drop al inicializar
  attachDragAndDropListeners() {
    // Como ya agregamos dentro de renderTags, no hace falta nada extra aquí,
    // pero esta función queda como placeholder en caso de necesitar más lógica.
  }
}
