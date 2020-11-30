import * as _ from 'lodash'
import './style.css'

class Board {
  public b: Cell[][] = []
  public canvas = <HTMLCanvasElement>document.getElementById('board') // Understand this better
  public context: CanvasRenderingContext2D = this.canvas.getContext('2d')

  constructor(public name: string, public colums: number, public rows: number) {
    // x = COLUMNS
    // y = ROWS

    let y: number = 0

    while (y < rows) {
      let x: number = 0
      this.b.push([])
      while(x < colums) {
        this.b[y].push(new Cell(false, this.context, x, y))
        x++
      }
      y++
    }
    console.log(`TSetris: ${name} board initialized`)
  }

  getContext() : CanvasRenderingContext2D {
    return this.context
  }

  draw() {
    console.log('Drawing');

    let y: number = 0
    while (y < this.rows) {
      let x: number = 0
      while (x < this.colums) {
        this.b[y][x].drawCell()
        x++
      }
      y++
    }
  }
}

class Cell {
  static CELL_WIDTH: number = 20
  static CELL_HEIGHT: number = 20

  private ON_COLOR: string = 'blue'
  private OFF_COLOR: string = 'red'
  private CELL_BORDER_COLOR: string = 'black'

  constructor(
    public state: boolean,
    public context: CanvasRenderingContext2D,
    public posX: number,
    public posY: number) {
    console.log('Building a cell')
  }

  enable() {
    this.state = true
  }

  disable() {
    this.state = false
  }

  status() {
    return this.state ? this.ON_COLOR : this.OFF_COLOR
  }

  drawCell() {
    this.context.fillStyle = this.status();
    this.context.fillRect(
      this.posX * Cell.CELL_WIDTH,
      this.posY * Cell.CELL_HEIGHT,
      Cell.CELL_WIDTH,
      Cell.CELL_HEIGHT
    )
    this.context.strokeStyle = this.CELL_BORDER_COLOR
    this.context.strokeRect(
      this.posX * Cell.CELL_WIDTH,
      this.posY * Cell.CELL_HEIGHT,
      Cell.CELL_WIDTH,
      Cell.CELL_HEIGHT
    )
  }
}

interface Piece {
  shape: Cell[][],
  rotations: Cell[][][],
  width: number,
  height: number
}

function generateRotations(
  width: number,
  height: number,
  piece: Piece,
  context: CanvasRenderingContext2D
  ) : Cell[][][] {
  let rots: Cell[][][] = []
  let nextBase: Cell[][]

  for (let rotationCounter = 0; rotationCounter < 4; rotationCounter++) {
    rots[rotationCounter] = (new BlankPiece(piece.width, piece.height, context)).shape
    let destY = height - 1
    for (let i = 0; i < height; i++) {
      let destX = 0
      for (let j = 0; j < width; j++) {
        if (!nextBase) {
          rots[rotationCounter][destY][destX] = piece.shape[j][i]
        } else  {
          rots[rotationCounter][destY][destX] = nextBase[j][i]
        }
        destX++
      }
      destY--
    }
    nextBase = rots[rotationCounter]
  }
  return rots
}

class BlankPiece implements Piece {
  public shape: Cell[][]
  public rotations: Cell[][][]

  constructor(public width: number, public height: number, public context: CanvasRenderingContext2D) {
    this.shape = []
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (this.shape[i]) {
          this.shape[i].push(new Cell(false, context, 0, 0))
        } else {
          this.shape[i] = [new Cell(false, context, 0, 0)]
        }
      }
    }
  }
}

class zPiece implements Piece {
  public width: number
  public height: number
  public rotations: Cell[][][]
  public shape: Cell[][]

  constructor(public board: Board) {
    this.width = 3
    this.height = 3
    this.shape = [
      [new Cell(true, board.getContext(), 0, 0), new Cell(true, board.getContext(), 1, 0), new Cell(false, board.getContext(), 2, 0)],
      [new Cell(false, board.getContext(), 1, 0), new Cell(true, board.getContext(), 1, 1), new Cell(true, board.getContext(), 2, 1)],
      [new Cell(false, board.getContext(), 2, 0), new Cell(false, board.getContext(), 2, 1), new Cell(false, board.getContext(), 2, 2)]
    ]
    this.rotations = generateRotations(3, 3, this, board.getContext())
    console.log(this.rotations)
  }
}

let t = new Board('Marles', 10, 20)
t.draw()
let z = new zPiece(t)