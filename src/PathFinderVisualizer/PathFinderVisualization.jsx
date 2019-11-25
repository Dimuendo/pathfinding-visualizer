import React from 'react';
import Node from './Node/Node';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PathFinderVisualization.css'
import './Node/Node.css'
import {dijkstras, getPath} from '../Algorithms/dijkstras';
import {generateMaze} from '../Algorithms/MazeGeneration';
import {breadthFirstSearch} from '../Algorithms/BreadthFirstSearch';
import {depthFirstSearch} from '../Algorithms/DepthFirstSearch';
import {aStarSearch} from '../Algorithms/AStarSearch'
import { Button, Dropdown, Navbar, ButtonGroup, DropdownButton, Badge } from 'react-bootstrap';

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
const NODE_SIZE = 30;
const NUM_ROWS = Math.floor((SCREEN_HEIGHT / NODE_SIZE) - 4);
const NUM_COLS = Math.floor((SCREEN_WIDTH / NODE_SIZE) - 4);
const ANIMATION_SPEED = 5;
const algos = {
    DIJKSTRAS: "dijkstras",
    ASTAR: "aStar",
    BFS: "bfs",
    DFS: "dfs",
}
const walls = {
    INFINITY: "wall-node-infinity",
    FIVE: "wall-node-five",
    FOUR: "wall-node-four",
    THREE: "wall-node-three",
    TWO: "wall-node-two",
    ONE: "wall-node-one",
}

export default class PathFinderVisualizer extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            currAlgo: algos.DIJKSTRAS,
            wallWeight: Infinity,
            running: false,
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
        // Avoid rerendering entire dom on every setState to avoid performance issues
        if (this.state.mouseClicked) return false;
        return true;
    }

    //////////////////////////////////////////////////////////////////////////////////
    //                              Grid Creation                                   //
    //////////////////////////////////////////////////////////////////////////////////

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

    //////////////////////////////////////////////////////////////////////////////////
    //                              Grid Deletion                                   //
    //////////////////////////////////////////////////////////////////////////////////

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
        const grid = this.state.grid;
        for (let currRow = 0; currRow < NUM_ROWS; currRow++) {
            for (let currCol = 0; currCol < NUM_COLS; currCol++) {
                const currNode = document.getElementById(`row-${currRow}-col-${currCol}`);
                const nodeIsWall = currNode.className === "wall-node-infinity";

                // Node is a wall with infinite weight, continue
                if (nodeIsWall) continue;

                // Update the node properties appropriately. If the visited node or path node has a 
                //   weight in its class => get that weight and append it to a wall-node classname else update its properties
                const currNodeClassWeight = this.getNodeClassWeight(currNode.className);
                const isStartNode = currNode.className === "start-node";
                const isEndNode = currNode.className === "end-node";
                if (currNodeClassWeight !== "") {
                    currNode.className = "wall-node" + currNodeClassWeight;
                    const currWallWeight = this.getWallWeightAsInt(currNodeClassWeight);
                    this.updateNodeProps(currRow, currCol);
                    Object.assign(grid[currRow][currCol], {isWall: true});
                    Object.assign(grid[currRow][currCol], {weight: currWallWeight});
                } else if (isStartNode) {
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

    //////////////////////////////////////////////////////////////////////////////////
    //                               Grid Updates                                   //
    //////////////////////////////////////////////////////////////////////////////////

    updateGridWall(nodeRow, nodeCol, weight) {
        // Update the given node to be a regular node then make it a wall and set its weight
        const grid = this.state.grid;
        const currNode = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
        const nodeIsWall = currNode.className.includes("wall-node");
        if (nodeIsWall) {
            this.updateNodeProps(nodeRow, nodeCol);
            Object.assign(grid[nodeRow][nodeCol], {isWall: true});
            Object.assign(grid[nodeRow][nodeCol], {weight: weight});
        } if (currNode.className === "node") {
            this.updateNodeProps(nodeRow, nodeCol);
        }
    }

    updateNodeProps(nodeRow, nodeCol) {
        // Update the given node to be a regular node
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
        // Update the given node to be a start node
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
        // Update the given node to be an end node
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

    //////////////////////////////////////////////////////////////////////////////////
    //                              Helper Functions                                //
    //////////////////////////////////////////////////////////////////////////////////

    isStart(nodeRow, nodeCol) {
        const isStart = nodeRow === this.state.startRow && nodeCol === this.state.startCol;
        return isStart ? true : false;
    }
    
    isEnd(nodeRow, nodeCol) {
        const isEnd = nodeRow === this.state.endRow && nodeCol === this.state.endCol;
        return isEnd ? true : false;
    }

    getWallClassName(weight) {
        // Get the appropriate className associated with the given weight
        let wallClassName;
        if (weight === 1) {
            wallClassName = walls.ONE;
        } else if (weight === 2) {
            wallClassName = walls.TWO;
        } else if (weight === 3) {
            wallClassName = walls.THREE;
        } else if (weight === 4) {
            wallClassName = walls.FOUR;
        } else if (weight === 5) {
            wallClassName = walls.FIVE;
        } else {
            wallClassName = walls.INFINITY;
        }
        return wallClassName;
    }

    getWallWeightAsInt(stringWeight) {
        // Given a wall classname return its integer weight
        let nodeWeight = 1;
        if (stringWeight.includes("five")) {
            nodeWeight = 5;
        } else if (stringWeight.includes("four")) {
            nodeWeight = 4;
        } else if (stringWeight.includes("three")) {
            nodeWeight = 3;
        } else if (stringWeight.includes("two")) {
            nodeWeight = 2;
        } else if (stringWeight.includes("one")) {
            nodeWeight = 1;
        }
        return nodeWeight;
    }

    getNodeClassWeight(nodeClassName) {
        // Given a classname check if it has a weight in it and return that weight
        //   so it can be appended to a classname
        let nodeWeight = "";
        if (nodeClassName.includes("five")) {
            nodeWeight = "-five";
        } else if (nodeClassName.includes("four")) {
            nodeWeight = "-four";
        } else if (nodeClassName.includes("three")) {
            nodeWeight = "-three";
        } else if (nodeClassName.includes("two")) {
            nodeWeight = "-two";
        } else if (nodeClassName.includes("one")) {
            nodeWeight = "-one";
        }
        return nodeWeight;
    }

    //////////////////////////////////////////////////////////////////////////////////
    //                              Click Handling                                  //
    //////////////////////////////////////////////////////////////////////////////////

    handleNodeClick(nodeRow, nodeCol) {
        if (this.state.running) return;
        const clickedNode = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
        const wallClicked = clickedNode.className.includes("wall-node");

        if (wallClicked) {
            clickedNode.className = "node";
            this.updateGridWall(nodeRow, nodeCol, this.state.wallWeight);
            this.setState({mouseClicked: true});
        } else if (clickedNode.className === "node") {
            const wallClassName = this.getWallClassName(this.state.wallWeight);
            clickedNode.className = wallClassName;
            this.updateGridWall(nodeRow, nodeCol, this.state.wallWeight);
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
        if (this.state.running) return;
        if (nodeRow === this.state.prevRow && nodeCol === this.state.prevCol) return;
        const enteredNode = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
        const wallClicked = enteredNode.className.includes("wall-node");
        
        if (this.state.startNodeClicked) {
            // Update the entered node to be the start node, update prev node to be a regular node
            if (nodeRow === this.state.endRow && nodeCol === this.state.endCol) return;
            const prevNode = document.getElementById(`row-${this.state.prevRow}-col-${this.state.prevCol}`);
            prevNode.className = "node";
            enteredNode.className = "start-node";
            this.updateStartNode(nodeRow, nodeCol);
        } else if (this.state.endNodeClicked) {
            // Update the entered node to be the end node, update prev node to be a regular node
            if (nodeRow === this.state.startRow && nodeCol === this.state.startCol) return;
            const prevNode = document.getElementById(`row-${this.state.prevRow}-col-${this.state.prevCol}`);
            prevNode.className = "node";
            enteredNode.className = "end-node";
            this.updateEndNode(nodeRow, nodeCol);
        } else if (this.state.mouseClicked) {
            // Update the entered node to be a wall/regular node respectively
            if (wallClicked) {
                enteredNode.className = "node";
            } else if (enteredNode.className === "node") {
                const wallClassName = this.getWallClassName(this.state.wallWeight);
                enteredNode.className = wallClassName;
                enteredNode.className = wallClassName;
            }
            this.updateGridWall(nodeRow, nodeCol, this.state.wallWeight);
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

    //////////////////////////////////////////////////////////////////////////////////
    //                              Maze Generation                                 //
    //////////////////////////////////////////////////////////////////////////////////

    genOuterWalls() {
        let animationTimerTop = 0;
        let animationTimerBot = 0;
        let animationTimerRight = 0
        let animationTimerLeft = 0
        
        // Create the outer top walls from left to right
        for (let i = 0 ; i < NUM_COLS; i++) {
            const currWallTop = document.getElementById(`row-${0}-col-${i}`);
            if (currWallTop.className === "start-node" || currWallTop.className === "end-node") continue;
            setTimeout(() => {
                currWallTop.className = "wall-node-infinity";
                this.updateGridWall(0, i, Infinity);
            }, ANIMATION_SPEED * animationTimerTop);
            animationTimerTop += 2;
        }

        // Create the outer bottom walls from right to left
        for (let i = NUM_COLS - 1 ; i >= 0; i--) {
            const currWallBot = document.getElementById(`row-${NUM_ROWS - 1}-col-${i}`);
            if (currWallBot.className === "start-node" || currWallBot.className === "end-node") continue;
            setTimeout(() => {
                currWallBot.className = "wall-node-infinity";
                this.updateGridWall(NUM_ROWS - 1, i, Infinity);
            }, ANIMATION_SPEED * animationTimerBot);
            animationTimerBot += 2;
        }

        // Set the animation timers for the vertical walls to be the time it takes for 
        //   the horizontal walls to generate
        animationTimerRight = animationTimerLeft = animationTimerTop;

        // Create the outer right walls from top to bottom
        for (let i = 1; i < NUM_ROWS - 1; i++) {
            const currWallRight = document.getElementById(`row-${i}-col-${NUM_COLS - 1}`);
            if (currWallRight.className === "start-node" || currWallRight.className === "end-node") continue;
            setTimeout(() => {
                currWallRight.className = "wall-node-infinity";
                this.updateGridWall(i, NUM_COLS - 1, Infinity);
            }, ANIMATION_SPEED * animationTimerRight);
            animationTimerRight += 2;
        }

        // Create the outer left walls from bottom to top
        for (let i = NUM_ROWS - 2; i >= 0; i--) {
            const currWallLeft = document.getElementById(`row-${i}-col-${0}`);
            if (currWallLeft.className === "start-node" || currWallLeft.className === "end-node") continue;
            setTimeout(() => {
                currWallLeft.className = "wall-node-infinity";
                this.updateGridWall(i, 0, Infinity);
            }, ANIMATION_SPEED * animationTimerLeft);
            animationTimerLeft += 2;
        }

        // Return how long it takes to generate all the outer walls
        return animationTimerLeft;
    }

    genMaze(weight) {
        this.clearGrid();
        this.setButtonState(true);
        this.setState({ running: true });
        const wallPositions = [];
        let animationTimer = 0;
        const orientation = NUM_ROWS < NUM_COLS ? "vertical" : "horizontal";
        animationTimer = this.genOuterWalls();

        // Get the wall positions for the generated maze
        generateMaze(1, 1, NUM_ROWS - 2, NUM_COLS - 2, orientation, wallPositions, this.state.startRow, this.state.startCol, this.state.endRow, this.state.endCol);

        // Change each wall position into a wall
        for (let i = 0; i < wallPositions.length; i++) {
            const wallRow = wallPositions[i].row;
            const wallCol = wallPositions[i].col;
            const currWall = document.getElementById(`row-${wallRow}-col-${wallCol}`);
            setTimeout(() => {
                const randomWeight = getRandomWeight();
                const wallWeight = weight === -1 ? randomWeight : weight;
                const wallClassName = this.getWallClassName(wallWeight);
                currWall.className = wallClassName;
                this.updateGridWall(wallRow, wallCol, wallWeight);
            }, ANIMATION_SPEED * animationTimer);
            this.setState({mouseClicked: false});
            animationTimer += 2;
        }

        // Renable the buttons
        setTimeout(() => {
            this.setButtonState(false);
            this.setState({ running: false });
        }, ANIMATION_SPEED * animationTimer + 15);
    }

    //////////////////////////////////////////////////////////////////////////////////
    //                          Algorithm Visualizations                            //
    //////////////////////////////////////////////////////////////////////////////////

    dijkstrasVisualize() {
        this.clearVistedAndPath();
        this.setButtonState(true);
        this.setState({ running: true });
        const grid = [...this.state.grid];
        const visitedNodes = dijkstras(grid, NUM_ROWS, NUM_COLS, this.state.endRow, this.state.endCol);
        let animationTimer = 0;

        // Animate the visited nodes
        for (let i = 0; i < visitedNodes.length; i++) {
            for (let j = 0; j < visitedNodes[i].length; j++) {
                const visitedNode = visitedNodes[i][j];
                if (visitedNode.isFinish) break;
                const nodeRow = visitedNode.row;
                const nodeCol = visitedNode.col;
                const visitedNodeDOM = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
                const visitedNodeClassName = visitedNodeDOM.className;

                // If we are visiting a weighted wall then get the weight and append it to a visited-node classname
                //   else chanmge the classname to be a visited node
                if (visitedNodeClassName.includes("wall-node")) {
                    const wallWeight = visitedNodeClassName.substr(9);
                    const visitedClassName = "visited-node" + wallWeight;
                    setTimeout(() => {
                        visitedNodeDOM.className = visitedClassName;
                    }, ANIMATION_SPEED * animationTimer);
                } else {
                    setTimeout(() => {
                        visitedNodeDOM.className = "visited-node";
                    }, ANIMATION_SPEED * animationTimer);
                }
            }
            animationTimer += 4;
        }

        const path = [];
        getPath(grid, grid[this.state.endRow][this.state.endCol], path);

        // Animate the path
        for (let i = 0; i < path.length; i++) {
            const pathNode = path[i];
            if (pathNode.isFinish) break;
            const nodeRow = pathNode.row;
            const nodeCol = pathNode.col;
            const pathNodeDOM = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
            const pathNodeClassName = pathNodeDOM.className;
            const pathWeight = this.getNodeClassWeight(pathNodeClassName);

            // If there is a weight in the currentnodes classname then it will be appended else the pathweight
            //   will be empty and nothing will be appended
            const newPathNodeClassName = "path-node" + pathWeight;
            setTimeout(() => {
                pathNodeDOM.className = newPathNodeClassName;
            }, ANIMATION_SPEED * animationTimer);
            animationTimer += 5;
        }
        
        // Reenable the buttons
        setTimeout(() => {
            this.setButtonState(false);
            this.setState({ running: false });
        }, ANIMATION_SPEED * animationTimer + 15);
    }

    aStarVisualize() {
        this.clearVistedAndPath();
        this.setButtonState(true);
        this.setState({ running: true });
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
            const visitedNodeClassName = visitedNodeDOM.className;
            if (visitedNodeClassName.includes("wall-node")) {
                const wallWeight = visitedNodeClassName.substr(9);
                const visitedClassName = "visited-node" + wallWeight;
                setTimeout(() => {
                    visitedNodeDOM.className = visitedClassName;
                }, ANIMATION_SPEED * animationTimer);
            } else {
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
            if (pathNode.isFinish) break;
            const nodeRow = pathNode.row;
            const nodeCol = pathNode.col;
            const pathNodeDOM = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
            const pathNodeClassName = pathNodeDOM.className;
            const pathWeight = this.getNodeClassWeight(pathNodeClassName);
            const newPathNodeClassName = "path-node" + pathWeight;
            setTimeout(() => {
                pathNodeDOM.className = newPathNodeClassName;
            }, ANIMATION_SPEED * animationTimer);
            animationTimer += 5;
        }

        setTimeout(() => {
            this.setButtonState(false);
            this.setState({ running: false });
        }, ANIMATION_SPEED * animationTimer + 15);
    }

    bfsVisualize() {
        this.clearVistedAndPath();
        this.setButtonState(true);
        this.setState({ running: true });
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
            animationTimer += 4;
        }

        const path = [];
        getPath(grid, grid[this.state.endRow][this.state.endCol], path);

        // Animate the path
        for (let i = 0; i < path.length; i++) {
            const pathNode = path[i];
            if (pathNode.isFinish) break;
            const nodeRow = pathNode.row;
            const nodeCol = pathNode.col;
            const pathNodeDOM = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
            setTimeout(() => {
                pathNodeDOM.className = "path-node";
            }, ANIMATION_SPEED * animationTimer);
            animationTimer += 5;
        }

        setTimeout(() => {
            this.setButtonState(false);
            this.setState({ running: false });
        }, ANIMATION_SPEED * animationTimer + 15);
    }

    dfsVisualize() {
        this.clearVistedAndPath();
        this.setButtonState(true);
        this.setState({ running: true });
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
            
            animationTimer += 4;
        }

        const path = [];
        getPath(grid, grid[this.state.endRow][this.state.endCol], path);

        // Animate the path
        for (let i = 0; i < path.length; i++) {
            const pathNode = path[i];
            if (pathNode.isFinish) break;
            const nodeRow = pathNode.row;
            const nodeCol = pathNode.col;
            const pathNodeDOM = document.getElementById(`row-${nodeRow}-col-${nodeCol}`);
            setTimeout(() => {
                pathNodeDOM.className = "path-node";
            }, ANIMATION_SPEED * animationTimer);
            animationTimer += 5;
        }

        setTimeout(() => {
            this.setButtonState(false);
            this.setState({ running: false });
        }, ANIMATION_SPEED * animationTimer + 15);
    }

    visualize(algo) {
        // Run the chosen algorithm
        if (algo === algos.DIJKSTRAS) {
            this.dijkstrasVisualize();
        } else if (algo === algos.ASTAR) {
            this.aStarVisualize()
        } else if (algo === algos.BFS) {
            this.bfsVisualize()
        } else if (algo === algos.DFS) {
            this.dfsVisualize()
        }
    }

    //////////////////////////////////////////////////////////////////////////////////
    //                              Button Functions                                //
    //////////////////////////////////////////////////////////////////////////////////

    setAlgo(algo) {
        // Update the state to reflect the chosen algorithm
        const visualizeButton = document.getElementById("visualize");
        if (algo === algos.DIJKSTRAS) {
            visualizeButton.innerHTML = "Visualize Dijkstras";
        } else if (algo === algos.ASTAR) {
            visualizeButton.innerHTML = "Visualize A*";
        } else if (algo === algos.BFS) {
            visualizeButton.innerHTML = "Visualize Breadth First Search";
        } else if (algo === algos.DFS) {
            visualizeButton.innerHTML = "Visualize Depth First Search";
        }
        this.setState({ currAlgo: algo });
    }

    increaseWeight() {
        // Increase the counter for the weight badge
        const currWallWeight = this.state.wallWeight;
        const wallWeightBadge = document.getElementById('wall-weight');
        if (currWallWeight === Infinity) {
            return;
        } else if (currWallWeight === 5) {
            wallWeightBadge.innerHTML = "∞";
            this.setState({ wallWeight: Infinity });
        } else {
            const newWallWeight = currWallWeight + 1;
            wallWeightBadge.innerHTML = newWallWeight;
            this.setState({ wallWeight: newWallWeight });
        }
    }

    decreaseWeight() {
        // Decrease the counter for the weight badge
        const currWallWeight = this.state.wallWeight;
        const wallWeightBadge = document.getElementById('wall-weight');
        if (currWallWeight === 1) {
            return;
        } else if (currWallWeight === Infinity) {
            wallWeightBadge.innerHTML = 5;
            this.setState({ wallWeight: 5 });
        } else {
            const newWallWeight = currWallWeight - 1;
            wallWeightBadge.innerHTML = newWallWeight;
            this.setState({ wallWeight: newWallWeight });
        }
    }

    setButtonState(state) {
        // Set all the buttons to the given state, true => button is disabled
        document.getElementById("algo-dropdown").disabled = state;
        document.getElementById("maze-dropdown").disabled = state;
        document.getElementById("visualize").disabled = state;
        document.getElementById("increase-weight").disabled = state;
        document.getElementById("decrease-weight").disabled = state;
        document.getElementById("clear-grid").disabled = state;
        document.getElementById("clear-path").disabled = state;
    }

    //////////////////////////////////////////////////////////////////////////////////
    //                                  Render                                      //
    //////////////////////////////////////////////////////////////////////////////////

    render() {
        const grid = this.state.grid;

        return (
            <div className="container-fluid">
                 <Navbar bg="dark" variant="dark" expand="lg">
                    <Navbar.Brand> Pathfinding Visualizer </Navbar.Brand>
                    <DropdownButton variant="dark" id="algo-dropdown" title="Choose Algorithm" className="ml-2 mr-2">
                        <Dropdown.Item as="button" onClick={() => this.setAlgo(algos.DIJKSTRAS)}> Dijkstras </Dropdown.Item>
                        <Dropdown.Item as="button" onClick={() => this.setAlgo(algos.ASTAR)}> A* </Dropdown.Item>
                        <Dropdown.Item as="button" onClick={() => this.setAlgo(algos.BFS)}> Breadth First Search </Dropdown.Item>
                        <Dropdown.Item as="button" onClick={() => this.setAlgo(algos.DFS)}> Depth First Search </Dropdown.Item>
                    </DropdownButton>
                    <DropdownButton variant="dark" id="maze-dropdown" title="Generate Maze" className="ml-2 mr-2">
                        <Dropdown.Item as="button" onClick={() => this.genMaze(this.state.wallWeight)}> Use Selected Weight  </Dropdown.Item>
                        <Dropdown.Item as="button" onClick={() => this.genMaze(-1)}> Use Random Weights  </Dropdown.Item>
                    </DropdownButton>
                    <Button id ="visualize" className="ml-2 mr-2" variant="dark" onClick={() => this.visualize(this.state.currAlgo)}> Visualize Dijkstras </Button>
                    <Navbar.Text id="weight-text" className="ml-2">
                        Wall Weight:
                        <Badge className="ml-2 mr-1" variant="light" id="wall-weight"> ∞ </Badge>
                    </Navbar.Text>
                    <ButtonGroup>
                        <Button id="increase-weight" variant="dark" size="sm" onClick={() => this.increaseWeight()}> + </Button>
                        <Button id="decrease-weight" variant="dark" className="mr-2" size="sm" onClick={() => this.decreaseWeight()}> - </Button>
                    </ButtonGroup>
                    <Button id="clear-grid" className="ml-2 mr-2" variant="dark" onClick={() => this.clearGrid()}> Clear Grid </Button>
                    <Button id="clear-path" className="ml-2 mr-2" variant="dark" onClick={() => this.clearVistedAndPath()}> Clear Path </Button>
                </Navbar>
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

function getRandomWeight() {
    // Get a random number b/w 1 and 6, 6 => make weight infinite
    const min = 1;
    const max = 6;
    const randWeight = Math.floor(Math.random() * (max - min + 1)) + min;
    return randWeight === 6 ? Infinity : randWeight;
}
