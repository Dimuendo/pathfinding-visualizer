function NodePos(row, col) {
    this.row = row;
    this.col = col;
}

export function generateMaze(row, col, numRows, numCols, orientation, wallPositions, startRow, stratCol, endRow, endCol) {
    if ((numRows <= 2) || (numCols <= 1)) {
        return;
    }
    
    // Get the wall position
    let randWallCol = randomInt(1, numCols - 2);
    let randWallRow = randomInt(1, numRows - 2);
    let wallCol = col + (orientation === "horizontal" ? 0 : randWallCol);
    let wallRow = row + (orientation === "vertical" ? 0 : randWallRow);

    // Get the passage position
    let colRandomizer = randomInt(0, 1);
    if (colRandomizer === 1) colRandomizer = numCols - 1;
    let rowRandomizer = randomInt(0, 1);
    if (rowRandomizer === 1) rowRandomizer = numRows - 1;
    const colPassage = wallCol + (orientation === "horizontal" ? colRandomizer : 0);
    const rowPassage = wallRow + (orientation === "vertical" ? rowRandomizer : 0);

    // Get the direction the wall should extend
    const colDir = orientation === "horizontal" ? 1 : 0;
    const rowDir = orientation === "vertical" ? 1 : 0;

    const length = orientation === "horizontal" ? numCols : numRows;
    for (let i = 0; i < length; i++) {
        const notPassage = (wallCol !== colPassage || wallRow !== rowPassage);
        const notStart = (wallCol !== stratCol || wallRow !== startRow);
        const notEnd = (wallCol !== endCol || wallRow !== endRow);
        const createWall = notPassage && notStart && notEnd;
        if (createWall) {
            const wall = new NodePos(wallRow, wallCol);
            wallPositions.push(wall);
        }
        wallCol += colDir;
        wallRow += rowDir;
    }

    let newCol = col;
    let newRow = row;
    let newNumCols = orientation === "horizontal" ? numCols : wallCol - col;
    let newNumRows = orientation === "vertical" ? numRows : wallRow - row;
    generateMaze(newRow, newCol, newNumRows, newNumCols, getOrientation(newNumRows, newNumCols), wallPositions, startRow, stratCol, endRow, endCol);

    newCol = orientation === "horizontal" ? col : wallCol + 1;
    newRow = orientation === "vertical" ? row : wallRow + 1;
    newNumCols = orientation === "horizontal" ? numCols : col + numCols - wallCol - 1;
    newNumRows = orientation === "vertical" ? numRows : row + numRows - wallRow - 1;
    generateMaze(newRow, newCol, newNumRows, newNumCols, getOrientation(newNumRows, newNumCols), wallPositions, startRow, stratCol, endRow, endCol);
}

function getOrientation(numRows, numCols) {
    if (numRows < numCols) {
        return "vertical";
    } else {
        return "horizontal"
    }
}

function randomInt(min, max) {
    const randNum = Math.floor(Math.random() * (max - min + 1) + min);
    return randNum;
}
