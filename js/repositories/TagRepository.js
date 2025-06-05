import Tag from '../models/Tag.js';

export default class TagRepository {
  // Claves fijas en localStorage
  static STORAGE_KEY = 'tags';
  static LAST_ID_KEY = 'lastTagId';

  // Devuelve un array de instancias Tag
  static getAll() {
    const raw = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    const tags = raw.map(obj => new Tag(obj.id, obj.name, obj.color));
    this.ensureUnclassifiedTag(tags);
    return tags;
  }

  // Asegura que exista la etiqueta "Sin clasificar"
  static ensureUnclassifiedTag(tags) {
    const unclassifiedTag = tags.find(t => t.name === 'Sin clasificar');
    if (!unclassifiedTag) {
      const newTag = new Tag(this.getNextId(), 'Sin clasificar', '#6C757D');
      tags.push(newTag);
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(tags.map(t => t.toJSON()))
      );
    }
  }

  // Devuelve una instancia Tag o null
  static getById(id) {
    const all = this.getAll();
    return all.find(t => String(t.id) === String(id)) || null;
  }

  // Inserta o actualiza la etiqueta
  static save(tagInstance) {
    const all = this.getAll();
    const idx = all.findIndex(t => t.id === tagInstance.id);
    if (idx >= 0) {
      // Actualizar
      all[idx] = tagInstance;
    } else {
      // Insertar
      all.push(tagInstance);
    }
    // Guardar todo el array en localStorage
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(all.map(t => t.toJSON()))
    );
  }

  // Elimina una etiqueta por ID
  static delete(id) {
    const all = this.getAll();
    const filtered = all.filter(t => String(t.id) !== String(id));
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(filtered.map(t => t.toJSON()))
    );
  }

  // Obtiene el siguiente ID disponible
  static getNextId() {
    const next =
      parseInt(localStorage.getItem(this.LAST_ID_KEY) || '0', 10) + 1;
    localStorage.setItem(this.LAST_ID_KEY, String(next));
    return next;
  }
}
