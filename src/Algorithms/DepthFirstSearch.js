export function getPathDFS(grid, currNode, pathArray) {
    const parent = currNode.parent;
    if (parent === null) return;
    if (parent === "NO_PARENT") {
        return pathArray;
    }
    getPathDFS(grid, parent, pathArray);
    pathArray.push(currNode);
}

export function depthFirstSearch(grid, numRows, numCols, startRow, startCol, endRow, endCol) {
    const visitedNodes = [];
    const nodeStack = [];
    const startNode = grid[startRow][startCol];
    nodeStack.push(startNode);

    while (nodeStack.length !== 0) {
        const visitedNode = nodeStack.pop();
        if (visitedNode.row === endRow && visitedNode.col === endCol) return visitedNodes;

        if (visitedNode.isVisited) continue;
        Object.assign(visitedNode, {isVisited: true});
        if (visitedNode !== startNode) visitedNodes.push(visitedNode);

        // Update node above
        if (visitedNode.row + 1 < numRows) {
            const nodeUp = grid[visitedNode.row + 1][visitedNode.col];
            const visitedUp = nodeUp.isVisited;
            const isWall = nodeUp.isWall;
            if (visitedUp === false && isWall === false) {
                Object.assign(nodeUp, {parent: visitedNode});
                nodeStack.push(nodeUp);
            }
        }

        // Update node below
        if (visitedNode.row - 1 >= 0) {
            const nodeDown = grid[visitedNode.row - 1][visitedNode.col];
            const visitedDown = nodeDown.isVisited;
            const isWall = nodeDown.isWall;
            if (visitedDown === false && isWall === false) {
                Object.assign(nodeDown, {parent: visitedNode});
                nodeStack.push(nodeDown);
            }
        }

        // Update node right
        if (visitedNode.col + 1 < numCols) {
            const nodeRight = grid[visitedNode.row][visitedNode.col + 1];
            const visitedRight = nodeRight.isVisited;
            const isWall = nodeRight.isWall;
            if (visitedRight === false && isWall === false) {
                Object.assign(nodeRight, {parent: visitedNode});
                nodeStack.push(nodeRight);
            }
        }

        // Update node left
        if (visitedNode.col - 1 >= 0) {
            const nodeLeft = grid[visitedNode.row][visitedNode.col - 1];
            const visitedLeft = nodeLeft.isVisited;
            const isWall = nodeLeft.isWall;
            if (visitedLeft === false && isWall === false) {
                Object.assign(nodeLeft, {parent: visitedNode});
                nodeStack.push(nodeLeft);
            }
        }
    }
    return visitedNodes;
}