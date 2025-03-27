import axios from "axios";
import { LinkedList } from "../src/utils/DataStructures/LinkedList.js"; // 🛠 fix folder name if needed

async function main() {
    const response = await axios.get("http://localhost:3000/students/get");
    const dataArray = response.data;

    const list = new LinkedList();

    for (let i = 0; i < dataArray.length; i++) {
        list.insertAtTail(dataArray[i]);
    }

    list.print(); // or access list.head, list.size(), etc.
}

main();
