import { Node } from "./Node.js";

export class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    isEmpty() {
        if (this.length === 0) {
            return true
        } else {
            return false
        }
    }

    size() {
        return this.length;
    }

    first() {
        if (this.isEmpty()) {
            return "List is empty" ; 
        } else {
            return this.head.data;
        }
    }

    last() {
        if (this.isEmpty()) {
            return "List is empty" ; 
        } else {
            return this.tail.data;
        }
    }

    insertAtHead(data) {
        const newNode = new Node(data);

        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
        this.length += 1;
    }

    insertAtTail(data) {
        const newNode = new Node(data);

        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.prev = this.tail;
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.length += 1;
    }

    insertBefore(selection, data) {
        if (this.isEmpty()) {
            return "List is empty" ;
        }

        let iterator = this.head;

        let found = false

        while (!found && iterator != null) {
            if (iterator.data === selection) {
                const newNode = new Node(data);
                newNode.next = iterator;
                newNode.prev = iterator.prev;

                if (iterator.prev != null) {
                    iterator.prev.next = newNode;
                } else {
                    this.head = newNode;
                }

                iterator.prev = newNode;
                this.length += 1;
                found = true;
                return "Success"
            }
            iterator = iterator.next;
        }
        return "Selected element not in list";
    }

    insertAfter(selection, data) {
        if (this.isEmpty()) {
            return "List is empty";
        }

        let iterator = this.head;

        let found = false

        while (!found && iterator != null) {
            if (iterator.data === selection) {
                const newNode = new Node(data);
                newNode.prev = iterator;
                newNode.next = iterator.next;

                if (iterator.next != null) {
                    iterator.next.prev = newNode;
                } else {
                    this.tail = newNode;
                }

                iterator.next = newNode;
                this.length += 1;
                found = true;
                return "Success"
            }
            iterator = iterator.next;
        }

        return "Selected element not in list";
    }

    before(data) {
        if (this.isEmpty()) {
            return "List is empty";
        }

        let iterator = this.head;

        let found = false;

        while (!found && iterator != null) {
            if (iterator.data === data) {
                found = true;
                if (iterator.prev === null) {
                    return "Selected element is the first element"
                } else {
                    return iterator.prev.data
                }
            }
            iterator = iterator.next;
        }

        return "Selected element not in list";
    }

    after(data) {
        if (this.isEmpty()) {
            return "List is empty";
        }

        let iterator = this.head;

        let found = false;

        while (!found && iterator != null) {
            if (iterator.data === data) {
                found = true;
                if (iterator.next === null) {
                    return "Selected element is the last element"
                } else {
                    return iterator.next.data
                }
            }
            iterator = iterator.next;
        }

        return "Selected element not in list";
    }

    removeHead() {
        if (this.isEmpty()) {
            return "List is empty";
        }

        if (this.head.next === null) {
            this.head = null;
            this.tail = null;
        } else {
            this.head = this.head.next;
            this.head.prev = null;
        }

        this.length -= 1;
    }

    removeTail() {
        if (this.isEmpty()) {
            return "List is empty";
        }

        if (this.tail.prev === null) {
            this.head = null;
            this.tail = null;
        } else {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }

        this.length -= 1;
    }

    contains(data) {
        let iterator = this.head;

        let found = false;

        while (!found && iterator != null) {
            if (iterator.data === data) {
                found = true
                return found;
            } else {
                iterator = iterator.next;
            }
        }
        return found;
    }

    print() {
        let iterator = this.head;
        const placeholder = [];
        while (iterator != null) {
            placeholder.push(iterator.data);
            iterator = iterator.next;
        }
        console.log(placeholder);
    }

    array() {
        const result = [];
        let iterator = this.head;
        while (iterator != null) {
            result.push(iterator.data);
            iterator = iterator.next;
        }
        return result;
    }

    removeStudent(id) {
        if (this.isEmpty()) {
            return "List is empty";
        }

        let iterator = this.head;
        let temp = []

        while (iterator != null) {
            temp.push(iterator)
            if (iterator.data.user_id === id) {
                temp.push("a")
                temp.push(iterator)
                if (iterator.prev != null) {
                    iterator.prev.next = iterator.next;
                } else {
                    this.head = iterator.next;
                }

                if (iterator.next != null) {
                    iterator.next.prev = iterator.prev;
                } else {
                    this.tail = iterator.prev;
                }

                this.length -= 1;
                return "User removed";
            }
            iterator = iterator.next;
        }
        return "Selected element not in list";
    }
}