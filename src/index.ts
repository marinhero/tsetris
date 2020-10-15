import * as _ from 'lodash'
import './style.css'

class Board {
  private b: Cell[][] = []

  constructor(public name: string, public width: number, public height: number) {
    let x: number = 0

    while (x < width) {
      let y: number = 0
      this.b.push([])
      while(y < height) {
        this.b[x].push(new Cell(x, y, false))
        y++
      }
      x++
    }
    console.log(`TSetris: ${name} board initialized`)
  }

  enable(x: number, y: number) {
    this.b[x][y].state = true;
  }

  draw() {
    console.log('Drawing');
    let _b: any = document.getElementById('board')
    let x: number = 0
    while (x < this.width) {
      let y: number = 0
      while (y < this.height) {
        let div = document.createElement('div')
        div.id = `${x},${y}`
        div.className = 'cell'
        div.style.width = `${Cell.CELL_WIDTH}px`
        div.style.height = `${Cell.CELL_HEIGHT}px`
        div.style.display = 'inline-block'
        div.style.border = '1px solid #fff'
        div.style.padding = '0 !important'
        div.style.margin = '0 !important'
        div.style.background = this.b[x][y].status()
        _b.appendChild(div)
        y++
      }
      x++
    }
  }
}

class Cell {
  static CELL_WIDTH: number = 20
  static CELL_HEIGHT: number = 20

  private ON_COLOR: string = 'blue'
  private OFF_COLOR: string = 'red'

  constructor(public x: number, public y: number, public state: boolean) {
    console.log('Building a cell')
  }

  status() {
    console.log(this.state);
    return this.state ? this.ON_COLOR : this.OFF_COLOR
  }
}

let t = new Board('Marles', 2, 20)
t.draw()

// The board prints vertically that's why the coordinate numbers are funky!