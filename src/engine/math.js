/** Data Structures for the Engine */

// 1. Spatial Hashing for efficient proximity detection (torch radius)
class SpatialHash {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.cells = new Map();
    }
    
    _hash(x, y) {
        return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
    }
    
    insert(entity) {
        const key = this._hash(entity.x, entity.y);
        if (!this.cells.has(key)) this.cells.set(key, new Set());
        this.cells.get(key).add(entity);
    }
    
    clear() {
        this.cells.clear();
    }
    
    query(x, y, radius) {
        const result = [];
        const minX = x - radius, maxX = x + radius;
        const minY = y - radius, maxY = y + radius;
        
        for (let i = minX; i <= maxX; i += this.cellSize) {
            for (let j = minY; j <= maxY; j += this.cellSize) {
                const key = this._hash(i, j);
                if (this.cells.has(key)) {
                    for (const entity of this.cells.get(key)) {
                        const dx = entity.x - x;
                        const dy = entity.y - y;
                        if (dx*dx + dy*dy <= radius*radius) {
                            result.push(entity);
                        }
                    }
                }
            }
        }
        return result;
    }
}

// 2. Binary Search Tree (BST) for depth sorting (rendering/audio based on distance)
class BSTNode {
    constructor(distance, entity) {
        this.distance = distance;
        this.entities = [entity]; // Array in case of identical distances
        this.left = null;
        this.right = null;
    }
}

class DistanceBST {
    constructor() {
        this.root = null;
    }
    
    insert(distance, entity) {
        if (!this.root) {
            this.root = new BSTNode(distance, entity);
            return;
        }
        let current = this.root;
        while (true) {
            if (distance === current.distance) {
                current.entities.push(entity);
                break;
            } else if (distance < current.distance) {
                if (!current.left) { current.left = new BSTNode(distance, entity); break; }
                current = current.left;
            } else {
                if (!current.right) { current.right = new BSTNode(distance, entity); break; }
                current = current.right;
            }
        }
    }
    
    getSorted() {
        const result = [];
        this._inorder(this.root, result);
        return result;
    }
    
    _inorder(node, result) {
        if (node !== null) {
            this._inorder(node.right, result); // Draw furthest first (painters algorithm)
            for(const e of node.entities) result.push(e);
            this._inorder(node.left, result);
        }
    }
}

// 3. Graph & DFS for Procedural Maze Generation
class Graph {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.adjList = new Map(); // "x,y" -> Set of "nx,ny"
    }

    addVertex(v) {
        if (!this.adjList.has(v)) this.adjList.set(v, new Set());
    }

    addEdge(v, w) {
        this.adjList.get(v).add(w);
        this.adjList.get(w).add(v);
    }
    
    static generateMaze(cols, rows) {
        const graph = new Graph(cols, rows);
        const visited = new Set();
        const stack = [];
        
        for (let x=0; x<cols; x++)
            for (let y=0; y<rows; y++)
                graph.addVertex(`${x},${y}`);
                
        const start = "0,0";
        visited.add(start);
        stack.push(start);
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const [cx, cy] = current.split(',').map(Number);
            
            const neighbors = [];
            [[0,-1], [1,0], [0,1], [-1,0]].forEach(([dx, dy]) => {
                const nx = cx + dx, ny = cy + dy;
                if (nx >=0 && nx < cols && ny >= 0 && ny < rows) {
                    const nkey = `${nx},${ny}`;
                    if (!visited.has(nkey)) neighbors.push(nkey);
                }
            });
            
            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                visited.add(next);
                graph.addEdge(current, next);
                stack.push(next);
            } else {
                stack.pop();
            }
        }
        return graph;
    }
}

// 4. Linked List for queueing flicker effects or dynamic logic
class ListNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }
    
    enqueue(value) {
        const node = new ListNode(value);
        if (!this.head) {
            this.head = node;
            this.tail = node;
        } else {
            this.tail.next = node;
            this.tail = node;
        }
        this.length++;
    }
    
    dequeue() {
        if (!this.head) return null;
        const val = this.head.value;
        this.head = this.head.next;
        if (!this.head) this.tail = null;
        this.length--;
        return val;
    }
}

window.SpatialHash = SpatialHash;

window.BSTNode = BSTNode;

window.DistanceBST = DistanceBST;

window.Graph = Graph;

window.ListNode = ListNode;

window.LinkedList = LinkedList;
