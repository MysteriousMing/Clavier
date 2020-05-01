<template>
  <main class="page-audio">
    <header class="">
    <section id="testAudio" class="flex-row">
      <button class="button mx-auto" @click="playText()">Play Text</button>
      <button v-if="isPlaying" class="button ml-2" @click="stop()">Stop</button>
    </section>
    </header>
    <section>
      period: {{alphaDuration}}, min meters: {{maxMeter}}
    </section>
    <section style="width: 50%; float: left">
      <p>Split Mode</p>
      <span v-for="(item, index) in paraArr" :key="index" style="margin-bottom: 0.5rem; clear: both;">
        <span v-for="(alpha, alphaIndex) in item" :key="index + '_' +alphaIndex" class="word word-span" :class="{'highlight': index == activeLetter.wordIndex && alphaIndex == activeLetter.letterIndex}" :style="{'padding-right': alpha.meters * 200 + 'px'}"><span class="word-letter">{{alpha.letter}}</span><span class="word-meter">{{alpha.metersStr}}</span></span>
      </span>
    </section>
    <van-sticky>
      <section style="width: 50%; float: right">
        InLine Mode
          <div class="word-wrap">
            <span class="word" style="margin-right: 4px" v-for="(item, index) in paraArr" :key="index">
              <span  v-for="(alpha, alphaIndex) in item" :key="index + '_' +alphaIndex" :class="{'highlight': index == activeLetter.wordIndex && alphaIndex == activeLetter.letterIndex}">{{alpha.letter}}</span>
            </span>
          </div>
      </section>
    </van-sticky>
  </main>
</template>

<script>
import Vue from 'vue'
import Tone from 'tone'
import Observe from 'observe'
import { Lyrics, NotesMajor, NotesWholeTone, NotesChromatic, NotesPentatonic, OBEvent } from 'config/'
import SmapleLibrary from '@/lib/Tonejs-Instruments.js'

export default {
  name: 'AudioPlayer',
  props: {
    paraText: String,
    type: String,
  },
  watch: {
    type (to, from) {
      if (to) {
        this.Notes = this.notesReady[to]
        this.playText()
      }
    }
  },
  data() {
    return {
      paraArr: [],
      activeLetter: {
        wordIndex: -1,
        letterIndex: -1
      },
      inputText: '',
      notesReady: {
        'notes_major': NotesMajor,
        'notes_whole_tone': NotesWholeTone,
        'notes_chromatic': NotesChromatic,
        'notes_pentatonic': NotesPentatonic
      },
      Notes: NotesMajor,
      alphaDuration: 2000,
      maxMeter: 16,
      playState: {
        isPlaying: false,
        isPause: false,
        isStop: true
      },
      playingCaches: [],
      isPlaying: false,
      playTiming: undefined
    }
  },
  computed: {
    para() {
      this.paraArr = this.computedText().map(item => this.computedItem(item))
      return this.paraText
    }
  },
  mounted() {
    this.paraArr = this.computedText().map(item => this.computedItem(item))

    var vm = this
    vm.initPiano()
  },
  methods: {
    async initPiano() {
      this.synth = SmapleLibrary.load({
        instruments: "piano"
      }).toMaster()

      // this.synth = new Tone.PolySynth( 10 ).toMaster()

      // 监听乐谱自动播放
      // Observe.$on(OBEvent.AUTO_PLAY_SCORE, (scorename) => {
      //   this.playScoreByName(scorename)
      // })
    },
    formatSyllable (n) {
      if (n > 0) {
        let meterLength = 2 ** n
        if (meterLength > this.maxMeter) {
          meterLength = this.maxMeter
        } 
        return {
          value: 1 / meterLength,
          string: `1 / ${meterLength}`
        }
      } else {
        return {
          value: 1 / 1,
          string: `1 / 1`
        }
      }
    },
    computedText() {
      let input = this.input && this.input != void 0 && this.input != '' ? this.input : this.paraText
      let arr = input.replace(/\n/g, ' ').replace(/\?|!|'|:|,/g, '').split(' ')
      let paraArr = arr.map(element => {
        return element.toString().toLowerCase()
      })
      // console.log(paraArr)
      // console.log(this.paraArr)
      return paraArr
      // 格式化数组
    },
    computedItem(text) {
      let vm = this
      return text.split('').map((item) => {
        let meter = vm.formatSyllable(text.length - 1)
        return {
          letter: item,
          meters: meter.value,
          metersStr: meter.string 
        }
      })
    },
    computedEachNote () {
      let noteArr = []
      let vm = this
      let wIdx = 0
      this.paraArr.forEach((eachWord) => {
        let lIdex = 0
        eachWord.forEach((eachLetter) => {
          let note = vm.getNoteByLetter(eachLetter.letter)
          noteArr.push({
            letter: eachLetter,
            note: note,
            wordIndex: wIdx,
            letterIndex: lIdex
          })
          lIdex++
        })
        wIdx++
      })
      return noteArr
    },
    playText() {
      let vm = this
      this.playingCaches = this.computedEachNote()

      let _cacheWordInedx = 0
      // 初始化播放位置 用 settimeout 总感觉有点不靠谱 可以先这么苟着 需要加一个控制的东西
      let timeoutValue = 500
      this.playingCaches.forEach((each) => {
        if (_cacheWordInedx != each.wordIndex) {
          timeoutValue = timeoutValue + vm.alphaDuration / 2
          _cacheWordInedx = each.wordIndex
        }
        timeoutValue = timeoutValue + vm.alphaDuration * each.letter.meters        
        let set = () => {
          vm.playNote(each.note.name)
          vm.activeLetter.wordIndex = each.wordIndex
          vm.activeLetter.letterIndex = each.letterIndex
        }
        each.playTiming =  setTimeout(set, timeoutValue);
      })
      this.$emit('start')
      timeoutValue = timeoutValue + vm.alphaDuration
      setTimeout(() => {
        vm.activeLetter.wordIndex = -1
        vm.activeLetter.letterIndex = -1
      }, timeoutValue);
    },
    getNoteByLetter(key = 'C4') {
      let filternotes = this.Notes.filter((note) => {
        return note.key == key
      })
      if (filternotes.length > 0) {
        return filternotes[0]
      } else {
        return undefined
      }
    },
    playNote(notename = 'C4', duration = '1n') {
      if (!this.synth) return
      // console.log(notename)
      this.isPlaying = true
      this.synth.triggerAttackRelease(notename, duration);
    },
    stop() {
      this.playingCaches.forEach((each) => {
        clearTimeout(each.playTiming)
      })
      this.isPlaying = false
      this.$emit('stop')
    }
  },
}
</script>

<style lang="less">
@pblue: #1296db;
@textdark: #2c3e50;
.page-audio { 
  width: 100%; min-width: 1080px; min-height: 100%; padding: 1px; padding-bottom: 150px; font-family: 'Avenir', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: @textdark; font-weight: bold;
  header, section {
    padding: 16px;
  }
  header {
    font-size: 20px;
  }
  .flex-row {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
  }
  .word-wrap {
    display: flex;

    flex-flow: row wrap;
    align-items: baseline;
  }
  .word {
    color: #4c4c4c;
    line-height: 1.5;
    span {
      line-height: 1.5;
    }
    .highlight {
      color: rgb(252, 180, 86);
      font-weight: bolder;
    }

    &.word-span {
      background: rgb(86, 163, 252);
      color: white;
      border-radius: 10px;
      padding: 0px 10px;
      margin:4px;

      float: left;
      &.highlight {
        background: rgb(252, 180, 86);
      }
      .word-meter {
        font-size: 0.4em;
        margin-left: 5px;
      }
    }
  }
  .button {
    padding: 10px 16px;
    border-radius: 12px;
    margin: 10px 10px;

    &:focus {
      outline: 12px;
    }
  }
}
</style>