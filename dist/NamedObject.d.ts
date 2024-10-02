export declare abstract class NamedObject {
    name: string;
    constructor(name: string);
    nameIsEqual(other: NamedObject): boolean;
    abstract merge(other: NamedObject): void;
}
export declare class NamedObjectSet<T extends NamedObject> {
    private set;
    constructor();
    merge(...others: T[]): void;
    all(): T[];
}
