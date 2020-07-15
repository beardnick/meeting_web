<template>
  <div>
    <el-row>
      <video width="80%" poster="@/assets/imgs/default.jpg"></video>
    </el-row>
    <el-row>
      <el-button type="primary" @click="start">开始</el-button>
    </el-row>
  </div>
</template>

<script>
function startScreenCapture() {
  if (navigator.getDisplayMedia) {
    return navigator.getDisplayMedia({ video: true });
  } else if (navigator.mediaDevices.getDisplayMedia) {
    return navigator.mediaDevices.getDisplayMedia({ video: true });
  } else {
    return navigator.mediaDevices.getUserMedia({
      video: { mediaSource: "screen" }
    });
  }
}

export default {
  methods: {
    start() {
      this.queue = [];
      // check that browser has support for media codec
      this.mimecodec = 'video/webm;codecs="vp9"';
      console.log("supported:", MediaSource.isTypeSupported(this.mimecodec));

      // create media source
      this.mediaSource = new MediaSource();

      // get video element
      this.video = document.querySelector("video");
      this.close = true;

      startScreenCapture()
        .then(stream => {
          console.log("stream:", stream);
          this.stream = stream;
          this.stream.addEventListener("inactive", e => {
            console.log("Capture stream inactive - stop recording!");
            this.stopShare(e);
          });
          this.close = false;
          var mediaRecorder = new MediaRecorder(stream, {
              //video/webm;codecs=vp9,opus
            mimeType: 'video/webm;codecs="vp9"'
          });
          this.socket = new WebSocket("ws://localhost:9020/video/ws");
          this.socket.addEventListener("open", event => {
            console.log("websocket connected");
          });
          this.socket.addEventListener("message", event => {
            event.data.arrayBuffer().then(buffer => {
              this.queue.push(buffer);
            });
          });
          mediaRecorder.addEventListener("dataavailable", event => {
            if (event.data == null || event.data.size <= 10) {
              return;
            }
            this.socket.send(event.data);
          });
            // 500以下会造成no supported source was found
          mediaRecorder.start(500);
          let mediaSource = this.mediaSource;
          let video = this.video;
          let sourceOpen = this.sourceOpen;
          let sourceClose = this.sourceClose;
          video.src = URL.createObjectURL(mediaSource);
          console.log("mediasource:", mediaSource);
          // Wait for media source to be open
          mediaSource.addEventListener("sourceopen", sourceOpen);
          mediaSource.addEventListener("sourceclose", sourceClose);
        })
        .catch(err => {
          console.log("err:", err);
          console.log("you cancled");
        });
    },
    sourceOpen() {
      console.log("state:", this.mediaSource.readyState);
      if (this.mediaSource.readyState == "closed") {
        return;
      }
      var mimecodec = this.mimecodec;
      var source = this.mediaSource;
      this.sourceBuffer = source.addSourceBuffer(mimecodec);
      this.sourceBuffer.addEventListener("updateend", this.nextChunk);
      var nextChunk = this.nextChunk;
      var video = this.video;
      nextChunk();
      video.play();
    },
    sourceClose(event) {
      console.log("close event:", event);
      this.close = true;
    },
    nextChunk() {
      if (this.close) {
        return;
      }
      let sourceBuffer = this.sourceBuffer;
      let queue = this.queue;
      setTimeout(() => {
        console.log("next chunk before:", queue[0]);
        if (!this.queue || !this.queue[0]) {
          this.nextChunk();
          return;
        }
        console.log("next chunk after:", queue[0]);
        sourceBuffer.appendBuffer(this.queue[0]);
        queue.shift();
      }, 10);
    },
    stopShare(e) {
      this.sharing = false;
      if (this.stream == null) {
        console.log("screen share already stoped");
        return;
      }
      /*this.mediaRecorder.stop();*/
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.video.srcObject = null;
      this.close = true;
      this.$message({
        message: "屏幕分享已停止",
        type: "success"
      });
    }
  }
};
</script>

<style>
</style>
