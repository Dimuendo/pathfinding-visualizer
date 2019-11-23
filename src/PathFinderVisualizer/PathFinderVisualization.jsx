import React from 'react';
import Node from './Node/Node';
import './PathFinderVisualization.css'
import './Node/Node.css'
import {dijkstras, getPath} from '../Algorithms/dijkstras';
import {generateMaze} from '../Algorithms/MazeGeneration';
import {breadthFirstSearch} from '../Algorithms/BreadthFirstSearch';
import {depthFirstSearch} from '../Algorithms/DepthFirstSearch';
import {aStarSearch} from '../Algorithms/AStarSearch'

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const NODE_SIZE = 30;
const NUM_ROWS = Math.floor((SCREEN_HEIGHT / NODE_SIZE) - 4);
const NUM_COLS = Math.floor((SCREEN_WIDTH / NODE_SIZE) - 4);
const ANIMATION_SPEED = 10;

export default class PathFinderVisualizer extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            grid: [],
            mouseClicked: false,
            startNodeClicked: false,
            startRow: 1,
            startCol: 1,
            endNodeClicked: false,
            endRow: NUM_ROWS - 2,
            endCol: NUM_COLS - 2,
            prevRow: -1,
            prevCol: -1,
        };
    }

    componentDidMount() {
        this.createGrid();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.mouseClicked) return false;
        return true;
    }

    createNode(nodeRow, nodeCol) {
        const isStart = nodeCol === this.state.startCol && nodeRow === this.state.startRow;
        const isFinish = nodeCol === this.state.endCol && nodeRow === this.state.endRow;
        let node = {
            row: nodeRow,
            col: nodeCol,
            isStart: isStart,
            isFinish: isFinish,
            isWall: false,
            isVisited: false,
            weight: 1,
            distance: (isStart) ? 0 : Infinity,
            parent: (isStart) ? "NO_PARENT" : null,
            g: (isStart) ? 0 : Infinity,
            f: (isStart) ? 0 : Infinity,
        }
        return node;
    }

    createGrid() {
        const grid = [];
        for (let i = 0; i < NUM_ROWS; i++) {
            const row = [];
            for (let j = 0; j < NUM_COLS; j++) {
                const node = this.createNode(i, j);
                row.push(node);
            }
            grid.push(row);
        }
        this.setState({grid: grid});
    }

    clearGrid() {
        this.createGrid();
        for (let currRow = 0; currRow < NUM_ROWS; currRow++) {
            for (let currCol = 0; currCol < NUM_COLS; currCol++) {
                const currNode = document.getElementById(`row-${currRow}-col-${currCol}`);
                if (!(currNode.className === "start-node") && !(currNode.className === "end-node")) {
                    currNode.className = "node";
                }
            }
        }
    }

    clearVistedAndPath() {
        for (let currRow = 0; currRow < NUM_ROWS; currRow++) {
            for (let currCol = 0; currCol < NUM_COLS; currCol++) {
                const currNode = document.getElementById(`row-${currRow}-col-${currCol}`);
                if (currNode.className === "wall-node") continue;
                const isStartNode = currNode.className === "start-node";
                const isEndNode = currNode.className === "end-node";
                if (isStartNode) {
                    this.updateStartProps(currRow, currCol);
                } else if (isEndNode) {
                    this.updateEndProps(currRow, currCol) ;
                } else {
                    currNode.className = "node";
                    this.updateNodeProps(currRow, currCol) ;
                }
            }
        }
    }

    updateGridWall(nodeRow, nodeCol) {
        const grid = this.state.grid;
        const currNode = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
        if (currNode.className === "wall-node") {
            Object.assign(grid[nodeRow][nodeCol], {isWall: true});
            Object.assign(grid[nodeRow][nodeCol], {weight: Infinity});
        } if (currNode.className === "node") {
            Object.assign(grid[nodeRow][nodeCol], {isWall: false});
            Object.assign(grid[nodeRow][nodeCol], {weight: 1});
        }
    }

    updateNodeProps(nodeRow, nodeCol) {
        const grid = this.state.grid;
        Object.assign(grid[nodeRow][nodeCol], {isStart: false});
        Object.assign(grid[nodeRow][nodeCol], {isFinish: false});
        Object.assign(grid[nodeRow][nodeCol], {isWall: false});
        Object.assign(grid[nodeRow][nodeCol], {isVisited: false});
        Object.assign(grid[nodeRow][nodeCol], {weight: 1});
        Object.assign(grid[nodeRow][nodeCol], {distance: Infinity});
        Object.assign(grid[nodeRow][nodeCol], {parent: null});
        Object.assign(grid[nodeRow][nodeCol], {g: Infinity});
        Object.assign(grid[nodeRow][nodeCol], {f: Infinity});
    }

    updateStartProps(nodeRow, nodeCol) {
        const grid = this.state.grid;
        Object.assign(grid[nodeRow][nodeCol], {isStart: true});
        Object.assign(grid[nodeRow][nodeCol], {isFinish: false});
        Object.assign(grid[nodeRow][nodeCol], {isWall: false});
        Object.assign(grid[nodeRow][nodeCol], {isVisited: false});
        Object.assign(grid[nodeRow][nodeCol], {weight: 1});
        Object.assign(grid[nodeRow][nodeCol], {distance: 0});
        Object.assign(grid[nodeRow][nodeCol], {parent: "NO_PARENT"});
        Object.assign(grid[nodeRow][nodeCol], {g: 0});
        Object.assign(grid[nodeRow][nodeCol], {f: 0});
    }

    updateEndProps(nodeRow, nodeCol) {
        const grid = this.state.grid;
        Object.assign(grid[nodeRow][nodeCol], {isStart: false});
        Object.assign(grid[nodeRow][nodeCol], {isFinish: true});
        Object.assign(grid[nodeRow][nodeCol], {isWall: false});
        Object.assign(grid[nodeRow][nodeCol], {isVisited: false});
        Object.assign(grid[nodeRow][nodeCol], {weight: 1});
        Object.assign(grid[nodeRow][nodeCol], {distance: Infinity});
        Object.assign(grid[nodeRow][nodeCol], {parent: null});
        Object.assign(grid[nodeRow][nodeCol], {g: Infinity});
        Object.assign(grid[nodeRow][nodeCol], {f: Infinity});
    }

    updateStartNode(newRow, newCol) {
        const oldStartRow = this.state.startRow;
        const oldStartCol = this.state.startCol;

        // Update the old start node to be a regular node
        this.updateNodeProps(oldStartRow, oldStartCol);

        // Update the entered node to be the new start node
        this.updateStartProps(newRow, newCol);

        this.setState({
            startRow: newRow,
            startCol: newCol,
        });
    }

    updateEndNode(newRow, newCol) {
        const oldEndRow = this.state.endRow;
        const oldEndCol = this.state.endCol;

        // Update the old end node to be a regular node
        this.updateNodeProps(oldEndRow, oldEndCol);

        // Update the entered node to be the new end node
        this.updateEndProps(newRow, newCol);

        this.setState({
            endRow: newRow,
            endCol: newCol,
        });
    }

    isStart(nodeRow, nodeCol) {
        const isStart = nodeRow === this.state.startRow && nodeCol === this.state.startCol;
        return isStart ? true : false;
    }
    
    isEnd(nodeRow, nodeCol) {
        const isEnd = nodeRow === this.state.endRow && nodeCol === this.state.endCol;
        return isEnd ? true : false;
    }

    handleNodeClick(nodeRow, nodeCol) {
        const clickedNode = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);

        if (clickedNode.className === "wall-node") {
            clickedNode.className = "node";
            this.updateGridWall(nodeRow, nodeCol);
            this.setState({mouseClicked: true});
        } else if (clickedNode.className === "node") {
            clickedNode.className = "wall-node";
            this.updateGridWall(nodeRow, nodeCol);
            this.setState({mouseClicked: true});
        } else if (clickedNode.className === "end-node") {
            this.setState({
                mouseClicked: true,
                endNodeClicked: true,
            });
        } else if (clickedNode.className === "start-node") {
            this.setState({
                mouseClicked: true,
                startNodeClicked: true,
            });
        }
    }

    handleNodeEntered(nodeRow, nodeCol) {
        const enteredNode = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
        if (nodeRow === this.state.prevRow && nodeCol === this.state.prevCol) return;
        
        if (this.state.startNodeClicked) {
            if (nodeRow === this.state.endRow && nodeCol === this.state.endCol) return;
            const prevNode = document.getElementById(`row-${this.state.prevRow}-col-${this.state.prevCol}`);
            prevNode.className = "node";
            enteredNode.className = "start-node";
            this.updateStartNode(nodeRow, nodeCol);
        } else if (this.state.endNodeClicked) {
            if (nodeRow === this.state.startRow && nodeCol === this.state.startCol) return;
            const prevNode = document.getElementById(`row-${this.state.prevRow}-col-${this.state.prevCol}`);
            prevNode.className = "node";
            enteredNode.className = "end-node";
            this.updateEndNode(nodeRow, nodeCol);
        } else if (this.state.mouseClicked) {
            if (enteredNode.className === "wall-node") {
                enteredNode.className = "node";
            } else if (enteredNode.className === "node") {
                enteredNode.className = "wall-node";
            }
            this.updateGridWall(nodeRow, nodeCol);
        }

        this.setState({
            prevRow: nodeRow,
            prevCol: nodeCol,
        });
    }

    handleMouseUp() {
        this.setState({
            mouseClicked: false,
            startNodeClicked: false,
            endNodeClicked: false,
        });
    }

    genOuterWalls() {
        let animationTimerTop = 0;
        let animationTimerBot = 0;
        let animationTimerRight = 0
        let animationTimerLeft = 0

        for (let i = 0 ; i < NUM_COLS; i++) {
            const currWallTop = document.getElementById(`row-${0}-col-${i}`);
            if (currWallTop.className === "start-node" || currWallTop.className === "end-node") continue;
            setTimeout(() => {
                currWallTop.className = "wall-node";
                this.updateGridWall(0, i);
            }, ANIMATION_SPEED * animationTimerTop);
            animationTimerTop += 2;
        }

        for (let i = NUM_COLS - 1 ; i >= 0; i--) {
            const currWallBot = document.getElementById(`row-${NUM_ROWS - 1}-col-${i}`);
            if (currWallBot.className === "start-node" || currWallBot.className === "end-node") continue;
            setTimeout(() => {
                currWallBot.className = "wall-node";
                this.updateGridWall(NUM_ROWS - 1, i);
            }, ANIMATION_SPEED * animationTimerBot);
            animationTimerBot += 2;
        }

        animationTimerRight = animationTimerLeft = animationTimerTop;
        for (let i = 1; i < NUM_ROWS - 1; i++) {
            const currWallRight = document.getElementById(`row-${i}-col-${NUM_COLS - 1}`);
            if (currWallRight.className === "start-node" || currWallRight.className === "end-node") continue;
            setTimeout(() => {
                currWallRight.className = "wall-node";
                this.updateGridWall(i, NUM_COLS - 1);
            }, ANIMATION_SPEED * animationTimerRight);
            animationTimerRight += 2;
        }

        for (let i = NUM_ROWS - 2; i >= 0; i--) {
            const currWallLeft = document.getElementById(`row-${i}-col-${0}`);
            if (currWallLeft.className === "start-node" || currWallLeft.className === "end-node") continue;
            setTimeout(() => {
                currWallLeft.className = "wall-node";
                this.updateGridWall(i, 0);
            }, ANIMATION_SPEED * animationTimerLeft);
            animationTimerLeft += 2;
        }

        return animationTimerLeft;
    }

    genMaze() {
        this.clearGrid();
        const wallPositions = [];
        let animationTimer = 0;
        const orientation = NUM_ROWS < NUM_COLS ? "vertical" : "horizontal";
        animationTimer = this.genOuterWalls();
        generateMaze(1, 1, NUM_ROWS - 2, NUM_COLS - 2, orientation, wallPositions, this.state.startRow, this.state.startCol, this.state.endRow, this.state.endCol);
        for (let i = 0; i < wallPositions.length; i++) {
            const wallRow = wallPositions[i].row;
            const wallCol = wallPositions[i].col;
            const currWall = document.getElementById(`row-${wallRow}-col-${wallCol}`);
            setTimeout(() => {
                currWall.className = "wall-node";
                this.updateGridWall(wallRow, wallCol);
            }, ANIMATION_SPEED * animationTimer);
            this.setState({mouseClicked: false});
            animationTimer += 2;
        }

    }

    dijkstrasVisualize() {
        this.clearVistedAndPath();
        const grid = [...this.state.grid];
        const visitedNodes = dijkstras(grid, NUM_ROWS, NUM_COLS, this.state.endRow, this.state.endCol);
        const path = [];
        getPath(grid, grid[this.state.endRow][this.state.endCol], path);
        let animationTimer = 0;

        // Animate the visited nodes
        for (let i = 0; i < visitedNodes.length; i++) {
            for (let j = 0; j < visitedNodes[i].length; j++) {
                const visitedNode = visitedNodes[i][j];
                if (visitedNode.isFinish) break;
                const nodeRow = visitedNode.row;
                const nodeCol = visitedNode.col;
                const visitedNodeDOM = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
                setTimeout(() => {
                    visitedNodeDOM.className = "visited-node";
                }, ANIMATION_SPEED * animationTimer);
            }
            animationTimer += 2;
        }

        // Animate the path
        for (let i = 0; i < path.length; i++) {
            const pathNode = path[i];
            if (pathNode.isFinish) {
                console.log(this.state.grid);
                return;
            }
            const nodeRow = pathNode.row;
            const nodeCol = pathNode.col;
            const pathNodeDOM = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
            setTimeout(() => {
                pathNodeDOM.className = "path-node";
            }, ANIMATION_SPEED * animationTimer);
            animationTimer += 5;
        }
    }

    aStarVisualize() {
        this.clearVistedAndPath();
        const grid = [...this.state.grid];
        const visitedNodes = aStarSearch(grid, NUM_ROWS, NUM_COLS, this.state.startRow, this.state.startCol, this.state.endRow, this.state.endCol);
        let animationTimer = 0;

        // Animate the visited nodes
        for (let i = 0; i < visitedNodes.length; i++) {
                const visitedNode = visitedNodes[i];
                if (visitedNode.isFinish) break;
                const nodeRow = visitedNode.row;
                const nodeCol = visitedNode.col;
                const visitedNodeDOM = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
                setTimeout(() => {
                    visitedNodeDOM.className = "visited-node";
                }, ANIMATION_SPEED * animationTimer);
            
            animationTimer += 2;
        }

        const path = [];
        getPath(grid, grid[this.state.endRow][this.state.endCol], path);

        // Animate the path
        for (let i = 0; i < path.length; i++) {
            const pathNode = path[i];
            if (pathNode.isFinish) return;
            const nodeRow = pathNode.row;
            const nodeCol = pathNode.col;
            const pathNodeDOM = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
            setTimeout(() => {
                pathNodeDOM.className = "path-node";
            }, ANIMATION_SPEED * animationTimer);
            animationTimer += 5;
        }
    }

    bfsVisualize() {
        this.clearVistedAndPath();
        const grid = [...this.state.grid];
        const visitedNodes = breadthFirstSearch(grid, NUM_ROWS, NUM_COLS, this.state.startRow, this.state.startCol, this.state.endRow, this.state.endCol);
        let animationTimer = 0;

        // Animate the visited nodes
        for (let i = 0; i < visitedNodes.length; i++) {
            for (let j = 0; j < visitedNodes[i].length; j++) {
                const visitedNode = visitedNodes[i][j];
                if (visitedNode.isFinish) break;
                const nodeRow = visitedNode.row;
                const nodeCol = visitedNode.col;
                const visitedNodeDOM = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
                setTimeout(() => {
                    visitedNodeDOM.className = "visited-node";
                }, ANIMATION_SPEED * animationTimer);
            }
            animationTimer += 2;
        }

        const path = [];
        getPath(grid, grid[this.state.endRow][this.state.endCol], path);

        // Animate the path
        for (let i = 0; i < path.length; i++) {
            const pathNode = path[i];
            if (pathNode.isFinish) return;
            const nodeRow = pathNode.row;
            const nodeCol = pathNode.col;
            const pathNodeDOM = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
            setTimeout(() => {
                pathNodeDOM.className = "path-node";
            }, ANIMATION_SPEED * animationTimer);
            animationTimer += 5;
        }
    }

    dfsVisualize() {
        this.clearVistedAndPath();
        const grid = [...this.state.grid];
        const visitedNodes = depthFirstSearch(grid, NUM_ROWS, NUM_COLS, this.state.startRow, this.state.startCol, this.state.endRow, this.state.endCol);
        let animationTimer = 0;

        // Animate the visited nodes
        for (let i = 0; i < visitedNodes.length; i++) {
                const visitedNode = visitedNodes[i];
                if (visitedNode.isFinish) break;
                const nodeRow = visitedNode.row;
                const nodeCol = visitedNode.col;
                const visitedNodeDOM = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
                setTimeout(() => {
                    visitedNodeDOM.className = "visited-node";
                }, ANIMATION_SPEED * animationTimer);
            
            animationTimer += 2;
        }

        const path = [];
        getPath(grid, grid[this.state.endRow][this.state.endCol], path);

        // Animate the path
        for (let i = 0; i < path.length; i++) {
            const pathNode = path[i];
            if (pathNode.isFinish) return;
            const nodeRow = pathNode.row;
            const nodeCol = pathNode.col;
            const pathNodeDOM = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
            setTimeout(() => {
                pathNodeDOM.className = "path-node";
            }, ANIMATION_SPEED * animationTimer);
            animationTimer += 5;
        }
    }

    render() {
        const grid = this.state.grid;

        return (
            <div className = "container">
                <div className="options-bar">
                    <button id="dijkstras" onClick={() => this.dijkstrasVisualize()}> Visualize Dijkstras  </button>
                    <button id="a-star" onClick={() => this.aStarVisualize()}> Visualize A*  </button>
                    <button id="bfs" onClick={() => this.bfsVisualize()}> Visualize BFS  </button>
                    <button id="dfs" onClick={() => this.dfsVisualize()}> Visualize DFS  </button>
                    <button id="clear-grid" onClick={() => this.clearGrid()}> Clear  </button>
                    <button id="gen-maze" onClick={() => this.genMaze()}> Generate Maze  </button>
                </div>
                <div className = "grid" onMouseUp = {() => this.handleMouseUp()}>
                    {grid.map((row, rowIndex) => {
                    return <div key={rowIndex}>{row.map((node, colIndex) => {
                        return (
                            <Node
                                key = {colIndex}
                                nodeRow = {rowIndex}
                                nodeCol = {colIndex}
                                isStart = {this.isStart(rowIndex, colIndex)}
                                isEnd = {this.isEnd(rowIndex, colIndex)}
                                onMouseDown = {() => this.handleNodeClick(rowIndex, colIndex)}
                                onMouseEnter = {() => this.handleNodeEntered(rowIndex, colIndex)}
                            ></Node>
                        )})}</div>
                    })}
                    
                </div>
                
            </div>
        );
    }
}
