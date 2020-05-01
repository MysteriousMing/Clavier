<template>
  <div class="page-home">
    <div class="app-bg"></div>

    <Piano @changeNote="changeAudioType"></Piano>

    <section class="page-section-wrap">
      <textarea class="input-textarea" v-model="textStore" placeholder="input your text here!"></textarea>
    </section>
    <p class="input-tips">Word 'Clavier' extracted from Well-tempered Claviar by Bach. Not only the keyboard ⌨️ but the key board 🎹 Type something here, and listen the music for your words.</p>
    <section>
       <AudioPlayer :para-text="textStore" :type="audioType"></AudioPlayer>
    </section>
    <PageFooter></PageFooter>
  </div>
</template>

<script>
import Vue from 'vue'
import Piano from '@/components/Piano'
import PageFooter from '@/components/Footer'
import EasyScore from '@/components/EasyScore'
import DemoScore from '@/components/DemoScore'
import AudioPlayer from '@/pages/audio/audio'

import { DemoText } from 'config/' //  DemoText.para

export default {
  name: 'Home',
  data() {
    return {
      percent: 0,
      textStore: DemoText.para,
      audioType: 'notes_major'
    }
  },
  mounted() {
    /*强制横屏*/
    function horizontalScreen(className){
        // transform 强制横屏
        var conW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var conH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        // transform: rotate(90deg); width: 667px; height: 375px;transform-origin:28% 50%;
        //var iosTopHe = 0;//若有其他样式判断，写于此
        if (conW > conH) {
          $(className).css({
            "transform":"rotate(0deg)",
            "width":"100%",
            "height":"100%"
          })
          return;
        }
        $(className).css({
            "transform":"rotate(90deg) translate("+((conH-conW)/2)+"px,"+((conH-conW)/2)+"px)",
            "width":conH+"px",
            "height":conW+"px",
            //"margin-top":iosTopHe+"px",
            // "border-left":iosTopHe+"px solid #000",
            "transform-origin":"center center",
            "-webkit-transform-origin": "center center"
        });
    }
    var vm = this
    window.onorientationchange = () => {
      horizontalScreen('body')
      // console.log('orientation change');
    }
    var ua = window.navigator.userAgent
    if (ua.match(/mobile/i)) {
      horizontalScreen('body')
      alert('为了您更好的浏览体验，请在电脑端浏览器打开本网站。')
    }

    this.handleAutoPianoload(100)
  },
  methods: {
    changeAudioType(type) {
      console.log(type)
      this.audioType = type
    },
    handleAutoPianoload(data) {
      var vm = this;
      vm.percent = data;
      if (data >= 100) {
        setTimeout(()=> {
          $('.loader-page').fadeOut()
          $('#preloadAudio').remove()
        }, 700)
      }
    },
    autoPlayTry () {
      this.$router.push({ name: 'Audio'})
    }
  },
  components: {
    Piano,
    PageFooter,
    EasyScore,
    DemoScore,
    AudioPlayer
  }
}
</script>

<style lang="less">

@pblue: #1296db;
@textdark: #2c3e50;

.page-home { width: 100%; min-width: 1080px; min-height: 100%; padding: 1px; padding-bottom: 150px; font-family: 'Avenir', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: @textdark;  position: absolute; top: 0; left: 0;
  .app-bg { width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: -100; opacity: 0.5;}
  .page-section-wrap { width: 100%; padding: 0px; display: flex; align-items: center; justify-content: space-around; }
  .page-section-wrap button {
    margin: 12px 6px 4px;
    padding: 10px 16px;
    border-radius: 12px;
  }
 .input-tips {
   margin-top: 30px;
  
    text-align: center;
    color: #999999;
    font-size: 12px;
  }
  .input-textarea {
    width: 87%;
    margin: auto;
    height: 200px;
    color: @textdark;
    border: none;
    border-radius: 4px;
    box-shadow: 0 0 10px 0 #33333360;
    padding: 10px;
    &:focus {
      outline: none;
      box-shadow: 0 0 20px 0 #78888960;
    }
  }
}
</style>
