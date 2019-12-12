/**
 * Сделано задание на звездочку
 * Реализованы методы LinkedList.prev и LinkedList.next
 */
export const isStar = true;

class Node<T> {
    public readonly value: T;
    public prev?: Node<T>;
    public next?: Node<T>;

    constructor(value: T) {
        this.value = value;
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
    private link?: Node<T>;

    constructor() {
        super();
        this.link = this.head;
    }

    public prev(): T | undefined {
        if (this.link) {
            const current = this.link.value;
            if (this.link.prev) {
                this.link = this.link.prev;
            }

            return current;
        }

        return;
    }

    public next(): T | undefined {
        if (this.link) {
            const current = this.link.value;
            if (this.link.next) {
                this.link = this.link.next;
            }

            return current;
        }

        return;
    }

    public push(element: T): void {
        super.push(element);
        if (this.size === 1) {
            this.link = this.head;
        }
    }

    public pop(): T | undefined {
        if (this.link === this.tail) {
            this.prev();
        }
        const popItem = super.pop();
        if (this.size === 0) {
            this.link = this.head;
        }

        return popItem;
    }

    public unshift(element: T): void {
        super.unshift(element);
        if (this.size === 1) {
            this.link = this.head;
        }
    }

    public shift(): T | undefined {
        if (this.link === this.head) {
            this.next();
        }
        const shiftItem = super.shift();
        if (this.size === 0) {
            this.link = this.head;
        }

        return shiftItem;
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
    private first: Queue<T>;
    private second: Queue<T>;
    private third: Queue<T>;
    private _size: number;

    public get size(): number {
        return this._size;
    }

    constructor() {
        this.first = new Queue<T>();
        this.second = new Queue<T>();
        this.third = new Queue<T>();
        this._size = 0;
    }

    public enqueue(element: T, priority: Priority): void {
        if (!(priority in Priority)) {
            return;
        }
        if (priority === Priority.First) {
            this.first.enqueue(element);
        } else if (priority === Priority.Second) {
            this.second.enqueue(element);
        } else {
            this.third.enqueue(element);
        }
        this._size += 1;
    }

    public dequeue(): T | undefined {
        this._size -= 1;
        if (this.third.size !== 0) {
            return this.third.dequeue();
        } else if (this.second.size !== 0) {
            return this.second.dequeue();
        } else if (this.first.size !== 0) {
            return this.first.dequeue();
        }
        this._size += 1;

        return;
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
