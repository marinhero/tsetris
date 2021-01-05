import * as _ from 'lodash'
import './style.css'

class Board {
  public b: Cell[][] = []
  public canvas = <HTMLCanvasElement>document.getElementById('board')
  public context: CanvasRenderingContext2D = this.canvas.getContext('2d')

  constructor(public name: string, public columns: number, public rows: number) {
    // x = COLUMNS
    // y = ROWS

    let y: number = 0

    while (y < rows) {
      let x: number = 0
      this.b.push([])
      while(x < columns) {
        this.b[y].push(new Cell(false, this.context, x, y))
        x++
      }
      y++
    }
  }

  getContext() : CanvasRenderingContext2D {
    return this.context
  }

  draw() {
    let y: number = 0
    while (y < this.rows) {
      let x: number = 0
      while (x < this.columns) {
        this.drawCell(x, y)
        x++
      }
      y++
    }
  }

  drawCell(posX: number, posY: number) {
    let c: Cell = this.b[posY][posX]

    this.context.fillStyle = c.status()
    this.context.fillRect(
      posX * Cell.CELL_WIDTH,
      posY * Cell.CELL_HEIGHT,
      Cell.CELL_WIDTH,
      Cell.CELL_HEIGHT
    )
    this.context.strokeStyle = Cell.CELL_BORDER_COLOR
    this.context.strokeRect(
      posX * Cell.CELL_WIDTH,
      posY * Cell.CELL_HEIGHT,
      Cell.CELL_WIDTH,
      Cell.CELL_HEIGHT
    )
  }
}

class Cell {
  static CELL_WIDTH: number = 20
  static CELL_HEIGHT: number = 20
  static CELL_BORDER_COLOR: string = 'black'

  private ON_COLOR: string = 'blue'
  private OFF_COLOR: string = 'red'

  constructor(
    public state: boolean,
    public context: CanvasRenderingContext2D,
    public posX: number,
    public posY: number) {
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
}

class Piece {
  public rotations: Cell[][][]
  public shape: Cell[][]
  public currentRotationIndex: number
  public currentRotation: Cell[][]
  public posX: number = 3
  public posY: number = 0 // So it starts hidden and out of the board
  public rows: number
  public columns: number

  constructor(public board: Board) {
    this.currentRotationIndex = 0
  }

  generateRotations(): Cell[][][] {
    let rots: Cell[][][] = []
    let nextBase: Cell[][]

    for (let rotationCounter = 0; rotationCounter < 4; rotationCounter++) {
      rots[rotationCounter] = (new BlankPiece(this.rows, this.columns, this.board.getContext(), this.board)).shape
      let destY = this.columns - 1
      for (let i = 0; i < this.columns; i++) {
        let destX = 0
        for (let j = 0; j < this.rows; j++) {
          if (!nextBase) {
            rots[rotationCounter][destY][destX] = this.shape[j][i]
          } else {
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

  draw() {
    let yOffset: number = this.posY
    let xOffset: number = this.posX
    let context: CanvasRenderingContext2D = this.board.getContext()

    let y: number = 0
    while (y < this.rows) {
      let x: number = 0
      while (x < this.columns) {
        context.fillStyle = this.currentRotation[x][y].status()
        context.fillRect(
          (xOffset + x) * Cell.CELL_WIDTH,
          (yOffset + y) * Cell.CELL_HEIGHT,
          Cell.CELL_WIDTH,
          Cell.CELL_HEIGHT
        )
        context.strokeStyle = Cell.CELL_BORDER_COLOR
        context.strokeRect(
          (xOffset + x) * Cell.CELL_WIDTH,
          (yOffset + y) * Cell.CELL_HEIGHT,
          Cell.CELL_WIDTH,
          Cell.CELL_HEIGHT
        )
        x++
      }
      y++
    }
  }

  undraw() {
    let yOffset: number = this.posY
    let xOffset: number = this.posX
    let context: CanvasRenderingContext2D = this.board.getContext()

    let y: number = 0
    while (y < this.rows) {
      let x: number = 0
      while (x < this.columns) {
        context.fillStyle = 'red'
        context.fillRect(
          (xOffset + x) * Cell.CELL_WIDTH,
          (yOffset + y) * Cell.CELL_HEIGHT,
          Cell.CELL_WIDTH,
          Cell.CELL_HEIGHT
        )
        context.strokeStyle = Cell.CELL_BORDER_COLOR
        context.strokeRect(
          (xOffset + x) * Cell.CELL_WIDTH,
          (yOffset + y) * Cell.CELL_HEIGHT,
          Cell.CELL_WIDTH,
          Cell.CELL_HEIGHT
        )
        x++
      }
      y++
    }
  }

  rotate() {
    let nextIndex: number = (this.currentRotationIndex + 1) % this.rotations.length

    if (!this.colllision(this.posX, this.posY, this.rotations[nextIndex])) {
      this.currentRotationIndex = nextIndex
      this.currentRotation = this.rotations[this.currentRotationIndex]
    }
  }

  colllision(newX: number, newY: number, rotation: Cell[][]): boolean {
    for (let y: number = 0; y < this.rows; y++) {
      for (let x: number = 0; x < this.columns; x++) {
        let currentCell = rotation[x][y]
        let emptyCell: boolean = currentCell.status() == 'red'

        if (emptyCell) { continue }

        let leftOverflow: boolean = newX + x < 0
        let bottomOverflow: boolean = newY + y > this.board.rows - 1
        let rightOverflow: boolean = newX + x > this.board.columns - 1
        if (rightOverflow || leftOverflow || bottomOverflow) { return true }
      }
    }
    return false
  }

  down() {
    if (!this.colllision(this.posX, this.posY + 1, this.currentRotation)) {
      this.posY++
    }
  }

  left() {
    if (!this.colllision(this.posX - 1, this.posY, this.currentRotation)) {
      this.posX--
    }
  }

  right() {
    if (!this.colllision(this.posX + 1, this.posY, this.currentRotation)) {
      this.posX++
    }
  }

  bottom() {
    return this.colllision(this.posX, this.posY + 1, this.currentRotation)
  }
}

class BlankPiece extends Piece {
  public shape: Cell[][]
  public rotations: Cell[][][]

  constructor(
    public width: number,
    public height: number,
    public context: CanvasRenderingContext2D,
    public board: Board
  ) {
    super(board)
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

class zPiece extends Piece {
  public rotations: Cell[][][]
  public shape: Cell[][]
  public currentRotationIndex: number
  public currentRotation: Cell[][]

  constructor(public board: Board) {
    super(board)
    this.rows = 3
    this.columns = 3
    this.shape = [
      [new Cell(true, board.getContext(), 0, 0), new Cell(true, board.getContext(), 1, 0), new Cell(false, board.getContext(), 2, 0)],
      [new Cell(false, board.getContext(), 1, 0), new Cell(true, board.getContext(), 1, 1), new Cell(true, board.getContext(), 2, 1)],
      [new Cell(false, board.getContext(), 2, 0), new Cell(false, board.getContext(), 2, 1), new Cell(false, board.getContext(), 2, 2)]
    ]
    this.rotations = super.generateRotations()
    this.currentRotation = this.rotations[this.currentRotationIndex]
  }
}

let t = new Board('Marles', 10, 20)
t.draw()

var z = new zPiece(t)
z.draw()
let activePiece: Piece = z

document.addEventListener('keydown', (event) => {
  switch(event.key) {
    case 'ArrowUp':
      activePiece.undraw()
      activePiece.rotate()
      activePiece.draw()
      break
    case 'ArrowDown':
      activePiece.undraw()
      activePiece.down()
      activePiece.draw()
      if (activePiece.bottom()) {
        console.log('LOCK')
        activePiece = new zPiece(t)
        activePiece.draw()
      }
      break
    case 'ArrowLeft':
      activePiece.undraw()
      activePiece.left()
      activePiece.draw()
      break
    case 'ArrowRight':
      activePiece.undraw()
      activePiece.right()
      activePiece.draw()
      break
    default:
     return
  }
})

// for(let i = 1; i <= 500; i++) {
//   setTimeout((i) => {
//     z.undraw()
//     z.down()
//     z.draw()
//   }, 1000 * i)
// }