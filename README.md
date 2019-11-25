# pathfinding-visualizer

This React application is a pathfinding visualizer that allows the user to visualize Dijkstras's Alogirthm, A* Search, Breadth First Search, and Depth First Search. The website for the application is: https://dimuendo.github.io/pathfinding-visualizer/

# How to use the application

There are 4 algorithms you can choose from using the "Choose Algorithm" dropdown button. After selecting an algorithm, you can then visualize it by pressing the "Visualize Algorithm" button.
Walls can be created by clicking and dragging across the grid. Walls can have different weight associated with them depending on the weight you choose in the top bar. The more weight a wall has, the darker its shade will be. To increase the weight, press the "+" button and to decrease the weight press the "-" button. Walls that have a weight of infinity cannot be passed through during the search. Walls with weight 1-5 can be passed through in Dijkstra's algorithm and A* Search since they are weighted algorithms. A wall of weight "x" means that for the path to go through that wall, it will add a distance of "x".
Mazes can be generated in two ways. You can use the selected weight to build the maze which means that the inner walls of the maze will all be created using the selected weight. You can also use random weights meaning that the inner walls of the maze will all have a random weight assoicated with them. In both cases the maze is generated using recursive division.
