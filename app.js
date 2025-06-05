// app.js

// ======== CARGA INICIAL DE DATOS ========

// Carga etiquetas desde localStorage
let tags = JSON.parse(localStorage.getItem('tags')) || [];

// Carga plantillas desde localStorage
let templates = JSON.parse(localStorage.getItem('templates')) || [];

// ======== FUNCIONES AUXILIARES ========

// Genera un ID único para nuevas plantillas
function generarNuevoTemplateId() {
  let nextId = parseInt(localStorage.getItem('lastTemplateId') || '0', 10) + 1;
  localStorage.setItem('lastTemplateId', nextId);
  return nextId;
}

// Genera un ID único para nuevas etiquetas
function generarNuevoTagId() {
  let nextId = parseInt(localStorage.getItem('lastTagId') || '0', 10) + 1;
  localStorage.setItem('lastTagId', nextId);
  return nextId;
}

// ======== LÓGICA PRINCIPAL ========

document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM en index.html
  const pageTitle = document.getElementById('pageTitle');
  const sectionTitle = document.getElementById('sectionTitle');
  const templateNameInput = document.getElementById('templateName');
  const templateTextInput = document.getElementById('templateText');
  const templateForm = document.getElementById('templateForm');
  const tagsList = document.getElementById('tagsList');
  const alertContainer = document.getElementById('alertContainer');
  const tagNameInput = document.getElementById('tagName');
  const tagColorInput = document.getElementById('tagColor');
  const tagForm = document.getElementById('tagForm');

  // Elementos del DOM en template.html
  const tagInput = document.getElementById('tagInput');
  const tagSuggestions = document.getElementById('tagSuggestions');
  const tagContainer = document.getElementById('tagContainer');
  const alertContainerTpl = document.getElementById('alertContainerTpl');

  // ================== INDEX.HTML ==================

  if (tagsList) {
    // Muestra títulos si existen
    if (pageTitle) pageTitle.innerText = 'Administrador de Plantillas';
    if (sectionTitle) sectionTitle.innerText = 'Etiquetas y Plantillas';

    // Render inicial
    renderTags();

    // Manejo de creación de nueva etiqueta
    if (tagForm) {
      tagForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = tagNameInput.value.trim();
        const color = tagColorInput.value;
        if (!name) return;

        const newTag = {
          id: generarNuevoTagId(),
          name,
          color,
        };
        tags.push(newTag);
        localStorage.setItem('tags', JSON.stringify(tags));

        // Limpiar formulario
        tagNameInput.value = '';
        tagColorInput.value = '#000000';

        renderTags();

        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show';
        alert.role = 'alert';
        alert.innerHTML = `
          <i class="bi bi-check-circle me-2"></i>
          Etiqueta creada correctamente
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        // Si alertContainer existe, agrega la alerta; de lo contrario ignora
        if (alertContainer) {
          alertContainer.appendChild(alert);
          setTimeout(() => alert.remove(), 2000);
        }
      });
    }
  }

  // ================== TEMPLATE.HTML ==================

  if (templateForm) {
    // Si venimos a editar, precarga los valores
    let editingTemplate = JSON.parse(
      localStorage.getItem('editingTemplate') || 'null'
    );
    let selectedTags = new Set();

    if (editingTemplate) {
      templateNameInput.value = editingTemplate.text;
      templateTextInput.value = editingTemplate.templateText;
      editingTemplate.tags.forEach(tid => {
        const tagObj = tags.find(t => t.id === tid);
        if (tagObj) {
          addTagToContainer(tagObj);
          selectedTags.add(tagObj.id);
        }
      });
      localStorage.removeItem('editingTemplate');
    }

    // Autocompletar etiquetas en el formulario
    tagInput.addEventListener('input', () => {
      const query = tagInput.value.trim().toLowerCase();
      tagSuggestions.innerHTML = '';
      if (!query) {
        tagSuggestions.classList.remove('show');
        return;
      }
      const matches = tags.filter(t => t.name.toLowerCase().includes(query));
      matches.forEach(t => {
        const item = document.createElement('div');
        item.className = 'dropdown-item d-flex align-items-center';
        item.style.cursor = 'pointer';
        item.innerHTML = `
          <span class="tag-color me-2" style="background:${t.color}"></span>
          <span>${t.name}</span>
        `;
        item.addEventListener('click', () => {
          if (!selectedTags.has(t.id)) {
            addTagToContainer(t);
            selectedTags.add(t.id);
          }
          tagInput.value = '';
          tagSuggestions.classList.remove('show');
        });
        tagSuggestions.appendChild(item);
      });
      tagSuggestions.classList.toggle('show', matches.length > 0);
    });

    // Manejo de teclado para autocompletar
    tagInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && tagSuggestions.querySelector('.dropdown-item')) {
        e.preventDefault();
        tagSuggestions.querySelector('.dropdown-item').click();
      } else if (e.key === 'Escape') {
        tagSuggestions.classList.remove('show');
      }
    });

    // Función auxiliar: agrega una etiqueta seleccionada al contenedor
    function addTagToContainer(tagObj) {
      const span = document.createElement('span');
      span.className = 'selected-tag';
      span.dataset.id = tagObj.id;
      span.innerHTML = `
        <span class="selected-tag-color" style="background:${tagObj.color};"></span>
        ${tagObj.name}
        <span class="remove-tag">&times;</span>
      `;
      span.querySelector('.remove-tag').addEventListener('click', () => {
        selectedTags.delete(tagObj.id);
        tagContainer.removeChild(span);
      });
      tagContainer.appendChild(span);
    }

    // Manejo de envío del formulario de plantilla
    templateForm.addEventListener('submit', e => {
      e.preventDefault();
      const nombre = templateNameInput.value.trim();
      const texto = templateTextInput.value.trim();
      if (!nombre || !texto) return;

      // Construye el objeto plantilla
      const data = {
        id: editingTemplate ? editingTemplate.id : generarNuevoTemplateId(),
        text: nombre,
        templateText: texto,
        tags: Array.from(selectedTags),
      };

      if (editingTemplate) {
        templates = templates.map(t => (t.id === data.id ? data : t));
      } else {
        templates.push(data);
      }
      localStorage.setItem('templates', JSON.stringify(templates));

      const alert = document.createElement('div');
      alert.className = 'alert alert-success alert-dismissible fade show';
      alert.role = 'alert';
      alert.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>
        Plantilla guardada correctamente
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      // **Cambio clave**: solo llamamos a appendChild si alertContainerTpl existe
      if (alertContainerTpl) {
        alertContainerTpl.appendChild(alert);
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        // Si no existe el contenedor (por ejemplo, id mal escrito), igual redirigimos sin mostrar alerta
        window.location.href = 'index.html';
      }
    });
  }

  // ================== FUNCIONES COMUNES ==================

  /**
   * Renderiza la lista de etiquetas en el DOM (index.html)
   * Conserva exactamente la estructura original para no romper estilos ni drag & drop
   */
  function renderTags() {
    if (!tagsList) return;
    tagsList.innerHTML = '';

    tags.forEach((tag, index) => {
      // Filtra plantillas que contienen esta etiqueta
      const items = templates.filter(t => t.tags.includes(tag.id));

      const tagDiv = document.createElement('div');
      tagDiv.className = 'col-md-4';
      tagDiv.setAttribute('draggable', 'true');
      tagDiv.dataset.index = index;

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
                  <a class="dropdown-item" href="#" onclick="editTag(${index})">
                    <i class="bi bi-pencil me-2"></i>Editar
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" onclick="deleteTag(${index})">
                    <i class="bi bi-trash me-2"></i>Eliminar
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" onclick="shareTag(${index})">
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
                      onclick="insertItem(${index}, ${item.id})"
                      title="Insertar"
                    >
                      <i class="bi bi-check"></i>
                    </button>
                    <button
                      class="btn btn-link btn-sm p-0 me-2"
                      onclick="editItem(${index}, ${item.id})"
                      title="Editar"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-link btn-sm p-0 me-2"
                      onclick="lockItem(${index}, ${item.id})"
                      title="Bloquear"
                    >
                      <i class="bi bi-lock"></i>
                    </button>
                    <button
                      class="btn btn-link btn-sm p-0"
                      onclick="deleteItem(${index}, ${item.id})"
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

      tagsList.appendChild(tagDiv);

      // Expandir / colapsar contenido al hacer clic en header
      const header = tagDiv.querySelector('.tag-header');
      const content = tagDiv.querySelector('.tag-content');
      header.addEventListener('click', () => {
        content.style.display =
          content.style.display === 'none' ? 'block' : 'none';
      });

      // Drag & Drop para reordenar etiquetas (modelo original)
      tagDiv.addEventListener('dragstart', e => {
        tagDiv.classList.add('dragging');
      });
      tagDiv.addEventListener('dragover', e => {
        e.preventDefault();
        const draggingCard = document.querySelector('.dragging');
        if (draggingCard && draggingCard !== tagDiv) {
          const rect = tagDiv.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          if (e.clientY < midY) {
            tagsList.insertBefore(draggingCard, tagDiv);
          } else {
            tagsList.insertBefore(draggingCard, tagDiv.nextSibling);
          }
        }
      });
      tagDiv.addEventListener('dragend', e => {
        tagDiv.classList.remove('dragging');
        // Actualizar el array de tags según el nuevo orden en el DOM
        const newOrder = Array.from(
          document.querySelectorAll('#tagsList .tag-card .tag-name')
        ).map(span => tags.find(t => t.name === span.innerText));
        tags = newOrder;
        localStorage.setItem('tags', JSON.stringify(tags));
        renderTags();
      });
    });
  }

  // ======== CRUD ETIQUETAS ========

  window.editTag = function (index) {
    const tag = tags[index];
    if (!tag) return;
    // Redirige a tag.html con el parámetro tagId
    window.location.href = `tag.html?tagId=${encodeURIComponent(tag.id)}`;
  };

  window.deleteTag = function (index) {
    const tag = tags[index];
    if (!tag) return;

    // Verificar si la etiqueta tiene plantillas asociadas
    const plantillasConEstaEtiqueta = templates.filter(t =>
      t.tags.includes(tag.id)
    );

    if (plantillasConEstaEtiqueta.length > 0) {
      // Mostrar mensaje de error
      const alert = document.createElement('div');
      alert.className = 'alert alert-warning alert-dismissible fade show';
      alert.role = 'alert';
      alert.innerHTML = `
        <i class="bi bi-exclamation-triangle me-2"></i>
        No se puede eliminar la etiqueta "${tag.name}" porque tiene ${plantillasConEstaEtiqueta.length} plantilla(s) asociada(s).
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      if (alertContainer) {
        alertContainer.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
      }
      return;
    }

    // Si no tiene plantillas, proceder con la eliminación
    if (!confirm(`¿Seguro que deseas eliminar la etiqueta "${tag.name}"?`))
      return;

    tags.splice(index, 1);
    localStorage.setItem('tags', JSON.stringify(tags));
    renderTags();
  };

  window.shareTag = function (index) {
    const tag = tags[index];
    if (!tag) return;
    alert(
      `Compartir la etiqueta "${tag.name}" con otros usuarios (pendiente de implementar).`
    );
  };

  // ======== CRUD PLANTILLAS ========

  window.insertItem = function (tagIndex, itemId) {
    const item = templates.find(t => t.id === itemId);
    if (!item) return;
    // Copiar el texto de la plantilla al portapapeles como acción de ejemplo
    navigator.clipboard
      .writeText(item.templateText)
      .then(() => alert('Texto de plantilla copiado al portapapeles.'))
      .catch(() => alert('Error al copiar al portapapeles.'));
  };

  window.editItem = function (tagIndex, itemId) {
    const item = templates.find(t => t.id === itemId);
    if (!item) return;
    // Guardar en localStorage para precargar el formulario en template.html
    localStorage.setItem('editingTemplate', JSON.stringify(item));
    window.location.href = 'template.html';
  };

  window.lockItem = function (tagIndex, itemId) {
    alert('Funcionalidad de permisos pendiente de implementar.');
  };

  window.deleteItem = function (tagIndex, itemId) {
    if (!confirm('¿Eliminar esta plantilla de esta etiqueta?')) return;
    const tagId = tags[tagIndex].id;
    // Encontrar la plantilla y remover solo esta etiqueta de sus tags
    templates = templates.map(t => {
      if (t.id === itemId) {
        return {
          ...t,
          tags: t.tags.filter(tid => tid !== tagId),
        };
      }
      return t;
    });
    localStorage.setItem('templates', JSON.stringify(templates));
    renderTags();
  };
});
