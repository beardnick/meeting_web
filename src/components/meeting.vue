<template>
  <div>
    <el-row>
      <el-col>
        <video
          v-bind:autoplay="sharing"
          width="80%"
          poster="@/assets/imgs/default.jpg"
        ></video>
      </el-col>
    </el-row>
    <el-row>
      <el-button type="primary" round @click="hello">快速会议</el-button>
      <el-button type="primary" round @click="hello">加入会议</el-button>
      <el-button type="primary" round @click="shareScreen">{{sharing ? "正在分享屏幕": "分享屏幕"}}</el-button>
      <el-button type="danger" round @click="stopShare" v-if="sharing">结束分享</el-button>
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
  data() {
    return {
      sharing: false,
      chunks: [],
      recording: ""
    };
  },
  methods: {
    hello() {
      this.$message("hello world");
    },
    async shareScreen() {
      // startScreenCapture会返回一个promise，所以使用await来处理
      // await必须使用在async函数中
      if (this.sharing) {
        this.$message({
          message: "正在分享屏幕",
          type: "success"
        });
        return;
      }
      try {
        this.stream = await startScreenCapture();
        console.log("stream:", this.stream);
      } catch (e) {
        this.$message({
          message: "你取消了分享或没有权限",
          type: "error"
        });
        return;
      }
      this.stream.addEventListener("inactive", e => {
        console.log("Capture stream inactive - stop recording!");
        this.stopShare(e);
      });
      this.video = document.querySelector("video");
      this.video.srcObject = this.stream;
      this.sharing = true;
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
