// Exports the node class
export class Node {
    constructor(data) {
        // Creates a new Node with the given data
        this.data = data
        // Previous Node in the linked list
        this.prev = null
        // Next Node in the linked list
        this.next = null
    }
    
    getData() {
        // Returns the data of the current Node
        return this.data
    }
}


