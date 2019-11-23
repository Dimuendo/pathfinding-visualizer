export function getPathBFS(grid, currNode, pathArray) {
    const parent = currNode.parent;
    if (parent === null) return;
    if (parent === "NO_PARENT") {
        return pathArray;
    }
    getPathBFS(grid, parent, pathArray);
    pathArray.push(currNode);
}

export function breadthFirstSearch(grid, numRows, numCols, startRow, startCol, endRow, endCol) {
    const visitedNodes = [];
    const nodeQueue = [];
    const startNode = grid[startRow][startCol];
    Object.assign(startNode, {isVisited: true});
    nodeQueue.push(startNode);

    while (nodeQueue.length !== 0) {
        const visitedNode = nodeQueue.shift();
        if (visitedNode.row === endRow && visitedNode.col === endCol) return visitedNodes;

        // Update node above
        const visitedNodeSet = [];
        if (visitedNode.row + 1 < numRows) {
            const nodeUp = grid[visitedNode.row + 1][visitedNode.col];
            const visitedUp = nodeUp.isVisited;
            const isWall = nodeUp.isWall;
            if (visitedUp === false && isWall === false) {
                Object.assign(nodeUp, {parent: visitedNode});
                Object.assign(nodeUp, {isVisited: true});
                nodeQueue.push(nodeUp);
                visitedNodeSet.push(nodeUp);
            }
        }

        // Update node below
        if (visitedNode.row - 1 >= 0) {
            const nodeDown = grid[visitedNode.row - 1][visitedNode.col];
            const visitedDown = nodeDown.isVisited;
            const isWall = nodeDown.isWall;
            if (visitedDown === false && isWall === false) {
                Object.assign(nodeDown, {parent: visitedNode});
                Object.assign(nodeDown, {isVisited: true});
                nodeQueue.push(nodeDown);
                visitedNodeSet.push(nodeDown);
            }
        }

        // Update node right
        if (visitedNode.col + 1 < numCols) {
            const nodeRight = grid[visitedNode.row][visitedNode.col + 1];
            const visitedRight = nodeRight.isVisited;
            const isWall = nodeRight.isWall;
            if (visitedRight === false && isWall === false) {
                Object.assign(nodeRight, {parent: visitedNode});
                Object.assign(nodeRight, {isVisited: true});
                nodeQueue.push(nodeRight);
                visitedNodeSet.push(nodeRight);
            }
        }

        // Update node left
        if (visitedNode.col - 1 >= 0) {
            const nodeLeft = grid[visitedNode.row][visitedNode.col - 1];
            const visitedLeft = nodeLeft.isVisited;
            const isWall = nodeLeft.isWall;
            if (visitedLeft === false && isWall === false) {
                Object.assign(nodeLeft, {parent: visitedNode});
                Object.assign(nodeLeft, {isVisited: true});
                nodeQueue.push(nodeLeft);
                visitedNodeSet.push(nodeLeft);
            }
        }

        if (visitedNodeSet.length > 0) {
            visitedNodes.push(visitedNodeSet);
        }
    }
    return visitedNodes;
}