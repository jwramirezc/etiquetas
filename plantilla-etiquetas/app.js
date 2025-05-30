// Estructura básica para manejar plantillas

document.addEventListener('DOMContentLoaded', () => {
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
    { name: 'Urgente', color: '#F55753' }, // Danger
    { name: 'Importante', color: '#F8D053' }, // Warning
    { name: 'Cliente', color: '#48B0F7' }, // Complete (azul brillante)
    { name: 'Interno', color: '#10CFBD' }, // Success (verde agua)
    { name: 'Revisión', color: '#A47AE2' }, // Complementario a Complete (morado suave)
    { name: 'Aprobado', color: '#10CFBD' }, // Success
    { name: 'Pendiente', color: '#F8A723' }, // Más fuerte que Warning
    { name: 'Soporte', color: '#3B4752' }, // Text-Base (gris oscuro)
    { name: 'Recordatorio', color: '#F55753' }, // Igual que Urgente
    { name: 'General', color: '#90A4AE' }, // Gris claro neutro
  ];

  // Renderizar etiquetas de prueba
  function renderTags() {
    if (!tagsList) return;

    tagsList.innerHTML = '';
    testTags.forEach((tag, index) => {
      const tagDiv = document.createElement('div');
      tagDiv.className = 'col-md-4';
      tagDiv.draggable = true;
      tagDiv.dataset.index = index;
      tagDiv.innerHTML = `
        <div class="tag-card">
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
      `;
      tagsList.appendChild(tagDiv);
    });

    // Implementar drag and drop
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

  // Inicializar
  if (tagsList) {
    renderTags();
  }
  if (templatesList) {
    loadTemplates();
    renderTemplates();
  }
});
