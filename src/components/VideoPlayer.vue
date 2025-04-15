<template>
  <div class="video-player">
    <video
      ref="videoRef"
      :src="src"
      :poster="poster"
      class="video-element"
      @error="handleError"
    >
      <track
        v-for="(track, index) in tracks"
        :key="index"
        :kind="track.kind"
        :label="track.label"
        :srclang="track.srclang"
        :src="track.src"
      />
    </video>
    
    <div class="video-controls" v-if="!isFullscreen">
      <div class="progress-bar">
        <div class="progress" :style="{ width: `${(currentTime / duration) * 100}%` }"></div>
      </div>
      
      <div class="control-buttons">
        <button @click="handlePlayPause" class="control-button">
          <el-icon>
            <component :is="isPlaying ? 'VideoPause' : 'VideoPlay'" />
          </el-icon>
        </button>
        
        <div class="time-display">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </div>
        
        <button @click="handleMute" class="control-button">
          <el-icon>
            <component :is="isMuted ? 'Mute' : 'Microphone'" />
          </el-icon>
        </button>
        
        <div class="volume-slider">
          <el-slider
            v-model="volume"
            :min="0"
            :max="1"
            :step="0.1"
            @change="handleVolumeChange"
          />
        </div>
        
        <button @click="toggleFullscreen" class="control-button">
          <el-icon><FullScreen /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useMediaControls } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import {
  VideoPlay,
  VideoPause,
  Microphone,
  Mute,
  FullScreen
} from '@element-plus/icons-vue'

interface Track {
  kind: string
  label: string
  srclang: string
  src: string
}

const props = defineProps<{
  src: string
  poster?: string
  tracks?: Track[]
}>()

const videoRef = ref<HTMLVideoElement>()
const isFullscreen = ref(false)

const {
  playing: isPlaying,
  currentTime,
  duration,
  volume,
  muted: isMuted,
  seeking,
  buffered
} = useMediaControls(videoRef, {
  src: props.src
})

// 格式化时间
const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 处理播放/暂停
const handlePlayPause = () => {
  if (videoRef.value) {
    if (isPlaying.value) {
      videoRef.value.pause()
    } else {
      videoRef.value.play()
    }
  }
}

// 处理静音
const handleMute = () => {
  if (videoRef.value) {
    videoRef.value.muted = !isMuted.value
  }
}

// 处理音量变化
const handleVolumeChange = (value: number | number[]) => {
  if (videoRef.value) {
    videoRef.value.volume = Array.isArray(value) ? value[0] : value
  }
}

// 处理错误
const handleError = (event: Event) => {
  const video = event.target as HTMLVideoElement
  ElMessage.error(`视频加载失败: ${video.error?.message || '未知错误'}`)
}

// 切换全屏
const toggleFullscreen = async () => {
  if (!videoRef.value) return
  
  try {
    if (!document.fullscreenElement) {
      await videoRef.value.requestFullscreen()
      isFullscreen.value = true
    } else {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  } catch (error) {
    console.error('切换全屏失败:', error)
  }
}

// 监听全屏变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped lang="scss">
.video-player {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;

  .video-element {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .video-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    padding: 20px;
    transition: opacity 0.3s;

    &:hover {
      opacity: 1;
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      cursor: pointer;
      margin-bottom: 10px;

      .progress {
        height: 100%;
        background: var(--el-color-primary);
        transition: width 0.1s linear;
      }
    }

    .control-buttons {
      display: flex;
      align-items: center;
      gap: 15px;

      .control-button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        transition: background-color 0.3s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .el-icon {
          font-size: 20px;
        }
      }

      .time-display {
        color: white;
        font-size: 14px;
        min-width: 100px;
        text-align: center;
      }

      .volume-slider {
        width: 100px;
      }
    }
  }
}
</style> 