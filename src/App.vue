<template>
  <div class="app-container">
    <div class="header">
      <h1>📄 文档对比工具</h1>
      <p class="subtitle">高效精准的文本和代码对比</p>
    </div>

    <!-- 上方：左右两栏输入框 -->
    <div class="input-wrapper">
      <div class="input-column">
        <div class="input-header">
          <span class="input-title">🔹 文本 1</span>
        </div>
        <textarea
          v-model="text1"
          @input="onText1Input"
          placeholder="输入或粘贴第一个文本内容..."
          class="text-input"
        ></textarea>
      </div>

      <div class="input-column">
        <div class="input-header">
          <span class="input-title">🔸 文本 2</span>
        </div>
        <textarea
          v-model="text2"
          @input="onText2Input"
          placeholder="输入或粘贴第二个文本内容..."
          class="text-input"
        ></textarea>
      </div>
    </div>

    <!-- 统计信息和操作按钮 -->
    <div class="control-bar">
      <div class="stats">
        <span class="stat-item">
          相同: <strong>{{ stats.same }}</strong>
        </span>
        <span class="stat-item">
          删除: <strong class="removed">{{ stats.removed }}</strong>
        </span>
        <span class="stat-item">
          添加: <strong class="added">{{ stats.added }}</strong>
        </span>
      </div>
      <div class="buttons">
        <button @click="formatAllTexts" class="btn btn-format">
          格式化文本
        </button>
        <button @click="swapTexts" class="btn btn-primary">交换文本</button>
        <button @click="clearAll" class="btn btn-secondary">清空所有</button>
        <button @click="loadSample" class="btn btn-success">加载示例</button>
      </div>
    </div>

    <!-- 下方：左右两栏对比结果 -->
    <div class="diff-section">
      <div class="diff-header">
        <h2>📊 对比结果</h2>
      </div>
      <div class="diff-wrapper">
        <DiffViewer :oldText="text1" :newText="text2" />
      </div>
    </div>
  </div>
</template>

<script>
import DiffViewer from "./components/DiffViewer.vue";

export default {
  name: "App",
  components: {
    DiffViewer,
  },
  data() {
    return {
      text1: "",
      text2: "",
      stats: {
        same: 0,
        removed: 0,
        added: 0,
      },
    };
  },
  watch: {
    text1() {
      this.updateStats();
    },
    text2() {
      this.updateStats();
    },
  },
  methods: {
    // 格式化文本：将多个空格替换成一个空格，多个空行替换成一个空行
    formatText(text) {
      if (!text) return "";

      let formatted = text;

      // 步骤一：将多个空格替换成一个空格
      // 匹配一个或多个连续的空格，替换为一个空格
      formatted = formatted.replace(/ +/g, " ");

      // 步骤二：将多个空行替换成一个空行
      // 先统一换行符为 \n
      formatted = formatted.replace(/\r\n/g, "\n");
      formatted = formatted.replace(/\r/g, "\n");
      // 然后将多个连续换行替换成一个
      formatted = formatted.replace(/(\n\s*){2,}/g, "\n");

      return formatted;
    },

    // 格式化所有文本
    formatAllTexts() {
      this.text1 = this.formatText(this.text1);
      this.text2 = this.formatText(this.text2);
    },

    // 文本1输入事件处理
    onText1Input(event) {
      // 延迟格式化，避免影响用户输入体验
      setTimeout(() => {
        const formatted = this.formatText(event.target.value);
        if (formatted !== event.target.value) {
          this.text1 = formatted;
        }
      }, 100);
    },

    // 文本2输入事件处理
    onText2Input(event) {
      // 延迟格式化，避免影响用户输入体验
      setTimeout(() => {
        const formatted = this.formatText(event.target.value);
        if (formatted !== event.target.value) {
          this.text2 = formatted;
        }
      }, 100);
    },

    clearText1() {
      this.text1 = "";
    },
    clearText2() {
      this.text2 = "";
    },
    clearAll() {
      this.text1 = "";
      this.text2 = "";
    },
    swapTexts() {
      [this.text1, this.text2] = [this.text2, this.text1];
    },
    loadSample() {
      this.text1 = `第一章 测试章节
测试是一个重要的过程，可以帮助我们发现问题。
在软件开发中，测试扮演着关键的角色。
我们需要确保代码的质量和功能的正确性。`;

      this.text2 = `第一章 测试章节
测试是确保质量的重要环节，用来验证系统功能。
在现代软件开发中，自动化测试变得越来越重要。
我们必须严格执行测试流程，以确保代码质量。
此外，还要定期进行代码审查和性能测试。`;
    },

    updateStats() {
      const lines1 = this.text1.split("\n");
      const lines2 = this.text2.split("\n");

      let same = 0,
        removed = 0,
        added = 0;

      const maxLen = Math.max(lines1.length, lines2.length);
      for (let i = 0; i < maxLen; i++) {
        const line1 = lines1[i] || "";
        const line2 = lines2[i] || "";

        if (line1 === line2 && line1) {
          same++;
        } else {
          if (line1) removed++;
          if (line2 && line1 !== line2) added++;
        }
      }

      this.stats = { same, removed, added };
    },
  },
  mounted() {
    this.loadSample();
  },
};
</script>

<style scoped>
.app-container {
  max-width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background: white;
  padding: 20px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  flex-shrink: 0;
}

.header h1 {
  font-size: 28px;
  color: #667eea;
  margin-bottom: 5px;
}

.subtitle {
  color: #666;
  font-size: 13px;
}

/* 上方输入区域 */
.input-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #ddd;
  flex-shrink: 0;
  height: 280px;
}

.input-column {
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.input-header {
  background: #f5f5f5;
  padding: 12px 15px;
  border-bottom: 2px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.input-title {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.btn-clear {
  padding: 4px 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: #e0e0e0;
  color: #333;
}

.text-input {
  flex: 1;
  width: 100%;
  padding: 15px;
  border: none;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.text-input:focus {
  background: #fafafa;
}

/* 控制栏 */
.control-bar {
  background: white;
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  border-bottom: 2px solid #667eea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 15px;
}

.stats {
  display: flex;
  gap: 20px;
  font-size: 13px;
}

.stat-item {
  color: #666;
}

.stat-item strong {
  color: #333;
  font-family: monospace;
  margin-left: 5px;
}

.stat-item strong.removed {
  color: #d32f2f;
}

.stat-item strong.added {
  color: #388e3c;
}

.buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

.btn-success {
  background: #48bb78;
  color: white;
}

.btn-success:hover {
  background: #38a169;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.btn-format {
  background: #ff6b35;
  color: white;
}

.btn-format:hover {
  background: #e55a2b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
}

/* 下方对比结果区域 */
.diff-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
}

.diff-header {
  background: #f9f9f9;
  padding: 12px 20px;
  border-bottom: 2px solid #e0e0e0;
  flex-shrink: 0;
}

.diff-header h2 {
  font-size: 16px;
  color: #333;
  margin: 0;
}

.diff-wrapper {
  flex: 1;
  overflow: hidden;
}

/* 响应式 */
@media (max-width: 1024px) {
  .input-wrapper {
    grid-template-columns: 1fr;
    height: auto;
  }

  .input-column {
    min-height: 200px;
  }

  .control-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .stats,
  .buttons {
    justify-content: center;
  }

  .header h1 {
    font-size: 22px;
  }
}
</style>
