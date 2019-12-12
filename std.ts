/**
 * Сделано задание на звездочку
 * Реализованы методы LinkedList.prev и LinkedList.next
 */
export const isStar = false;

class Node<T> {
    public readonly value: T;
    public prev?: Node<T>;
    public next?: Node<T>;

    constructor(value: T) {
        this.value = value;
        this.prev = this.next = undefined;
    }
}

class PriorityNode<T> {
    public readonly value: T;
    public prev?: PriorityNode<T>;
    public next?: PriorityNode<T>;
    public readonly priority: Priority;

    constructor(value: T, priority: number) {
        this.value = value;
        this.priority = priority;
        this.prev = this.next = undefined;
    }
}

class List<T> {
    protected head?: Node<T>;
    protected tail?: Node<T>;
    protected _size: number;
    public get size(): number {
        return this._size;
    }

    constructor() {
        this.head = this.tail = undefined;
        this._size = 0;
    }

    protected push(element: T): void {
        const newItem = new Node<T>(element);
        if (this.tail) {
            this.tail.next = newItem;
            newItem.prev = this.tail;
            this.tail = newItem;
        } else {
            this.head = this.tail = newItem;
        }
        this._size += 1;
    }
    protected shift(): T | undefined {
        const head = this.head;
        const next = head ? head.next : undefined;
        if (!head) {
            return;
        }
        if (next) {
            next.prev = undefined;
            this.head = next;
        } else {
            this.head = this.tail = undefined;
        }
        this._size -= 1;

        return head.value;
    }

    protected get(index: number): T | undefined {
        if (index < 0 || index >= this._size) {
            return;
        }
        let count = 0;
        let currentNode = this.head;
        while (index !== count) {
            currentNode = currentNode ? currentNode.next : undefined;
            count += 1;
        }

        return currentNode ? currentNode.value : undefined;
    }

    protected pop(): T | undefined {
        const tail = this.tail;
        const prev = tail ? tail.prev : undefined;
        if (!tail) {
            return;
        }
        if (prev) {
            prev.next = undefined;
            this.tail = prev;
        } else {
            this.head = this.tail = undefined;
        }
        this._size -= 1;

        return tail.value;
    }

    protected unshift(element: T): void {
        const newItem = new Node<T>(element);
        if (this.head) {
            this.head.prev = newItem;
            newItem.next = this.head;
            this.head = newItem;
        } else {
            this.head = this.tail = newItem;
        }
        this._size += 1;
    }
}

export class LinkedList<T> extends List<T> {
    constructor() {
        super();
    }

    public push(element: T): void {
        super.push(element);
    }

    public pop(): T | undefined {
        return super.pop();
    }

    public unshift(element: T): void {
        super.unshift(element);
    }

    public shift(): T | undefined {
        return super.shift();
    }

    public get(index: number): T | undefined {
        return super.get(index);
    }
}


export class RingBuffer<T> extends List<T> {
    private _capacity: number;

    public get capacity(): number {
        return this._capacity;
    }

    constructor(capacity: number) {
        super();
        this._capacity = capacity;
    }

    public get(index: number): T | undefined {
        return super.get(index);
    }

    public push(element: T): void {
        super.push(element);
        if (this.size > this._capacity) {
            super.shift();
        }
    }

    public shift(): T | undefined {
        return super.shift();
    }

    private extend(buffer: RingBuffer<T>): void {
        this._capacity += buffer.capacity;
        const bufferSize = buffer.size;
        for (let i = 0; i < bufferSize; i++) {
            const node = buffer.get(i);
            if (node) {
                this.push(node);
            }
        }

        return;
    }

    public static concat<U>(...buffers: RingBuffer<U>[]): RingBuffer<U> {
        const newBuffer = new RingBuffer<U>(0);
        for (const buffer of buffers) {
            newBuffer.extend(buffer);
        }

        return newBuffer;
    }
}

export class Queue<T> extends List<T> {
    constructor() {
        super();
    }

    public enqueue(element: T): void {
        super.unshift(element);
    }

    public dequeue(): T | undefined {
        return super.pop();
    }

    public get(index: number): T | undefined {
        return super.get(index);
    }

}

enum Priority {
    First = 1,
    Second = 2,
    Third = 3
}

export class PriorityQueue<T> {
    private start?: PriorityNode<T>;
    private end?: PriorityNode<T>;
    private _size: number;

    get size(): number {
        return this._size;
    }

    constructor() {
        this.start = this.end = undefined;
        this._size = 0;
    }

    public enqueue(element: T, priority: number): void {
        if (!(priority in Priority)) {
            return;
        }
        const newItem = new PriorityNode<T>(element, priority);
        if (this.end) {
            this.end.prev = newItem;
            newItem.next = this.end;
            this.end = newItem;
        } else {
            this.end = this.start = newItem;
        }
        this._size += 1;
    }

    private getMax(): PriorityNode<T> | undefined {
        let start = this.start;
        if (!start) {
            return;
        }

        let max = start.priority;
        let maxNode = start;

        while (start.prev) {
            start = start.prev;
            if (start.priority > max) {
                max = start.priority;
                maxNode = start;
            }
        }

        return maxNode;
    }

    public dequeue(): T | undefined {
        const maxNode = this.getMax();
        if (!maxNode) {
            return;
        }

        if (maxNode.prev) {
            maxNode.prev.next = maxNode.next;
        } else {
            this.end = maxNode.next;
        }
        if (maxNode.next) {
            maxNode.next.prev = maxNode.prev;
        } else {
            this.start = maxNode.prev;
        }
        this._size -= 1;

        return maxNode.value;
    }
}

export class HashTable<K, V> {
    private key: Array<K>;
    private value: Array<V>;
    private _size: number;

    get size(): number {
        return this._size;
    }

    constructor() {
        this.key = [];
        this.value = [];
        this._size = 0;
    }

    public put(key: K, element: V): void {
        for (let i = 0; i < this.key.length; i++) {
            if (this.key[i] === key) {
                this.value[i] = element;

                return;
            }
        }
        this.key.push(key);
        this.value.push(element);
        this._size += 1;
    }

    public clear(): void {
        this.key = [];
        this.value = [];
        this._size = 0;
    }

    public get(key: K): V | undefined {
        for (let i = 0; i < this.key.length; i++) {
            if (this.key[i] === key) {
                return this.value[i];
            }
        }

        return;
    }
}
