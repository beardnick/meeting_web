<template>
  <div>
    <el-row>
      <el-col>
        <video v-bind:autoplay="sharing" width="80%" poster="@/assets/imgs/default.jpg"></video>
      </el-col>
    </el-row>
    <el-row>
      <el-button type="primary" round @click="createMeeting">快速会议</el-button>
      <el-button type="primary" round @click="joinMeeting">加入会议</el-button>
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

function create() {
  var resp = fetch("http://localhost:9020/meeting/create", {
    method: "GET"
  })
    .then(resp => {
      return resp.json();
    })
    .then(data => {
      this.meeting = data.meeting;
      this.$message({
        message: "新建会议" + this.meeting,
        type: "success"
      });
    });
}
function join(meeting) {
  var executor = resolve => {
    var resp = fetch(`http://localhost:9020/meeting/join?meeting=${meeting}`, {
      method: "GET"
    })
      .then(resp => {
        return resp.json();
      })
      .then(data => {
        console.log(data);
        resolve(data.meeting);
      });
  };
  return new Promise(executor);
}

export default {
  data() {
    return {
      sharing: false,
      chunks: new Map(),
      recording: ""
    };
  },
  methods: {
    hello() {
      this.$message("hello world");
    },
    createMeeting() {
      create();
    },
    joinMeeting() {
      this.$prompt("请输入会议号", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(({ value }) => {
        join(value).then(meeting => {
          this.meeting = meeting;
          this.$message({
            message: "加入会议" + this.meeting + "成功",
            type: "success"
          });
        });
      });
    },
    async shareScreen() {
      this.socket = new WebSocket("ws://localhost:9020/video/ws");
      // Connection opened
      this.socket.addEventListener("open", function(event) {
        console.log("websocket connected");
      });
      // Listen for messages
      this.socket.addEventListener("message", function(event) {
        console.log("Message from server ", event.data);
      });
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
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: "video/webm"
      });
      this.mediaRecorder.addEventListener("dataavailable", this.uploadVideo);
      this.mediaRecorder.start(100);
      this.video = document.querySelector("video");
      this.video.srcObject = this.stream;
      this.sharing = true;
    },
    async uploadVideo(event) {
      if (event.data == null || event.data.size <= 0) {
        return;
      }
      var id = Date.now();
      var data = new FormData();
      data.append("id", id);
      data.append("video", event.data);
      /*this.chunks.set(id, event.data);*/
      /*var respose = await fetch("http://127.0.0.1:9020/video", {*/
      /*  method: "POST",*/
      /*  body: data*/
      /*});*/
      this.socket.send(event.data);
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
