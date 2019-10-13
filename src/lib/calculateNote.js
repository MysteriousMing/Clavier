var Note = {
  name: '',
  noteNumerator: 1,
  noteDenominator: 4,
  twoPower: 2,
  getName: function (params) {
      return `${this.noteNumerator} / ${this.noteDenominator}`
  },
  getNoteDenominator: function (params) {
    return Math.pow(2, this.twoPower)
  }
}

export default Note