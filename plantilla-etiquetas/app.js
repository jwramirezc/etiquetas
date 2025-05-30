// Estructura básica para manejar plantillas

document.addEventListener('DOMContentLoaded', () => {
  // Check if we're in edit mode for an item
  const editingItem = localStorage.getItem('editingItem');
  if (editingItem) {
    const item = JSON.parse(editingItem);

    // Update page title and section title
    document.getElementById('pageTitle').textContent = 'Editar Item';
    document.getElementById('sectionTitle').textContent = 'Editar Item';

    // Fill the form with the item data
    document.getElementById('templateName').value = item.tagName;
    document.getElementById('templateText').value = item.itemText;

    // Clear the editing item from localStorage
    localStorage.removeItem('editingItem');
  }

  // Check if we're in edit mode
  const editingTag = localStorage.getItem('editingTag');
  if (editingTag) {
    const tag = JSON.parse(editingTag);

    // Update page title and section title
    document.getElementById('pageTitle').textContent = 'Editar Plantilla';
    document.getElementById('sectionTitle').textContent = 'Editar Plantilla';

    // Fill the form with the tag data
    document.getElementById('templateName').value = tag.name;
    document.getElementById('templateText').value = tag.items
      .map(item => item.text)
      .join('\n');

    // Clear the editing tag from localStorage
    localStorage.removeItem('editingTag');
  }

  // Elementos del DOM
  const templateForm = document.getElementById('templateForm');
  const templatesList = document.getElementById('templatesList');
  const insertTemplateSelect = document.getElementById('insertTemplateSelect');
  const insertTemplateBtn = document.getElementById('insertTemplateBtn');
  const mainTextArea = document.getElementById('mainTextArea');
  const tagsList = document.getElementById('tagsList');

  // Función para cargar plantillas desde localStorage
  function loadTemplates() {
    // TODO: Implementar
  }

  // Función para guardar una nueva plantilla
  function saveTemplate(template) {
    // TODO: Implementar
  }

  // Función para renderizar la lista de plantillas
  function renderTemplates() {
    // TODO: Implementar
  }

  // Funciones para la página de creación de plantilla
  if (document.getElementById('templateForm')) {
    const tagSelect = document.getElementById('tagSelect');
    const selectedTags = document.getElementById('selectedTags');
    const templateForm = document.getElementById('templateForm');
    const successToast = new bootstrap.Toast(
      document.getElementById('successToast')
    );

    // Evento para guardar plantilla
    templateForm.addEventListener('submit', e => {
      e.preventDefault();

      // Obtener etiquetas seleccionadas
      const selectedTagElements = document.querySelectorAll('.selected-tag');
      const tags = Array.from(selectedTagElements).map(el => {
        const index = parseInt(el.dataset.index);
        return testTags[index];
      });

      // Aquí iría la lógica para guardar la plantilla
      console.log('Guardando plantilla:', {
        name: document.getElementById('templateName').value,
        text: document.getElementById('templateText').value,
        tags: tags,
      });

      // Mostrar mensaje de éxito
      successToast.show();

      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        window.location.href = 'tags.html';
      }, 1500);
    });
  }

  // Evento para insertar plantilla en el área de texto
  if (insertTemplateBtn) {
    insertTemplateBtn.addEventListener('click', () => {
      // TODO: Insertar texto de la plantilla seleccionada en el área de texto
    });
  }

  // Etiquetas de prueba
  const testTags = [
    { id: 1, name: 'Urgente', color: '#F55753' }, // Danger
    { id: 2, name: 'Importante', color: '#F8D053' }, // Warning
    { id: 3, name: 'Cliente', color: '#48B0F7' }, // Complete (azul brillante)
    { id: 4, name: 'Interno', color: '#10CFBD' }, // Success (verde agua)
    { id: 5, name: 'Revisión', color: '#A47AE2' }, // Complementario a Complete (morado suave)
    { id: 6, name: 'Aprobado', color: '#10CFBD' }, // Success
    { id: 7, name: 'Pendiente', color: '#F8A723' }, // Más fuerte que Warning
    { id: 8, name: 'Soporte', color: '#3B4752' }, // Text-Base (gris oscuro)
    { id: 9, name: 'Recordatorio', color: '#F55753' }, // Igual que Urgente
    { id: 10, name: 'Sin etiqueta', color: '#90A4AE' }, // Gris claro neutro
  ];

  // Add this after the testTags array
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

  // Update the renderTags function
  function renderTags() {
    if (!tagsList) return;

    tagsList.innerHTML = '';
    testTags.forEach((tag, index) => {
      const tagDiv = document.createElement('div');
      tagDiv.className = 'col-md-4';
      tagDiv.draggable = true;
      tagDiv.dataset.index = index;

      // Get items for this tag
      const items = tagItems[tag.id] || [];

      tagDiv.innerHTML = `
        <div class="tag-card">
          <div class="tag-header" style="cursor: pointer;">
            <button class="drag-handle btn btn-link p-0 me-2">
              <i class="bi bi-grip-vertical"></i>
            </button>
            <span class="tag-color" style="background:${tag.color}"></span>
            <span class="tag-name">${tag.name}</span>
            <div class="dropdown">
              <button class="btn btn-link p-0 tag-options" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#" onclick="editTag(${index})">
                  <i class="bi bi-pencil me-2"></i>Editar
                </a></li>
                <li><a class="dropdown-item" href="#" onclick="deleteTag(${index})">
                  <i class="bi bi-trash me-2"></i>Eliminar
                </a></li>
                <li><a class="dropdown-item" href="#" onclick="shareTag(${index})">
                  <i class="bi bi-share me-2"></i>Compartir
                </a></li>
              </ul>
            </div>
          </div>
          <div class="tag-content" style="display: none; padding: 10px; border-top: 1px solid #e0e0e0; margin-top: 8px;">
            <ul class="list-group list-group-flush">
              ${items
                .map(
                  item => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span>${item.text}</span>
                  <div class="item-actions">
                    <button class="btn btn-link btn-sm p-0 me-2" onclick="insertItem(${index}, ${item.id})" title="Insertar">
                      <i class="bi bi-plus-circle"></i>
                    </button>
                    <button class="btn btn-link btn-sm p-0 me-2" onclick="editItem(${index}, ${item.id})" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-link btn-sm p-0" onclick="deleteItem(${index}, ${item.id})" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </li>
              `
                )
                .join('')}
            </ul>
          </div>
        </div>
      `;
      tagsList.appendChild(tagDiv);
    });

    // Add click event for expanding/collapsing content
    const tagHeaders = document.querySelectorAll('.tag-header');
    tagHeaders.forEach(header => {
      header.addEventListener('click', e => {
        // Prevent click if clicking on dropdown or drag handle
        if (e.target.closest('.dropdown') || e.target.closest('.drag-handle')) {
          return;
        }
        const content = header.nextElementSibling;
        const isExpanded = content.style.display !== 'none';
        content.style.display = isExpanded ? 'none' : 'block';
      });
    });

    // Implement drag and drop
    const tagCards = document.querySelectorAll('.tag-card');
    tagCards.forEach(card => {
      const parent = card.parentElement;

      parent.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', parent.dataset.index);
        parent.classList.add('dragging');
      });

      parent.addEventListener('dragend', () => {
        parent.classList.remove('dragging');
      });

      parent.addEventListener('dragover', e => {
        e.preventDefault();
        const draggingCard = document.querySelector('.dragging');
        if (draggingCard !== parent) {
          const rect = parent.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          if (e.clientY < midY) {
            parent.parentElement.insertBefore(draggingCard, parent);
          } else {
            parent.parentElement.insertBefore(draggingCard, parent.nextSibling);
          }
        }
      });
    });
  }

  // Funciones para las acciones del menú
  window.editTag = function (index) {
    console.log('Editar etiqueta:', testTags[index]);
    // TODO: Implementar edición
  };

  window.deleteTag = function (index) {
    console.log('Eliminar etiqueta:', testTags[index]);
    // TODO: Implementar eliminación
  };

  window.shareTag = function (index) {
    console.log('Compartir etiqueta:', testTags[index]);
    // TODO: Implementar compartir
  };

  // Add these new functions for item actions
  window.insertItem = function (tagIndex, itemId) {
    console.log('Insertar item:', { tagIndex, itemId });
    // TODO: Implementar inserción
  };

  window.editItem = function (tagIndex, itemId) {
    // Get the tag and item data
    const tag = testTags[tagIndex];
    const items = tagItems[tag.id] || [];
    const item = items.find(i => i.id === itemId);

    if (item) {
      // Store the item data in localStorage before redirecting
      const itemToEdit = {
        tagId: tag.id,
        tagName: tag.name,
        tagColor: tag.color,
        itemId: item.id,
        itemText: item.text,
      };
      localStorage.setItem('editingItem', JSON.stringify(itemToEdit));

      // Redirect to template.html
      window.location.href = 'template.html';
    }
  };

  window.deleteItem = function (tagIndex, itemId) {
    // Get the tag and item data
    const tag = testTags[tagIndex];
    const items = tagItems[tag.id] || [];
    const itemIndex = items.findIndex(i => i.id === itemId);

    if (itemIndex !== -1) {
      // Remove the item from the array
      items.splice(itemIndex, 1);

      // Show success alert
      const alertContainer = document.getElementById('alertContainer');
      const alert = document.createElement('div');
      alert.className = 'alert alert-success alert-dismissible fade show';
      alert.role = 'alert';
      alert.innerHTML = `
        Plantilla eliminada correctamente
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      alertContainer.appendChild(alert);

      // Remove the alert after 3 seconds
      setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
          alert.remove();
        }, 150);
      }, 3000);

      // Re-render the tags to update the view
      renderTags();
    }
  };

  // Inicializar
  if (tagsList) {
    renderTags();
  }
  if (templatesList) {
    loadTemplates();
    renderTemplates();
  }
});
