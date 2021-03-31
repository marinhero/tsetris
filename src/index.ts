import * as _ from 'lodash'
import './style.css'

class Board {
  public b: Cell[][] = []
  public canvas = <HTMLCanvasElement>document.getElementById('board')
  public context: CanvasRenderingContext2D = this.canvas.getContext('2d')
  public score: number = 0

  constructor(public columns: number, public rows: number) {
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
        let c: Cell = this.b[y][x]
        let color: string = c.state ? c.onColor : Cell.OFF_COLOR
        c.draw(x, y, color)
        x++
      }
      y++
    }
  }

  copyFrom(ref: number) {
    for (; ref >= 1; ref--) {
      for(let x: number = 0; x < this.columns; x++) {
        this.b[ref][x] = this.b[ref - 1][x]
      }
    }
    for (let x: number = 0; x < this.columns; x++) {
      this.b[0][x] = new Cell(false, this.context, x, 0)
    }
  }

  updateScore() {
    this.score = this.score + 10
    let scoreboard: HTMLElement = document.getElementById('metric')
    scoreboard.innerHTML = this.score.toString()
  }

  checkLines() {
    for (let y: number = 0; y < this.rows; y++) {
      let tetris: boolean = true
      for (let x: number = 0; x < this.columns; x++) {
       tetris = tetris && this.b[y][x].state
      }
      if (tetris) {
        this.copyFrom(y)
        this.updateScore()
      }
    }
  }
}

class Cell {
  static CELL_WIDTH: number = 20
  static CELL_HEIGHT: number = 20
  static CELL_BORDER_COLOR: string = 'black'
  static OFF_COLOR: string = 'white'
  static ON_COLOR: string = 'blue'

  constructor(
    public state: boolean,
    public context: CanvasRenderingContext2D,
    public posX: number,
    public posY: number,
    public onColor: string = Cell.ON_COLOR) {
  }

  enable() {
    this.state = true
  }

  disable() {
    this.state = false
  }

  draw(x: number = this.posX, y: number = this.posY, color: string = this.onColor) {
    this.context.fillStyle = color
    this.context.fillRect(
      x * Cell.CELL_WIDTH,
      y * Cell.CELL_HEIGHT,
      Cell.CELL_WIDTH,
      Cell.CELL_HEIGHT
    )
    this.context.strokeStyle = Cell.CELL_BORDER_COLOR
    this.context.strokeRect(
      x * Cell.CELL_WIDTH,
      y * Cell.CELL_HEIGHT,
      Cell.CELL_WIDTH,
      Cell.CELL_HEIGHT
    )
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
  public onColor: string

  static randomPiece(board: Board): Piece {
    let pieces = [IPiece, ZPiece, LPiece, OPiece, TPiece]
    let piece = _.sample(pieces)

    return new piece(board)
  }

  constructor(public board: Board) {
    this.currentRotationIndex = 0
  }

  generateRotations(): Cell[][][] {
    let rots: Cell[][][] = []
    let nextBase: Cell[][]

    for (let rotationCounter = 0; rotationCounter < 4; rotationCounter++) {
      rots[rotationCounter] = new BlankPiece(this.rows, this.columns).shape
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
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        if (this.currentRotation[x][y].state) {
          let c: Cell = this.board.b[this.posY + y][this.posX + x]
          c.enable()
          c.draw(this.posX + x, this.posY + y, this.onColor)
        }
      }
    }
  }

  undraw() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        if (this.currentRotation[x][y].state) {
          let c: Cell = this.board.b[this.posY + y][this.posX + x]
          c.disable()
          c.draw(this.posX + x, this.posY + y, Cell.OFF_COLOR)
        }
      }
    }
  }

  rotate() {
    let nextIndex: number = (this.currentRotationIndex + 1) % this.rotations.length

    if (!this.collision(this.posX, this.posY, this.rotations[nextIndex])) {
      this.currentRotationIndex = nextIndex
      this.currentRotation = this.rotations[this.currentRotationIndex]
    }
  }

  collision(currentX: number, currentY: number, rotation: Cell[][]): boolean {
    for (let y: number = 0; y < this.rows; y++) {
      for (let x: number = 0; x < this.columns; x++) {
        let currentCell = rotation[x][y]
        let emptyCell: boolean = currentCell.state == false

        if (emptyCell) { continue }

        let leftOverflow: boolean = currentX + x < 0
        let bottomOverflow: boolean = currentY + y > this.board.rows - 1
        let rightOverflow: boolean = currentX + x > this.board.columns - 1

        if (rightOverflow || leftOverflow || bottomOverflow) { return true }

        let positionXOfCelInBoard: number = currentX + x
        let positionYOfCelInBoard: number = currentY + y

        if (this.board.b[positionYOfCelInBoard][positionXOfCelInBoard].state) { return true }
      }
    }
  }

  down(): boolean {
    if (this.collision(this.posX, this.posY + 1, this.currentRotation) && this.posY == 0) {
      clearInterval(Game.interval);
      if (confirm('Game over! Try again?')) {
        window.location.reload()
      }
    }

    if (!this.collision(this.posX, this.posY + 1, this.currentRotation)) {
      this.posY++
    } else {
      return true
    }
    return false
  }

  left() {
    if (!this.collision(this.posX - 1, this.posY, this.currentRotation)) {
      this.posX--
    }
  }

  right() {
    if (!this.collision(this.posX + 1, this.posY, this.currentRotation)) {
      this.posX++
    }
  }

  lock() {
    for (let y:number = 0; y < this.rows; y++) {
      for (let x: number = 0; x < this.columns; x++) {
        if (this.currentRotation[x][y].state) {
          let c: Cell = this.board.b[this.posY + y][this.posX + x]
          c.state = true
          c.onColor = this.currentRotation[x][y].onColor
        }
      }
    }
    this.board.checkLines()
    this.board.draw()
  }

  shapeGenerator(bShape: boolean[][]): Cell[][] {
    let shape: Cell[][] = []
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        if (_.isEmpty(shape[y])) { shape[y] = [] }
        shape[y][x] = new Cell(bShape[y][x], this.board.getContext(), x, y, this.onColor)
      }
    }
    return shape
  }
}

class BlankPiece extends Piece {
  public shape: Cell[][]
  public rotations: Cell[][][]

  constructor(
    public width: number,
    public height: number
  ) {
    super(<Board> null)
    this.shape = []
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (_.isEmpty(this.shape[i])) { this.shape[i] = [] }
        this.shape[i].push(new Cell(false, <CanvasRenderingContext2D> null, 0, 0))
      }
    }
  }
}

class ZPiece extends Piece {
  public rotations: Cell[][][]
  public shape: Cell[][]
  public currentRotationIndex: number
  public currentRotation: Cell[][]
  public onColor: string = 'green'

  constructor(public board: Board) {
    super(board)
    this.rows = 3
    this.columns = 3
    //  Must set shapes before handling rotations
    this.shape =
      this.shapeGenerator(
        [
          [true, true, false],
          [false, true, true],
          [false, false, false]
        ]
      )
    this.rotations = super.generateRotations()
    this.currentRotation = this.rotations[this.currentRotationIndex]
  }
}

class IPiece extends Piece {
  public rotations: Cell[][][]
  public shape: Cell[][]
  public currentRotationIndex: number
  public currentRotation: Cell[][]
  public onColor: string = 'brown'

  constructor(public board: Board) {
    super(board)
    this.rows = 4
    this.columns = 4
    this.shape =
      this.shapeGenerator(
        [
          [false, true, false, false],
          [false, true, false, false],
          [false, true, false, false],
          [false, true, false, false],
        ]
      )
    this.rotations = super.generateRotations()
    this.currentRotation = this.rotations[this.currentRotationIndex]
  }
}

class LPiece extends Piece {
  public rotations: Cell[][][]
  public shape: Cell[][]
  public currentRotationIndex: number
  public currentRotation: Cell[][]
  public onColor: string = 'pink'

  constructor(public board: Board) {
    super(board)
    this.rows = 3
    this.columns = 3
    this.shape =
      this.shapeGenerator(
        [
          [false, true, false],
          [false, true, false],
          [false, true, true],
        ]
      )
    this.rotations = super.generateRotations()
    this.currentRotation = this.rotations[this.currentRotationIndex]
  }
}

class OPiece extends Piece {
  public rotations: Cell[][][]
  public shape: Cell[][]
  public currentRotationIndex: number
  public currentRotation: Cell[][]
  public onColor: string = 'orange'

  constructor(public board: Board) {
    super(board)
    this.rows = 2
    this.columns = 2
    this.shape =
      this.shapeGenerator(
        [
          [true, true],
          [true, true],
        ]
      )
    this.rotations = super.generateRotations()
    this.currentRotation = this.rotations[this.currentRotationIndex]
  }
}

class TPiece extends Piece {
  public rotations: Cell[][][]
  public shape: Cell[][]
  public currentRotationIndex: number
  public currentRotation: Cell[][]
  public onColor: string = 'purple'

  constructor(public board: Board) {
    super(board)
    this.rows = 3
    this.columns = 3
    this.shape =
      this.shapeGenerator(
        [
          [true, true, true],
          [false, true, false],
          [false, false, false],
        ]
      )
    this.rotations = super.generateRotations()
    this.currentRotation = this.rotations[this.currentRotationIndex]
  }
}

class Game {
  static interval = setInterval(() => {
    activePiece.undraw()
    if (activePiece.down()) {
      activePiece.lock()
      activePiece = Piece.randomPiece(t)
    }
    activePiece.draw()
  }, 500)
}

let t = new Board(10, 20)
t.draw()

var p = Piece.randomPiece(t)
p.draw()
let activePiece: Piece = p

document.addEventListener('keydown', (event) => {
  switch(event.key) {
    case 'ArrowUp':
      activePiece.undraw()
      activePiece.rotate()
      activePiece.draw()
      break
    case 'ArrowDown':
      activePiece.undraw()
      if (activePiece.down()) {
        activePiece.lock()
        activePiece = Piece.randomPiece(t)
      }
      activePiece.draw()
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
