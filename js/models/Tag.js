export default class Tag {
  constructor(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
  }
  toJSON() {
    return { id: this.id, name: this.name, color: this.color };
  }
}
