/**
 * Archivo principal que inicializa la aplicación
 * Se encarga de detectar la página actual y crear el controlador correspondiente
 */

import IndexController from './controllers/IndexController.js';
import TagFormController from './controllers/TagFormController.js';
import TemplateFormController from './controllers/TemplateFormController.js';

/**
 * Inicializa la aplicación cuando el DOM está listo
 * Detecta la página actual basándose en elementos específicos del DOM
 * y crea el controlador correspondiente
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1) Verificar si estamos en index.html (buscando el elemento #tagsList)
  const tagsListEl = document.getElementById('tagsList');
  if (tagsListEl) {
    // Crear el controlador para la página principal
    const controller = new IndexController({
      tagsListEl,
      alertContainerEl: document.getElementById('alertContainer'),
      pageTitleEl: document.getElementById('pageTitle'), // no existe en index, pero sin problema
      sectionTitleEl: document.getElementById('sectionTitle'), // tampoco existe en index, es opcional
    });
    // Guardar en window para que los onclick inline funcionen
    window.indexController = controller;
    controller.initialize();
    return;
  }

  // 2) Verificar si estamos en tag.html (buscando el elemento #tagForm)
  const tagFormEl = document.getElementById('tagForm');
  if (tagFormEl) {
    // Crear el controlador para el formulario de etiquetas
    const controller = new TagFormController({
      formEl: tagFormEl,
      nameInputEl: document.getElementById('tagName'),
      colorInputEl: document.getElementById('tagColor'),
      alertContainerEl: document.getElementById('alertContainer'),
      pageTitleEl: document.getElementById('pageTitle'),
      formHeaderEl: document.getElementById('formHeader'),
      submitBtnEl: document.getElementById('submitBtn'),
    });
    controller.initialize();
    return;
  }

  // 3) Verificar si estamos en template.html (buscando el elemento #templateForm)
  const templateFormEl = document.getElementById('templateForm');
  if (templateFormEl) {
    // Crear el controlador para el formulario de plantillas
    const controller = new TemplateFormController({
      formEl: templateFormEl,
      nameInputEl: document.getElementById('templateName'),
      textInputEl: document.getElementById('templateText'),
      tagInputEl: document.getElementById('tagInput'),
      tagSuggestionsEl: document.getElementById('tagSuggestions'),
      tagContainerEl: document.getElementById('tagContainer'),
      alertContainerEl: document.getElementById('alertContainer'),
      sectionTitleEl: document.getElementById('sectionTitle'),
    });
    controller.initialize();
    return;
  }

  // Si llegamos aquí, no se encontró ningún controlador asociado
  // Esto puede ocurrir si estamos en una página no manejada por la aplicación
});
