export abstract class NamedObject {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  nameIsEqual(other: NamedObject) {
    return this.name === other.name;
  }

  abstract merge(other: NamedObject): void;
}

export class NamedObjectSet<T extends NamedObject> {
  private set: T[];

  constructor() {
    this.set = [];
  }

  merge(...others: T[]) {
    for (const other of others) {
      const i = this.set.findIndex(o => o.nameIsEqual(other));
      if (i >= 0) {
        this.set[i].merge(other);
      } else {
        this.set.push(other);
      }
    }
  }

  all(): T[] {
    return this.set;
  }
}
