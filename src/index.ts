import * as _ from 'lodash'
import './style.css'

class Board {
  public b: Cell[][] = []

  constructor(public name: string, public width: number, public height: number) {
    let y: number = 0

    while (y < height) {
      let x: number = 0
      this.b.push([])
      while(x < width) {
        this.b[y].push(new Cell(false))
        x++
      }
      y++
    }
    console.log(`TSetris: ${name} board initialized`)
  }

  enable(y: number, x: number) {
    this.b[y][x].enable()
  }

  draw() {
    console.log('Drawing');
    let _b: any = document.getElementById('board')
    _b.innerHTML = null
    let y: number = 0
    while (y < this.height) {
      let x: number = 0
      while (x < this.width) {
        let div = document.createElement('div')
        div.id = `${x},${y}`
        div.className = 'cell'
        div.style.width = `${Cell.CELL_WIDTH}px`
        div.style.height = `${Cell.CELL_HEIGHT}px`
        div.style.display = 'inline-block'
        div.style.border = '1px solid #fff'
        div.style.padding = '0 !important'
        div.style.margin = '0 !important'
        div.style.background = this.b[y][x].status()
        _b.appendChild(div)
        x++
      }
      y++
    }
  }

  play(piece: Piece) {
    let ipx: number = 4
    let ipy: number = 0

    for (let y = 0; y < piece.height; y++) {
      for (let x = 0; x < piece.width; x++) {
        console.log(`Positioning ${y},${x}`)
        this.b[y][ipx++] = piece.rotations[0][y][x]
      }
      ipx = 4
      ipy = y
    }
  }
}

class Cell {
  static CELL_WIDTH: number = 20
  static CELL_HEIGHT: number = 20

  private ON_COLOR: string = 'blue'
  private OFF_COLOR: string = 'red'

  constructor(public state: boolean) {
    console.log('Building a cell')
  }

  enable() {
    this.state = true
  }

  disable() {
    this.state = false
  }

  status() {
    console.log(this.state);
    return this.state ? this.ON_COLOR : this.OFF_COLOR
  }
}

interface Piece {
  shape: Cell[][],
  rotations: Cell[][][],
  width: number,
  height: number
}

function generateRotations(width: number, height: number, piece: Piece) : Cell[][][] {
  let rots: Cell[][][] = []
  let nextBase: Cell[][]

  for (let rotationCounter = 0; rotationCounter < 4; rotationCounter++) {
    rots[rotationCounter] = (new BlankPiece(piece.width, piece.height)).shape
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

  constructor(public width: number, public height: number) {
    this.shape = []
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (this.shape[i]) {
          this.shape[i].push(new Cell(false))
        } else {
          this.shape[i] = [new Cell(false)]
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

  constructor() {
    this.width = 3
    this.height = 3
    this.shape = [
      [new Cell(true), new Cell(true), new Cell(false)],
      [new Cell(false), new Cell(true), new Cell(true)],
      [new Cell(false), new Cell(false), new Cell(false)]
    ]
    this.rotations = generateRotations(3, 3, this)
    console.log(this.rotations)
  }
}

let t = new Board('Marles',10, 20)
t.draw()
let z = new zPiece()
t.play(z)
t.draw()