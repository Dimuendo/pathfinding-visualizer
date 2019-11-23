import React from 'react';
import './Node.css'

export default class Node extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            mouseClicked: false,
        }
    }

    setNodeId(nodeRow, nodeCol) {
        let nodeID = `row-${nodeRow}-col-${nodeCol}`;
        return nodeID;
    }

    setNodeClass(nodeRow, nodeCol) {
        let nodeClass = "node";
        if (this.props.isStart) {
            nodeClass = "start-node";
        } else if (this.props.isEnd) {
            nodeClass = "end-node";
        }
        return nodeClass;
    }

    render() {
        const handleNodeClick = this.props.onMouseDown;
        const handleNodeEntered = this.props.onMouseEnter;

        return (
        <div 
            className= {this.setNodeClass(this.props.nodeRow, this.props.nodeCol)}
            id = {this.setNodeId(this.props.nodeRow, this.props.nodeCol)}
            onMouseDown = {() => handleNodeClick()}
            onMouseEnter = {() => handleNodeEntered()}
        ></div>);
    }
}
