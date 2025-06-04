// Gestor de plantillas y etiquetas - Mejorado con Drag and Drop

document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM que se utilizan en la aplicación
  const pageTitle = document.getElementById('pageTitle');
  const sectionTitle = document.getElementById('sectionTitle');
  const templateName = document.getElementById('templateName');
  const templateText = document.getElementById('templateText');
  const templateForm = document.getElementById('templateForm');
  const tagsList = document.getElementById('tagsList');
  const alertContainer = document.getElementById('alertContainer');

  // Inicializa el toast de éxito si existe en la página
  const successToast = document.getElementById('successToast')
    ? new bootstrap.Toast(document.getElementById('successToast'))
    : null;

  // Array de etiquetas predefinidas con sus colores
  const testTags = [
    { id: 1, name: 'Urgente', color: '#F55753' },
    { id: 2, name: 'Importante', color: '#F8D053' },
    { id: 3, name: 'Cliente', color: '#48B0F7' },
    { id: 4, name: 'Interno', color: '#10CFBD' },
    { id: 5, name: 'Revisión', color: '#A47AE2' },
    { id: 6, name: 'Aprobado', color: '#10CFBD' },
    { id: 7, name: 'Pendiente', color: '#F8A723' },
    { id: 8, name: 'Soporte', color: '#3B4752' },
    { id: 9, name: 'Recordatorio', color: '#F55753' },
    { id: 10, name: 'Sin etiqueta', color: '#90A4AE' },
  ];

  // Objeto que contiene los ítems asociados a cada etiqueta
  // Agregar esto después del array testTags
  const tagItems = {
    1: [
      // Urgente
      { id: 1, text: 'Revisión de seguridad crítica' },
      { id: 2, text: 'Actualización de emergencia' },
      { id: 3, text: 'Incidente de producción' },
    ],
    2: [
      // Importante
      { id: 1, text: 'Reunión de planificación trimestral' },
      { id: 2, text: 'Presentación ejecutiva' },
      { id: 3, text: 'Revisión de presupuesto' },
    ],
    3: [
      // Cliente
      { id: 1, text: 'Propuesta comercial' },
      { id: 2, text: 'Contrato de servicio' },
      { id: 3, text: 'Reporte de satisfacción' },
    ],
    4: [
      // Interno
      { id: 1, text: 'Política de recursos humanos' },
      { id: 2, text: 'Manual de procedimientos' },
      { id: 3, text: 'Guía de onboarding' },
    ],
    5: [
      // Revisión
      { id: 1, text: 'Documento técnico' },
      { id: 2, text: 'Código fuente' },
      { id: 3, text: 'Especificaciones de diseño' },
    ],
    6: [
      // Aprobado
      { id: 1, text: 'Proyecto finalizado' },
      { id: 2, text: 'Cambios implementados' },
      { id: 3, text: 'Versión estable' },
    ],
    7: [
      // Pendiente
      { id: 1, text: 'Tareas pendientes' },
      { id: 2, text: 'Seguimiento de proyecto' },
      { id: 3, text: 'Lista de verificación' },
    ],
    8: [
      // Soporte
      { id: 1, text: 'Guía de solución de problemas' },
      { id: 2, text: 'Base de conocimientos' },
      { id: 3, text: 'FAQ actualizado' },
    ],
    9: [
      // Recordatorio
      { id: 1, text: 'Reunión semanal' },
      { id: 2, text: 'Entrega de reportes' },
      { id: 3, text: 'Revisión de objetivos' },
    ],
    10: [
      // General
      { id: 1, text: 'Notas de la reunión' },
      { id: 2, text: 'Documentación general' },
      { id: 3, text: 'Información de referencia' },
    ],
  };

  /**
   * Obtiene el ítem que está siendo editado desde el localStorage
   * @returns {Object|null} El ítem en edición o null si no hay ninguno
   */
  const getEditingItem = () => JSON.parse(localStorage.getItem('editingItem'));

  /**
   * Obtiene la etiqueta que está siendo editada desde el localStorage
   * @returns {Object|null} La etiqueta en edición o null si no hay ninguna
   */
  const getEditingTag = () => JSON.parse(localStorage.getItem('editingTag'));

  /**
   * Rellena el formulario con los datos de un ítem que se está editando
   * @param {Object} item - El ítem que se está editando
   */
  function populateFormFromItem(item) {
    if (!item) return;
    pageTitle.textContent = sectionTitle.textContent = 'Editar Item';
    templateName.value = item.itemText;
    templateText.value =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    localStorage.removeItem('editingItem');
  }

  /**
   * Rellena el formulario con los datos de una etiqueta que se está editando
   * @param {Object} tag - La etiqueta que se está editando
   */
  function populateFormFromTag(tag) {
    if (!tag) return;
    pageTitle.textContent = sectionTitle.textContent = 'Editar Plantilla';
    templateName.value = tag.name;
    templateText.value = tag.items.map(i => i.text).join('\n');
    localStorage.removeItem('editingTag');
  }

  /**
   * Muestra una alerta temporal con un mensaje
   * @param {string} message - El mensaje a mostrar en la alerta
   */
  function showAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.role = 'alert';
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alert);
    setTimeout(() => alert.classList.remove('show'), 3000);
    setTimeout(() => alert.remove(), 3150);
  }

  /**
   * Renderiza la lista de etiquetas en el DOM
   * Esta función crea y muestra todas las etiquetas con sus ítems asociados
   * También configura los eventos de arrastrar y soltar, y expandir/colapsar
   */
  function renderTags() {
    if (!tagsList) return;
    tagsList.innerHTML = '';

    testTags.forEach((tag, index) => {
      const items = tagItems[tag.id] || [];
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
                <li><a class="dropdown-item" href="#" onclick="editTag(${index})"><i class="bi bi-pencil me-2"></i>Editar</a></li>
                <li><a class="dropdown-item" href="#" onclick="deleteTag(${index})"><i class="bi bi-trash me-2"></i>Eliminar</a></li>
                <li><a class="dropdown-item" href="#" onclick="shareTag(${index})"><i class="bi bi-share me-2"></i>Compartir</a></li>
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
                    <button class="btn btn-link btn-sm p-0 me-2" onclick="insertItem(${index}, ${item.id})"><i class="bi bi-check"></i></button>
                    <button class="btn btn-link btn-sm p-0 me-2" onclick="editItem(${index}, ${item.id})"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-link btn-sm p-0 me-2" onclick="lockItem(${index}, ${item.id})"><i class="bi bi-lock"></i></button>
                    <button class="btn btn-link btn-sm p-0" onclick="deleteItem(${index}, ${item.id})"><i class="bi bi-trash"></i></button>
                  </div>
                </li>`
                )
                .join('')}
            </ul>
          </div>
        </div>`;

      tagsList.appendChild(tagDiv);

      // Expandir/colapsar
      const header = tagDiv.querySelector('.tag-header');
      header.addEventListener('click', e => {
        if (e.target.closest('.dropdown') || e.target.closest('.drag-handle'))
          return;
        const content = tagDiv.querySelector('.tag-content');
        const isExpanded = content.style.display !== 'none';
        content.style.display = isExpanded ? 'none' : 'block';
      });

      // Drag and Drop
      tagDiv.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', index);
        tagDiv.classList.add('dragging');
      });

      tagDiv.addEventListener('dragend', () => {
        tagDiv.classList.remove('dragging');
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
    });
  }

  /**
   * Maneja el envío del formulario de plantilla
   * Recopila los datos del formulario y los guarda
   * @param {Event} e - El evento de envío del formulario
   */
  function handleFormSubmit(e) {
    e.preventDefault();
    const selectedTagElements = document.querySelectorAll('.selected-tag');
    const tags = Array.from(selectedTagElements).map(
      el => testTags[parseInt(el.dataset.index)]
    );
    const data = {
      name: templateName.value,
      text: templateText.value,
      tags: tags,
    };
    console.log('Guardando plantilla:', data);
    successToast?.show();
    setTimeout(() => (window.location.href = 'tags.html'), 1500);
  }

  /**
   * Maneja la edición de un ítem de etiqueta
   * Guarda los datos del ítem en localStorage y redirige a template.html
   * @param {number} tagIndex - Índice de la etiqueta en el array testTags
   * @param {number} itemId - ID del ítem a editar
   */
  window.editItem = function (tagIndex, itemId) {
    // Obtener los datos de la etiqueta y el ítem
    const tag = testTags[tagIndex];
    const items = tagItems[tag.id] || [];
    const item = items.find(i => i.id === itemId);

    if (item) {
      // Guardar los datos del ítem en localStorage antes de redirigir
      const itemToEdit = {
        tagId: tag.id,
        tagName: tag.name,
        tagColor: tag.color,
        itemId: item.id,
        itemText: item.text,
      };
      localStorage.setItem('editingItem', JSON.stringify(itemToEdit));

      // Redirigir a template.html
      window.location.href = 'template.html';
    }
  };

  /**
   * Inserta un ítem en la plantilla actual
   * @param {number} tagIndex - Índice de la etiqueta en el array testTags
   * @param {number} itemId - ID del ítem a insertar
   */
  window.insertItem = function (tagIndex, itemId) {
    const tag = testTags[tagIndex];
    const items = tagItems[tag.id] || [];
    const item = items.find(i => i.id === itemId);

    if (item) {
      // Aquí iría la lógica para insertar el ítem
      showAlert('Insertado correctamente');
    }
  };

  /**
   * Elimina un ítem de la etiqueta
   * @param {number} tagIndex - Índice de la etiqueta en el array testTags
   * @param {number} itemId - ID del ítem a eliminar
   */
  window.deleteItem = function (tagIndex, itemId) {
    const tag = testTags[tagIndex];
    const items = tagItems[tag.id] || [];
    const item = items.find(i => i.id === itemId);

    if (item) {
      // Aquí iría la lógica para eliminar el ítem
      showAlert('Eliminado correctamente');
    }
  };

  /**
   * Bloquea/desbloquea un ítem de la etiqueta
   * @param {number} tagIndex - Índice de la etiqueta en el array testTags
   * @param {number} itemId - ID del ítem a bloquear/desbloquear
   */
  window.lockItem = function (tagIndex, itemId) {
    const tag = testTags[tagIndex];
    const items = tagItems[tag.id] || [];
    const item = items.find(i => i.id === itemId);

    if (item) {
      // Aquí iría la lógica para bloquear/desbloquear el ítem
      showAlert('Permisos asignados');
    }
  };

  // Inicialización de la aplicación
  const item = getEditingItem();
  if (item) populateFormFromItem(item);
  const tag = getEditingTag();
  if (tag) populateFormFromTag(tag);

  // Cargar etiquetas guardadas al iniciar
  const savedTags = localStorage.getItem('testTags');
  const savedItems = localStorage.getItem('tagItems');
  if (savedTags) {
    testTags.length = 0; // Limpiar array existente
    testTags.push(...JSON.parse(savedTags));
  }
  if (savedItems) {
    Object.assign(tagItems, JSON.parse(savedItems));
  }

  // Manejo del formulario de etiquetas
  const tagForm = document.getElementById('tagForm');
  if (tagForm) {
    tagForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const tagName = document.getElementById('tagName').value;
      const tagColor = document.getElementById('tagColor').value;

      // Crear nueva etiqueta
      const newTag = {
        id: testTags.length + 1,
        name: tagName,
        color: tagColor,
      };

      // Agregar la nueva etiqueta al array
      testTags.push(newTag);

      // Inicializar el array de items para la nueva etiqueta
      tagItems[newTag.id] = [];

      // Guardar en localStorage para persistencia
      localStorage.setItem('testTags', JSON.stringify(testTags));
      localStorage.setItem('tagItems', JSON.stringify(tagItems));

      // Mostrar mensaje de éxito usando alerta de Bootstrap
      const alertContainer = document.getElementById('alertContainer');
      const alert = document.createElement('div');
      alert.className = 'alert alert-success alert-dismissible fade show';
      alert.role = 'alert';
      alert.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>
        Etiqueta guardada correctamente
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      alertContainer.appendChild(alert);

      // Redirigir después de un breve delay
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    });
  }

  // Renderizar las etiquetas después de cargar los datos
  if (templateForm) templateForm.addEventListener('submit', handleFormSubmit);
  if (tagsList) {
    renderTags();
    // Agregar listener para actualizar la vista cuando cambie el localStorage
    window.addEventListener('storage', function (e) {
      if (e.key === 'testTags' || e.key === 'tagItems') {
        renderTags();
      }
    });
  }
});
