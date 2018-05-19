import * as React from 'react';
import { Layer, Rect, Stage, Group } from 'react-konva';

export const SIZE = 15;

export interface SquareProps {
    alive: boolean;
    model: any;
    onClick: (e: any, model: any) => void;
}

export class Square extends React.Component<SquareProps, {}> {
    constructor(props: SquareProps) {
        super(props);
    }

    render() {
        if (this.props.alive) {
            return <Rect onClick={(e: any) => { this.props.onClick(e, this.props.model); }} x={this.props.model.x * SIZE} y={this.props.model.y * SIZE} width={SIZE} height={SIZE} fill='green' cornerRadius={SIZE / 2} />;
        } else {
            return <Rect onClick={(e: any) => { this.props.onClick(e, this.props.model); }} x={this.props.model.x * SIZE} y={this.props.model.y * SIZE} width={SIZE} height={SIZE} fill='lightgrey' cornerRadius={SIZE / 2} />;
        }
    }
    shouldComponentUpdate(nextProps: SquareProps, nextState: {}) {
        return nextProps.alive != this.props.alive;
    }
}