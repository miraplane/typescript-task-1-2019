/* eslint-env mocha */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as assert from 'assert';

import * as std from './std';

describe('std', () => {
    describe('LinkedList', () => {
        const ll = new (std.LinkedList as any)();

        it('Можно добавлять элементы', () => {
            assert.equal(ll.size, 0);

            ll.push(1);
            ll.push(2);

            assert.equal(ll.size, 2);
        });

        if (std.isStar) {
            it('Можно ходить по списку с помощью prev / next', () => {
                assert.equal(ll.next(), 1);
                assert.equal(ll.prev(), 2);
                assert.equal(ll.next(), 1);
                assert.equal(ll.prev(), 2);
            });
        }

        it('Можно доставать элементы', () => {
            assert.equal(ll.size, 2);

            assert.equal(ll.pop(), 2);
            assert.equal(ll.shift(), 1);

            assert.equal(ll.size, 0);
        });

        it('Можно добавлять элементы в начало', () => {
            ll.unshift(3);
            ll.unshift(4);

            assert.equal(ll.size, 2);
        });

        it('Можно добавлять элементы и в начало и в конец', () => {
            ll.push(1);

            assert.equal(ll.size, 3);
        });

        it('Можно брать элементы по индексу', () => {
            assert.equal(ll.get(1), 3);
            assert.equal(ll.get(0), 4);
            assert.equal(ll.get(-1), undefined);
            assert.equal(ll.get(3), undefined);
        });

        it('Можно удалять из начала и конца', () => {
            assert.equal(ll.shift(), 4);
            assert.equal(ll.pop(), 1);
            assert.equal(ll.shift(), 3);
            assert.equal(ll.pop(), undefined);
            assert.equal(ll.shift(), undefined);

            assert.equal(ll.size, 0);
        });
    });

    describe('RingBuffer', () => {
        const rb = new (std.RingBuffer as any)(3);
        const newRb = new (std.RingBuffer as any)(4);

        it('Можно добавлять элементы', () => {
            assert.equal(rb.size, 0);
            assert.equal(rb.capacity, 3);

            rb.push(1);
            rb.push(2);

            assert.equal(rb.size, 2);
            assert.equal(rb.capacity, 3);
        });

        it('Можно получать элемент по индексу', () => {
            assert.equal(rb.get(1), 2);
        });

        it('Должен переполниться, если больше элементов, чем размер буфера', () => {
            rb.push(3);

            assert.equal(rb.get(0), 1);
            assert.equal(rb.size, 3);

            rb.push(4);

            assert.equal(rb.get(0), 2);
            assert.equal(rb.size, 3);
        });

        it('Можно доставать элементы', () => {
            assert.equal(rb.size, 3);

            assert.equal(rb.shift(), 2);
            assert.equal(rb.shift(), 3);

            assert.equal(rb.size, 1);
        });

        it('capacity <= 0', () => {
            const newb = new (std.RingBuffer as any)(0);

            newb.push(1);
            assert.equal(newb.size, 0);
            assert.equal(newb.shift(), undefined);
            assert.equal(newb.size, 0);
            assert.equal(newb.capacity, 0);
        });

        it('Можно конкатинировать два буффера', () => {
            newRb.push(12);
            newRb.push(23);
            newRb.push(34);
            newRb.push(45);

            const newBuffer = std.RingBuffer.concat<number>(rb, newRb);
            assert.equal(newBuffer.size, 5);
            assert.equal(newBuffer.capacity, 7);
            assert.equal(newBuffer.get(0), 4);
        });
    });

    describe('ConcatRingBuffer', () => {
        const firstBuffer = new std.RingBuffer<string>(2);
        const secondBuffer = new std.RingBuffer<string>(0);
        const thirdBuffer = new std.RingBuffer<string>(3);
        const fourthBuffer = new std.RingBuffer<string>(1);

        it('Конкатинация пустых буфферов', () => {
            const emptyBuffer = std.RingBuffer.concat(
                firstBuffer,
                secondBuffer,
                thirdBuffer,
                fourthBuffer);
            assert.equal(emptyBuffer.capacity, 6);
            assert.equal(emptyBuffer.shift(), undefined);
            assert.equal(emptyBuffer.size, 0);
        });

        function checkConcatBuffer<T>(buffer: std.RingBuffer<T>): void {
            assert.equal(buffer.capacity, 6);
            assert.equal(buffer.size, 4);
            assert.equal(buffer.shift(), 'a');
            assert.equal(buffer.size, 3);
            assert.equal(buffer.get(0), 'b');
            assert.equal(buffer.get(1), 'd');
            assert.equal(buffer.get(2), 'e');
            assert.equal(buffer.get(3), undefined);
        }

        it('Конкатинация всех сразу', () => {
            firstBuffer.push('a');
            firstBuffer.push('b');

            secondBuffer.push('c');

            thirdBuffer.push('y');
            thirdBuffer.push('z');
            thirdBuffer.push('d');
            thirdBuffer.push('e');
            thirdBuffer.shift();

            const all = std.RingBuffer.concat(
                firstBuffer,
                secondBuffer,
                thirdBuffer,
                fourthBuffer);
            checkConcatBuffer(all);

        });

        it('Последовательная конкатинация', () => {
            const all = std.RingBuffer.concat(
                std.RingBuffer.concat(
                    std.RingBuffer.concat(firstBuffer, secondBuffer),
                    thirdBuffer
                ),
                fourthBuffer
            );
            checkConcatBuffer(all);
        });

        it('Частичная конкатинация', () => {
            const firstPart = std.RingBuffer.concat(firstBuffer, secondBuffer);
            assert.equal(firstPart.size, 2);
            assert.equal(firstPart.capacity, 2);

            const middlePart = std.RingBuffer.concat(secondBuffer, thirdBuffer);
            assert.equal(middlePart.size, 2);
            assert.equal(middlePart.capacity, 3);

            const secondPart = std.RingBuffer.concat(thirdBuffer, fourthBuffer);
            assert.equal(secondPart.size, 2);
            assert.equal(secondPart.capacity, 4);

            const all = std.RingBuffer.concat(
                firstPart,
                secondPart
            );
            checkConcatBuffer(all);
        });

        it('Проверка целостности после конкатинации', () => {
            assert.equal(firstBuffer.size, 2);
            assert.equal(firstBuffer.get(0), 'a');
            assert.equal(fourthBuffer.get(2), undefined);
            assert.equal(secondBuffer.size, 0);
            assert.equal(thirdBuffer.size, 2);
            assert.equal(thirdBuffer.get(1), 'e');
            assert.equal(fourthBuffer.size, 0);
        });

        it('Конкатинация заполненных буфферов', () => {
            thirdBuffer.push('f');
            fourthBuffer.push('g');

            const fullBuffer = std.RingBuffer.concat(
                firstBuffer,
                secondBuffer,
                thirdBuffer,
                fourthBuffer);
            assert.equal(fullBuffer.capacity, 6);
            assert.equal(fullBuffer.size, 6);
            assert.equal(fullBuffer.get(0), 'a');
            assert.equal(fullBuffer.get(5), 'g');
            assert.equal(fullBuffer.get(6), undefined);
            fullBuffer.push('c');
            assert.equal(fullBuffer.get(0), 'b');
            assert.equal(fullBuffer.get(5), 'c');
            assert.equal(fullBuffer.size, 6);

            assert.equal(fullBuffer.shift(), 'b');
            assert.equal(fullBuffer.size, 5);
            assert.equal(fullBuffer.get(5), undefined);
        });
    });

    describe('Queue', () => {
        const q = new (std.Queue as any)();

        it('Можно добавлять элементы', () => {
            assert.equal(q.size, 0);

            q.enqueue(1);
            q.enqueue(2);

            assert.equal(q.size, 2);
        });

        it('Можно получать элемент по индексу', () => {
            assert.equal(q.get(0), 2);
        });

        it('Можно доставать элементы', () => {
            assert.equal(q.size, 2);

            assert.equal(q.dequeue(), 1);
            assert.equal(q.dequeue(), 2);

            assert.equal(q.size, 0);
        });
    });

    describe('PriorityQueue', () => {
        const pq = new (std.PriorityQueue as any)();

        it('Можно добавлять элементы', () => {
            assert.equal(pq.size, 0);

            pq.enqueue(1, 3);
            pq.enqueue(2, 1);
            pq.enqueue(3, 2);

            assert.equal(pq.size, 3);
        });

        it('Можно доставать элементы', () => {
            assert.equal(pq.size, 3);

            assert.equal(pq.dequeue(), 1);
            assert.equal(pq.dequeue(), 3);
            assert.equal(pq.dequeue(), 2);

            assert.equal(pq.size, 0);
        });

        it('Элементы с одинковым приоритетом', () => {
            pq.enqueue('3', 2);
            pq.enqueue('1', 3);
            pq.enqueue('5', 6);
            pq.enqueue('35', 2);
            pq.enqueue('5', 1);
            pq.enqueue('7', 3);

            assert.equal(pq.size, 5);
        });

        it('Элементы с одинаковым приоритетом достаются в порядке очереди', () => {
            assert.equal(pq.dequeue(), '1');
            assert.equal(pq.dequeue(), '7');
            assert.equal(pq.dequeue(), '3');
            assert.equal(pq.dequeue(), '35');
            assert.equal(pq.dequeue(), '5');
            assert.equal(pq.dequeue(), undefined);
        });

        it('лементы удаляются правильно', () => {
            pq.enqueue('8', 2);
            pq.enqueue('4', 3);
            pq.enqueue('6', 2);
            pq.enqueue('7', 3);

            assert.equal(pq.dequeue(), '4');
            assert.equal(pq.dequeue(), '7');
            assert.equal(pq.dequeue(), '8');
            assert.equal(pq.dequeue(), '6');
        });

        it('Один элемент', () => {
            pq.enqueue('1', 1);
            pq.enqueue('2', 2);
            pq.enqueue('3', 3);
            assert.equal(pq.dequeue(), '3');
            assert.equal(pq.dequeue(), '2');
        });

    });

    describe('HashTable', () => {
        const ht = new (std.HashTable as any)();

        const object = {};

        it('Можно добавлять элементы', () => {
            assert.equal(ht.size, 0);

            ht.put(1, 1);
            ht.put('1', 4);
            ht.put('1', 2);
            ht.put(object, 5);
            ht.put(object, 3);

            assert.equal(ht.size, 3);
        });

        it('Можно получать элемент по ключу', () => {
            assert.equal(ht.get(1), 1);
            assert.equal(ht.get(1), 1);
            assert.equal(ht.get('1'), 2);
            assert.equal(ht.get(object), 3);
            assert.equal(ht.get(12), undefined);
        });

        it('Можно очистить', () => {
            assert.equal(ht.size, 3);

            ht.clear();

            assert.equal(ht.size, 0);
        });

        it('и снова складывать', () => {
            ht.put(6, 16);
            assert.equal(ht.size, 1);
            assert.equal(ht.get(object), undefined);
        });
    });
});

