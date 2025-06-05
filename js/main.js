import IndexController from './controllers/IndexController.js';
import TagFormController from './controllers/TagFormController.js';
import TemplateFormController from './controllers/TemplateFormController.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1) Chequear si estoy en index.html (existencia de #tagsList)
  const tagsListEl = document.getElementById('tagsList');
  if (tagsListEl) {
    // Instanciar IndexController
    const controller = new IndexController({
      tagsListEl,
      alertContainerEl: document.getElementById('alertContainer'),
      pageTitleEl: document.getElementById('pageTitle'), // no existe en index, pero sin problema
      sectionTitleEl: document.getElementById('sectionTitle'), // tampoco existe en index, es opcional
    });
    // Guardar en window para que onclick inline funcione
    window.indexController = controller;
    controller.initialize();
    return;
  }

  // 2) Chequear si estoy en tag.html (existencia de #tagForm)
  const tagFormEl = document.getElementById('tagForm');
  if (tagFormEl) {
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

  // 3) Chequear si estoy en template.html (existencia de #templateForm)
  const templateFormEl = document.getElementById('templateForm');
  if (templateFormEl) {
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

  // Si llegamos aquí, no hay controlador asociado: posiblemente otra vista está cargada.
});
