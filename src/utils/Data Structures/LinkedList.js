import { Node } from "./Node.js";

// Exports the linked list class
export class LinkedList {
    constructor() {
        // Sets the head and tail of the linked list to null
        // Also sets the length of the linked list to 0 upon contrstruction
        this.head = null
        this.tail = null
        this.length = 0
    }

    // Checks if the linked list is empty
    isEmpty() {
        // Returns true if length is 0, otherwise false
        if (this.length === 0) {
            return true
        } else {
            return false
        }
    }

    // Returns the size of the linked list
    getSize() {
        return this.length
    }

    // Returns the first node in the list
    // Returns "List is empty" if the list is empty
    getFirst() {
        if (this.isEmpty()) {
            return "List is empty" 
        } else {
            return this.head
        }
    }

    // Returns the last node in the list
    // Returns "List is empty" if the list is empty
    getLast() {
        if (this.isEmpty()) {
            return "List is empty" 
        } else {
            return this.tail
        }
    }

    insertAtHead(data) {
        // Create a new node with the provided data
        const newNode = new Node(data)

        // Check if the linked list is empty
        if (this.isEmpty()) {
            // Set both head and tail to the new node if the list is empty
            this.head = newNode
            this.tail = newNode
        } else {
            // Otherwise, insert the new node at the head of the list
            newNode.next = this.head
            this.head.prev = newNode
            this.head = newNode
        }
        // Increment the length of the linked list
        this.length += 1
    }

    insertAtTail(data) {
        // Create a new node with the provided data
        const newNode = new Node(data)

        // Check if the linked list is empty
        if (this.isEmpty()) {
            // Set both head and tail to the new node if the list is empty
            this.head = newNode
            this.tail = newNode
        } else {
            // Otherwise, insert the new node at the tail of the list
            newNode.prev = this.tail
            this.tail.next = newNode
            this.tail = newNode
        }
        // Increment the length of the linked list
        this.length += 1
    }

    insertBefore(selection, data) {
        // If the list is empty, return a string to say so
        if (this.isEmpty()) {
            return "List is empty"
        }

        // Find the node in the list
        const node = this.find(selection);

        // If the node is not in the list, return a string to say so
        if (node === "Selected element not in list") {
            return node
        }

        // Create a new node to insert into the list
        const newNode = new Node(data);
        // Point the new node's next to the target node
        newNode.next = node;
        // Point the new node's prev to the target node's prev
        newNode.prev = node.prev;

        // If the target node's prev is not null, point the target node's prev's next to the new node
        if (node.prev != null) {
            node.prev.next = newNode;
        } 
        // Otherwise, set the head of the list to the new node
        else {
            this.head = newNode;
        }

        // Point the target node's prev to the new node
        node.prev = newNode;
        // Increment the length of the linked list
        this.length += 1;
        // Return a string to say the insertion was successful
        return "Success"
    }
    insertAfter(selection, data) {
        // If the list is empty, return a string to say so
        if (this.isEmpty()) {
            return "List is empty"
        }

        // Find the node in the list
        const node = this.find(selection);
        
        // If the node is not in the list, return a string to say so
        if (node === "Selected element not in list") {
            return node
        }

        // Create a new node to insert into the list
        const newNode = new Node(data);
        // Point the new node's prev to the target node
        newNode.prev = node;
        // Point the new node's next to the target node's next
        newNode.next = node.next;

        // If the target node's next is not null, point the target node's next's prev to the new node
        if (node.next != null) {
            node.next.prev = newNode;
        } 
        // Otherwise, set the tail of the list to the new node
        else {
            this.tail = newNode;
        }

        // Point the target node's next to the new node
        node.next = newNode;
        // Increment the length of the linked list
        this.length += 1;
        // Return a string to say the insertion was successful
        return "Success"
    }

    before(data) {
        // If the list is empty, return a string to say so
        if (this.isEmpty()) {
            return "List is empty"
        }

        // Start at the head of the list
        let iterator = this.head

        // Keep track of whether we've found the element
        let found = false

        // Iterate through the list until we've found the element or reached the end
        while (!found && iterator != null) {
            // If we've found the element, return the element before it
            if (iterator.getData() === data) {
                found = true
                // If the element is the first element, return a string to say so
                if (iterator.prev === null) {
                    return "Selected element is the first element"
                }
                // Otherwise, return the element before it
                else {
                    return iterator.prev.getData()
                }
            }
            // Move on to the next element
            iterator = iterator.next
        }

        // If we've reached the end of the list, return a string to say so
        return "Selected element not in list"
    }

    after(data) {
        // If the list is empty, return a string to say so
        if (this.isEmpty()) {
            return "List is empty"
        }

        // Start at the head of the list
        let iterator = this.head

        // Keep track of whether we've found the element
        let found = false

        // Iterate through the list until we've found the element or reached the end
        while (!found && iterator != null) {
            // If we've found the element, return the element after it
            if (iterator.getData() === data) {
                found = true
                // If the element is the last element, return a string to say so
                if (iterator.next === null) {
                    return "Selected element is the last element"
                }
                // Otherwise, return the element after it
                else {
                    return iterator.next.getData()
                }
            }
            // Move on to the next element
            iterator = iterator.next
        }

        // If we've reached the end of the list, return a string to say so
        return "Selected element not in list"
    }

    removeHead() {
        // If the list is empty, return a string to say so
        if (this.isEmpty()) {
            return "List is empty"
        }

        // If the list only has one element, set head and tail to null
        if (this.head.next === null) {
            this.head = null
            this.tail = null
        } else {
            // Move the head to the next element
            this.head = this.head.next
            // Set the prev of the new head to null
            this.head.prev = null
        }

        // Decrement the length of the linked list
        this.length -= 1
    }

    removeTail() {
        // If the list is empty, return a string to say so
        if (this.isEmpty()) {
            return "List is empty"
        }

        // If the list only has one element, set head and tail to null
        if (this.tail.prev === null) {
            this.head = null
            this.tail = null
        } else {
            // Move the tail to the previous element
            this.tail = this.tail.prev
            // Set the next of the new tail to null
            this.tail.next = null
        }

        // Decrement the length of the linked list
        this.length -= 1
    }

    // Checks if the linked list contains the given data
    contains(data) {
        let iterator = this.head

        let found = false

        // Iterate through the linked list until we've found the element or reached the end
        while (!found && iterator != null) {
            // If we've found the element, set found to true
            if (iterator.getData() === data) {
                found = true
                // Return the result
                return found
            } else {
                // Move on to the next element
                iterator = iterator.next
            }
        }
        // Return the result
        return found
    }

    print() {
        // Start at the head of the list
        let iterator = this.head;
        // Create an array to store the elements
        const placeholder = [];
        // Iterate through the list until we reach the end
        while (iterator != null) {
            // Add the element to the array
            placeholder.push(iterator.getData());
            // Move on to the next element
            iterator = iterator.next;
        }
        // Print the array
        console.log(placeholder);
    }

    // Converts the linked list to an array
    array() {
        // Initialize an empty array to store the elements
        const result = []
        // Start at the head of the list
        let iterator = this.head
        // Iterate through the list until we reach the end
        while (iterator != null) {
            // Add the element to the array
            result.push(iterator.getData())
            // Move on to the next element
            iterator = iterator.next
        }
        // Return the array
        return result
    }

    remove(data) {
        // If the list is empty, return a string to say so
        if (this.isEmpty()) {
            return "List is empty"
        }

        // Find the node in the list
        const node = this.find(data);

        // If the node is not in the list, return a string to say so
        if (node === "Selected element not in list") {
            return node
        }

        // If the node is the first element, set head to the next element
        if (node === this.getFirst() && this.length == 1) {
            this.head = null
            this.tail = null
        } else if (node === this.getFirst()) {
            this.head = node.next
            this.head.prev = null
        }
        // If the node is the last element, set tail to the previous element
        else if (node === this.getLast()) {
            this.tail = node.prev
            this.tail.next = null
        }
        // If the node is in the middle of the list, link up the previous and next nodes
        else {
            node.prev.next = node.next
            node.next.prev = node.prev
        }

        // Decrement the length of the linked list
        this.length -= 1
        return "Item removed"
    }

    find(data) {
        // Start at the head of the list
        let iterator = this.head
        // Iterate through the list until the element is found or the end is reached
        while (iterator != null) {
            // If the current node's data matches the target data, return the node
            if (iterator.getData() === data) {
                return iterator
            }
            // Move on to the next node
            iterator = iterator.next
        }
        // If the element is not found, return a message indicating so
        return "Selected element not in list"
    }
    
}

