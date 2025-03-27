// Test script for LinkedList.remove(student)
import { LinkedList } from "../src/utils/DataStructures/LinkedList.js"; // 🛠 fix folder name if needed
import { Node } from "@/utils/Data Structures/Node.js";

// Sample students
const studentA = { student_id: 1, username: 'alice' };
const studentB = { student_id: 2, username: 'bob' };
const studentC = { student_id: 3, username: 'carol' };

// Initialize list and insert students
const students = new LinkedList();
students.insertAtTail(studentA);
students.insertAtTail(studentB);
students.insertAtTail(studentC);

console.log('Initial list:');
students.print();

// Test removing student in the middle
console.log('\nRemoving Bob (middle):');
students.remove({ student_id: 2 });
students.print();

// Test removing student at the head
console.log('\nRemoving Alice (head):');
students.remove({ student_id: 1 });
students.print();

// Test removing student at the tail
console.log('\nRemoving Carol (tail):');
students.remove({ student_id: 3 });
students.print();

// Test removing from empty list
console.log('\nRemoving from empty list:');
const result = students.remove({ student_id: 1 });
console.log('Result:', result);
students.print();
