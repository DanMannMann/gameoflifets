import * as React from "react";
import { Row, Col, Container, Button } from 'reactstrap';
import { Square, SIZE } from './square';
import { Stage, Layer } from "react-konva";

const DIMENSION = 70;
var DELAY = 0;

export interface BoardProps {

}

export interface BoardState {
    running: boolean;
    rows: any[];
    DELAY: number;
    intervalId: number;
}

export class Board extends React.Component<BoardProps,BoardState> {
    constructor(props: BoardProps, context: any) {
        super(props, context);
        this.onClick = this.onClick.bind(this);
        this.clear = this.clear.bind(this);
        this.toggle = this.toggle.bind(this);
        this.tick = this.tick.bind(this);
        this.getNeighbours = this.getNeighbours.bind(this);
        this.calculateNeighbours = this.calculateNeighbours.bind(this);
        this.livingRules = this.livingRules.bind(this);
        this.deadRules = this.deadRules.bind(this);
        this.speedChange = this.speedChange.bind(this);

        this.state = { rows: this.getDefaultRows(), running: false, DELAY: DELAY, intervalId: -1 };
    }

    private getDefaultRows() {
        var rows = [];
        let d2 = (DIMENSION / 2);
        for (var x = 0; x < DIMENSION; x++) {
            var cells: any[] = [];
            rows[x] = cells;
            for (var y = 0; y < DIMENSION; y++) {
                cells[y] = { alive: (x > d2 - 3 && x < d2 + 3 && y == d2) || (y > d2 - 2 && y < d2 + 2 && (x == d2 - 3 || x == d2 + 3)), element: null, x: x, y: y };
            }
        }
        return rows;
    }

    private toggle() {
        var interval: number = -1;
        if (this.state.running) {
            clearInterval(this.state.intervalId);
        } else {
            if (this.state.DELAY > 0) {
                interval = setInterval(this.tick, this.state.DELAY);
            } else {
                setImmediate(this.tick);
            }
        }
        
        this.setState({ running: !this.state.running, intervalId: interval });
    }

    private tick() {
        let newRows: any[] = this.state.rows.map(x => x.map((y: any) => y));
        for (var col in this.state.rows) {
            for (var cell in this.state.rows[col]) {
                newRows[col][cell] = this.state.rows[col][cell].alive ?
                                            this.livingRules(this.state.rows[col][cell], parseInt(col), parseInt(cell), this.state.rows)
                                                :
                                            this.deadRules(this.state.rows[col][cell], parseInt(col), parseInt(cell), this.state.rows);
            }
        }

        this.setState({ rows: newRows });

        var interval: number = -1;
        if (this.state.running) {
            if (this.state.DELAY === 0) {
                setImmediate(this.tick);
            } 
        }
    }

    private livingRules(model: any, x: number, y: number, rows: any): any {
        let neighbours: Array<{x: number, y: number}> = this.getNeighbours(x, y);
        let ct = 0;
        for (var n in neighbours) {
            if (rows[neighbours[n].x][neighbours[n].y].alive) {
                ct++;
            }
        }
        var isAlive = ct == 2 || ct == 3;
        return isAlive === model.alive ? model : { alive: isAlive, element: null, x: model.x, y: model.y };
    }

    private deadRules(model: any, x: any, y: any, rows: any) {
        let neighbours: Array<{x: number, y: number}> = this.getNeighbours(x, y);
        let ct = 0;
        for (var n in neighbours) {
            if (rows[neighbours[n].x][neighbours[n].y].alive) {
                ct++;
            }
        }
        var isAlive = ct == 3;
        return isAlive === model.alive ? model : { alive: isAlive, element: null, x: model.x, y: model.y };
    }

    private neighbourCache: {x: number, y: number}[][][] = [];
    private getNeighbours(x: any, y: any): {x: number, y: number}[] {
        if (!this.neighbourCache[x]) {
            this.neighbourCache[x] = [];
        }
        if (!this.neighbourCache[x][y]) {
            this.neighbourCache[x][y] = this.calculateNeighbours(x, y);
        }
        return this.neighbourCache[x][y];
    }

    private calculateNeighbours(x: any, y: any) {
        let neighbours: {x: number, y: number}[] = [];
        let xLow = x > 0;
        let xHigh = x < DIMENSION - 1;
        let yLow = y > 0;
        let yHigh = y < DIMENSION - 1;
        if (xLow) {
            neighbours.push({x: x - 1, y: y});
        }
        if (xHigh) {
            neighbours.push({x: x + 1, y: y});
        }
        if (yLow) {
            neighbours.push({x: x, y: y - 1});
        }
        if (yHigh) {
            neighbours.push({x: x, y: y + 1});
        }
        if (xLow && yLow) {
            neighbours.push({x: x - 1, y: y - 1});
        }
        if (xHigh && yHigh) {
            neighbours.push({x: x + 1, y: y + 1});
        }
        if (xHigh && yLow) {
            neighbours.push({x: x + 1, y: y - 1});
        }
        if (xLow && yHigh) {
            neighbours.push({x: x - 1, y: y + 1});
        }
        return neighbours;
    }

    private clear() {
        this.setState({ rows: this.getDefaultRows() });
    }

    private speedChange(e: any) {
        if (this.state.intervalId > -1) {
            clearInterval(this.state.intervalId);
        }
        if ((e.target.value as number) > 0) {
            this.setState({ DELAY: e.target.value, intervalId: setInterval(this.tick, e.target.value) });
        } else {
            this.setState({ DELAY: e.target.value, intervalId: -1 });
            setImmediate(this.tick);
        }
    }

    render() {
        let clk = this.onClick;
        return (
            <Container fluid>
                <Row>
                    <Col sm={12} className='text-center'>
                        <div style={{ margin: 5, display:'inline' }}>
                            {this.state.running ? <Button color='primary' onClick={this.toggle}>Stop</Button> : <Button color='primary' onClick={this.toggle}>Start</Button>}
                        </div>
                        <div style={{ margin: 5, display: 'inline' }}>
                            <Button color='danger' onClick={this.clear}>Clear</Button>
                        </div>
                        <div style={{ margin: 5, display: 'inline' }}>
                            <input type='range' min={1} max={1000} onChange={this.speedChange} value={this.state.DELAY} />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Stage style={{ margin: '0 auto' }} width={SIZE * DIMENSION} height={SIZE * DIMENSION}>
                        <Layer>
                            {this.state.rows.map(function (row, i) {
                                return (row.map(function (col: any, j: any) {
                                            var el = <Square key={"cell" + i + "-" + j} alive={col.alive} onClick={clk} model={col} />;
                                            col.element = el;
                                            return col.element;
                                        })
                                )
                            })}
                        </Layer>
                    </Stage>
                </Row>
            </Container>
        );
    }

    private onClick(e: any, model: any) {
        // This is kinda hacky, but it's much less verbose than trying to 
        // slot in a single new cell model at the right place using immutability helper.
        // Loss of efficiency in state comparisons is limited since this only happens
        // in response to occasional user input.
        model.alive = !model.alive;
        this.setState(this.state);
    }
}