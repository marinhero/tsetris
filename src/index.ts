import * as _ from 'lodash'
import './style.css'

class Board {
  public _b: any = document.getElementById('board')

  constructor(public name: string, public width: number, public height: number) {
    let x: number = 0
    let b: Cell[] = []

    if (!this._b) { console.error('Unable to initialize TSetris, "board" div required') }

    while (x < width) {
      let y: number = 0
      while(y < height) {
        b.push(new Cell(x, y, false))
        y++
      }
      x++
    }
    console.log(`TSetris: ${name} board initialized`)
  }

  draw() {
    let x: number = 0
    while (x < this.width) {
      let y: number = 0
      while (y < this.height) {
        let div = document.createElement('div')
        div.style.width = "20px"
        div.style.height = "20px"
        div.style.background = 'red'
        console.log(div);
        this._b.appendChild(div)
        y++
      }
      x++
    }
  }
}

class Cell {
  static CELL_WIDTH: number = 20
  static CELL_HEIGHT: number = 20

  constructor(public x: number, public y: number, public state: boolean) {
    console.log('Building a cell')
  }
}

let t = new Board('Marles', 10, 20)
t.draw()
