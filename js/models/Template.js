export default class Template {
  constructor(id, text, templateText, tags = []) {
    this.id = id;
    this.text = text; // nombre de la plantilla
    this.templateText = templateText; // contenido de la plantilla
    this.tags = tags; // array de IDs de etiquetas
  }
  toJSON() {
    return {
      id: this.id,
      text: this.text,
      templateText: this.templateText,
      tags: this.tags.slice(), // clonar el array
    };
  }
}
