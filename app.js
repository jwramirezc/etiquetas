/**
 * Archivo principal de la aplicación
 * Este archivo contiene toda la lógica de la aplicación, incluyendo:
 * - Manejo de etiquetas y plantillas
 * - Interacción con el usuario
 * - Almacenamiento de datos
 * - Funcionalidades de drag & drop
 */

// // ======== CARGA INICIAL DE DATOS ========

// // Carga etiquetas desde localStorage
// let tags = JSON.parse(localStorage.getItem('tags')) || [];

// // Carga plantillas desde localStorage
// let templates = JSON.parse(localStorage.getItem('templates')) || [];

// ======== FUNCIONES AUXILIARES ========

/**
 * Genera un nuevo ID único para plantillas
 * Esta función:
 * 1. Lee el último ID usado desde localStorage
 * 2. Le suma 1 para crear un nuevo ID
 * 3. Guarda el nuevo ID en localStorage
 * 4. Retorna el nuevo ID
 *
 * @returns {number} El nuevo ID generado
 */
function generarNuevoTemplateId() {
  let nextId = parseInt(localStorage.getItem('lastTemplateId') || '0', 10) + 1;
  localStorage.setItem('lastTemplateId', nextId);
  return nextId;
}

/**
 * Genera un nuevo ID único para etiquetas
 * Esta función:
 * 1. Lee el último ID usado desde localStorage
 * 2. Le suma 1 para crear un nuevo ID
 * 3. Guarda el nuevo ID en localStorage
 * 4. Retorna el nuevo ID
 *
 * @returns {number} El nuevo ID generado
 */
function generarNuevoTagId() {
  let nextId = parseInt(localStorage.getItem('lastTagId') || '0', 10) + 1;
  localStorage.setItem('lastTagId', nextId);
  return nextId;
}

// ======== LÓGICA PRINCIPAL ========

/**
 * Inicializa la aplicación cuando el DOM está listo
 * Esta función:
 * 1. Obtiene todos los elementos necesarios del DOM
 * 2. Configura los eventos y listeners
 * 3. Inicializa la interfaz de usuario
 */
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

    /**
     * Agrega una etiqueta seleccionada al contenedor visual
     * Esta función:
     * 1. Crea un elemento visual para la etiqueta
     * 2. Agrega el color y nombre de la etiqueta
     * 3. Agrega un botón para remover la etiqueta
     * 4. Configura el evento para eliminar la etiqueta al hacer clic en el botón
     *
     * @param {Object} tagObj - El objeto etiqueta a agregar
     */
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
   * Renderiza la lista de etiquetas en el DOM
   * Esta función:
   * 1. Limpia la lista actual de etiquetas
   * 2. Para cada etiqueta:
   *    - Filtra las plantillas asociadas
   *    - Crea el elemento visual de la etiqueta
   *    - Agrega los botones de acción
   *    - Configura los eventos de drag & drop
   * 3. Actualiza el DOM con las nuevas etiquetas
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
      // ←————————— Aquí agregamos data-id
      tagDiv.dataset.id = tag.id;
      // ——————————→

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
                  <a class="dropdown-item" href="#" onclick="editTagById('${
                    tag.id
                  }')">
                    <i class="bi bi-pencil me-2"></i>Editar
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" onclick="deleteTagById('${
                    tag.id
                  }')">
                    <i class="bi bi-trash me-2"></i>Eliminar
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" onclick="shareTagById('${
                    tag.id
                  }')">
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
                      onclick="insertItemById('${tag.id}', ${item.id})"
                      title="Insertar"
                    >
                      <i class="bi bi-check"></i>
                    </button>
                    <button
                      class="btn btn-link btn-sm p-0 me-2"
                      onclick="editItemById('${tag.id}', ${item.id})"
                      title="Editar"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-link btn-sm p-0 me-2"
                      onclick="lockItemById('${tag.id}', ${item.id})"
                      title="Bloquear"
                    >
                      <i class="bi bi-lock"></i>
                    </button>
                    <button
                      class="btn btn-link btn-sm p-0"
                      onclick="deleteItemById('${tag.id}', ${item.id})"
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
        e.dataTransfer.setData('text/plain', tag.id); // Guardamos el ID en el dataTransfer
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
          document.querySelectorAll('#tagsList .tag-card')
        ).map(tagCard => {
          const tagName = tagCard.querySelector('.tag-name').innerText;
          return tags.find(t => t.name === tagName);
        });
        tags = newOrder;
        localStorage.setItem('tags', JSON.stringify(tags));
        renderTags();
      });
    });
  }

  // ======== CRUD ETIQUETAS ========

  /**
   * Edita una etiqueta existente
   * Esta función:
   * 1. Obtiene la etiqueta por su ID
   * 2. Redirige a la página de edición con el ID de la etiqueta
   *
   * @param {number} id - El ID de la etiqueta a editar
   */
  window.editTagById = function (id) {
    const tag = tags.find(t => t.id === id);
    if (!tag) return;
    window.location.href = `tag.html?tagId=${encodeURIComponent(tag.id)}`;
  };

  /**
   * Elimina una etiqueta
   * Esta función:
   * 1. Verifica si la etiqueta tiene plantillas asociadas
   * 2. Si tiene plantillas, muestra un mensaje de error
   * 3. Si no tiene plantillas, pide confirmación
   * 4. Si se confirma, elimina la etiqueta y actualiza la vista
   *
   * @param {number} id - El ID de la etiqueta a eliminar
   */
  window.deleteTagById = function (id) {
    const tagIndex = tags.findIndex(t => t.id === id);
    if (tagIndex === -1) return;
    const tag = tags[tagIndex];

    const plantillasConEstaEtiqueta = templates.filter(t =>
      t.tags.includes(tag.id)
    );

    if (plantillasConEstaEtiqueta.length > 0) {
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

    if (!confirm(`¿Seguro que deseas eliminar la etiqueta "${tag.name}"?`))
      return;

    tags.splice(tagIndex, 1);
    localStorage.setItem('tags', JSON.stringify(tags));
    renderTags();
  };

  /**
   * Muestra un mensaje de compartir etiqueta (pendiente de implementar)
   * Esta función:
   * 1. Obtiene la etiqueta por su ID
   * 2. Muestra un mensaje indicando que la funcionalidad está pendiente
   *
   * @param {number} id - El ID de la etiqueta a compartir
   */
  window.shareTagById = function (id) {
    const tag = tags.find(t => t.id === id);
    if (!tag) return;
    alert(
      `Funcionalidad de compartir para la etiqueta "${tag.name}" está pendiente de implementación.`
    );
  };

  // ======== CRUD PLANTILLAS ========

  /**
   * Inserta una plantilla (pendiente de implementar)
   * Esta función:
   * 1. Obtiene la plantilla por su ID
   * 2. Copia el texto de la plantilla al portapapeles
   * 3. Muestra un mensaje de éxito o error
   *
   * @param {number} tagId - El ID de la etiqueta
   * @param {number} itemId - El ID de la plantilla
   */
  window.insertItemById = function (tagId, itemId) {
    // Implementar lógica para insertar item
  };

  /**
   * Edita una plantilla existente
   * Esta función:
   * 1. Obtiene la plantilla por su ID
   * 2. Guarda la plantilla en localStorage para editarla
   * 3. Redirige a la página de edición
   *
   * @param {number} tagId - El ID de la etiqueta
   * @param {number} itemId - El ID de la plantilla
   */
  window.editItemById = function (tagId, itemId) {
    // Implementar lógica para editar item
  };

  /**
   * Muestra un mensaje de bloquear plantilla (pendiente de implementar)
   * Esta función:
   * 1. Muestra un mensaje indicando que la funcionalidad está pendiente
   *
   * @param {number} tagId - El ID de la etiqueta
   * @param {number} itemId - El ID de la plantilla
   */
  window.lockItemById = function (tagId, itemId) {
    // Implementar lógica para bloquear item
  };

  /**
   * Elimina una plantilla de una etiqueta
   * Esta función:
   * 1. Pide confirmación al usuario
   * 2. Si se confirma, elimina la relación entre la plantilla y la etiqueta
   * 3. Actualiza el almacenamiento y la vista
   *
   * @param {number} tagId - El ID de la etiqueta
   * @param {number} itemId - El ID de la plantilla
   */
  window.deleteItemById = function (tagId, itemId) {
    // Implementar lógica para eliminar item
  };
});
