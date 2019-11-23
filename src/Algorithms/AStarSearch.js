export function aStarSearch(grid, numRows, numCols, startRow, startCol, endRow, endCol) {
    const openList = [];
    const closedList = [];
    const visitedNodes = [];

    const startNode = grid[startRow][startCol];
    openList.push(startNode);

    while(openList.length > 0) {
        // Find node with lowest f val in open list
        let currNode = openList[0];
        let qIdx = 0;
        for (let i = 1; i < openList.length; i++) {
            if (openList[i].f < currNode.f) {
                currNode = openList[i];
                qIdx = i;
            }
        }

        // Current node is the end node, return
        if (currNode.row === endRow && currNode.col === endCol) {
            return visitedNodes;
        }

        if (currNode !== startNode) visitedNodes.push(currNode);

        // Pop Q off open list
        openList.splice(qIdx, 1);
        closedList.push(currNode);

        // Update node above
        if (currNode.row + 1 < numRows) {
            const nodeUp = grid[currNode.row + 1][currNode.col];
            const isWall = nodeUp.isWall;
            let isInClosedList = nodeIsInList(closedList, nodeUp);
            let isInOpenList = nodeIsInList(openList, nodeUp);

            if (!isWall && !isInClosedList) {
                const gNew = currNode.g + nodeUp.weight;
                const hNew = getManhattanDist(nodeUp.row, nodeUp.col, endRow, endCol);
                const fNew = gNew + hNew;
                if (gNew < nodeUp.g) {
                    Object.assign(nodeUp, {parent: currNode});
                    Object.assign(nodeUp, {g: gNew});
                    Object.assign(nodeUp, {f: fNew});
                    if (!isInOpenList) {
                        openList.push(nodeUp);
                    }
                }
            }
        }

        // Update node below
        if (currNode.row - 1 >= 0) {
            const nodeDown = grid[currNode.row - 1][currNode.col];
            const isWall = nodeDown.isWall;
            let isInClosedList = nodeIsInList(closedList, nodeDown);
            let isInOpenList = nodeIsInList(openList, nodeDown);

            if (!isWall && !isInClosedList) {
                const gNew = currNode.g + nodeDown.weight;
                const hNew = getManhattanDist(nodeDown.row, nodeDown.col, endRow, endCol);
                const fNew = gNew + hNew;
                if (gNew < nodeDown.g) {
                    Object.assign(nodeDown, {parent: currNode});
                    Object.assign(nodeDown, {g: gNew});
                    Object.assign(nodeDown, {h: hNew});
                    Object.assign(nodeDown, {f: fNew});
                    if (!isInOpenList) {
                        openList.push(nodeDown);
                    }
                }
            }
        }

        // Update node right
        if (currNode.col + 1 < numCols) {
            const nodeRight = grid[currNode.row][currNode.col + 1];
            const isWall = nodeRight.isWall;
            let isInClosedList = nodeIsInList(closedList, nodeRight);
            let isInOpenList = nodeIsInList(openList, nodeRight);

            if (!isWall && !isInClosedList) {
                const gNew = currNode.g + nodeRight.weight;
                const hNew = getManhattanDist(nodeRight.row, nodeRight.col, endRow, endCol);
                const fNew = gNew + hNew;
                if (gNew < nodeRight.g) {
                    Object.assign(nodeRight, {parent: currNode});
                    Object.assign(nodeRight, {g: gNew});
                    Object.assign(nodeRight, {h: hNew});
                    Object.assign(nodeRight, {f: fNew});
                    if (!isInOpenList) {
                        openList.push(nodeRight);
                    }
                }
            }
        }

        // Update node left
        if (currNode.col - 1 >= 0) {
            const nodeLeft = grid[currNode.row][currNode.col - 1];
            const isWall = nodeLeft.isWall;
            let isInClosedList = nodeIsInList(closedList, nodeLeft);
            let isInOpenList = nodeIsInList(openList, nodeLeft);

            if (!isWall && !isInClosedList) {
                const gNew = currNode.g + nodeLeft.weight;
                const hNew = getManhattanDist(nodeLeft.row, nodeLeft.col, endRow, endCol);
                const fNew = gNew + hNew;
                if (gNew < nodeLeft.g) {
                    Object.assign(nodeLeft, {parent: currNode});
                    Object.assign(nodeLeft, {g: gNew});
                    Object.assign(nodeLeft, {h: hNew});
                    Object.assign(nodeLeft, {f: fNew});
                    if (!isInOpenList) {
                        openList.push(nodeLeft);
                    }
                }
            }
        }
    }
    return visitedNodes;
}

function getManhattanDist(currRow, currCol, endRow, endCol) {
    return Math.abs(currRow - endRow) + Math.abs(currCol - endCol);
}

function nodeIsInList(openList, node) {
    for (let i = 0; i < openList.length; i++) {
        if (openList[i].row === node.row && openList[i].col === node.col) {
            return true;
        }
    }
    return false;
}
