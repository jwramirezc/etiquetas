import Template from '../models/Template.js';

export default class TemplateRepository {
  static STORAGE_KEY = 'templates';
  static LAST_ID_KEY = 'lastTemplateId';

  static getAll() {
    const raw = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    return raw.map(
      obj => new Template(obj.id, obj.text, obj.templateText, obj.tags)
    );
  }

  static getById(id) {
    const all = this.getAll();
    return all.find(t => String(t.id) === String(id)) || null;
  }

  static save(templateInstance) {
    const all = this.getAll();
    const idx = all.findIndex(t => t.id === templateInstance.id);
    if (idx >= 0) {
      all[idx] = templateInstance;
    } else {
      all.push(templateInstance);
    }
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(all.map(t => t.toJSON()))
    );
  }

  static delete(id) {
    const all = this.getAll();
    const filtered = all.filter(t => String(t.id) !== String(id));
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(filtered.map(t => t.toJSON()))
    );
  }

  static getNextId() {
    const next =
      parseInt(localStorage.getItem(this.LAST_ID_KEY) || '0', 10) + 1;
    localStorage.setItem(this.LAST_ID_KEY, String(next));
    return next;
  }
}
