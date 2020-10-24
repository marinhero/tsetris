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
        this.b[y].push(new Cell(y, x, false))
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
}

class Cell {
  static CELL_WIDTH: number = 20
  static CELL_HEIGHT: number = 20

  private ON_COLOR: string = 'blue'
  private OFF_COLOR: string = 'red'

  constructor(public y: number, public x: number, public state: boolean) {
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

let t = new Board('Marles',10, 20)
t.draw()
t.enable(8, 5)
t.draw()
