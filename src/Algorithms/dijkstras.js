function minDistance(grid, numRows, numCols) {
    let min = Infinity;
    let minCoords;
    for (let currRow = 0; currRow < numRows; currRow++) {
        for (let currCol = 0; currCol < numCols; currCol++) {
            if (grid[currRow][currCol].isVisited === false && grid[currRow][currCol].distance <= min) {
                min = grid[currRow][currCol].distance;
                minCoords = {
                    nodeRow: currRow,
                    nodeCol: currCol,
                }
            }
        }
    }
    return minCoords;
}

export function getPath(grid, currNode, pathArray) {
    const parent = currNode.parent;
    if (parent === null) return;
    if (parent === "NO_PARENT") {
        return pathArray;
    }
    getPath(grid, parent, pathArray);
    pathArray.push(currNode);
}

export function dijkstras(grid, numRows, numCols, endRow, endCol) {
    const visitedNodes = [];

    for (let currRow = 0; currRow < numRows; currRow++) {
        for (let currCol = 0 ; currCol < numCols; currCol++) {
            // Get the node with the min distance and set it to visited
            const coords = minDistance(grid, numRows, numCols);
            const minNodeRow = coords.nodeRow;
            const minNodeCol = coords.nodeCol;
            const minNode = grid[minNodeRow][minNodeCol];
            Object.assign(minNode, {isVisited: true});
            if (minNodeRow === endRow && minNodeCol === endCol) {
                return visitedNodes;
            }

            const minNodeDistance = minNode.distance;
            const visitedNodeSet = [];
            
            // Update node above
            if (minNodeRow + 1 < numRows) {
                const nodeUp = grid[minNodeRow + 1][minNodeCol];
                const distanceUp = nodeUp.distance;
                const weightUp = nodeUp.weight;
                const visitedUp = nodeUp.isVisited;
                if (visitedUp === false && minNodeDistance + weightUp < distanceUp) {
                    Object.assign(nodeUp, {parent: minNode});
                    Object.assign(nodeUp, {distance: minNodeDistance + weightUp});
                    visitedNodeSet.push(nodeUp);
                }
            }

            // Update node below
            if (minNodeRow - 1 >= 0) {
                const nodeDown = grid[minNodeRow - 1][minNodeCol];
                const distanceDown = nodeDown.distance;
                const weightDown = nodeDown.weight;
                const visitedDown = nodeDown.isVisited;
                if (visitedDown === false && minNodeDistance + weightDown < distanceDown) {
                    Object.assign(nodeDown, {parent: minNode});
                    Object.assign(nodeDown, {distance: minNodeDistance + weightDown});
                    visitedNodeSet.push(nodeDown);
                }
            }

            // Update node right
            if (minNodeCol + 1 < numCols) {
                const nodeRight = grid[minNodeRow][minNodeCol + 1];
                const distanceRight = nodeRight.distance;
                const weightRight = nodeRight.weight;
                const visitedRight = nodeRight.isVisited;
                if (visitedRight === false && minNodeDistance + weightRight < distanceRight) {
                    Object.assign(nodeRight, {parent: minNode});
                    Object.assign(nodeRight, {distance: minNodeDistance + weightRight});
                    visitedNodeSet.push(nodeRight);
                }
            }

            // Update node left
            if (minNodeCol - 1 >= 0) {
                const nodeLeft = grid[minNodeRow][minNodeCol - 1];
                const distanceLeft = nodeLeft.distance;
                const weightLeft = nodeLeft.weight;
                const visitedLeft = nodeLeft.isVisited;
                if (visitedLeft === false && minNodeDistance + weightLeft < distanceLeft) {
                    Object.assign(nodeLeft, {parent: minNode});
                    Object.assign(nodeLeft, {distance: minNodeDistance + weightLeft});
                    visitedNodeSet.push(nodeLeft);
                }
            }

            if (visitedNodeSet.length > 0) {
                visitedNodes.push(visitedNodeSet);
            }
        }
    }
}
