<template>
  <div class="diff-viewer">
    <div class="diff-container">
      <div class="diff-column left-column">
        <div class="column-header">
          <span class="column-title">原始文本</span>
          <span class="line-count">{{ leftLines.length }} 行</span>
        </div>
        <div class="diff-content">
          <div
            v-for="(line, idx) in leftLines"
            :key="`left-${idx}`"
            class="diff-line"
            :class="line.type"
          >
            <span class="line-number">{{ idx + 1 }}</span>
            <span class="line-content" v-html="line.html"></span>
          </div>
        </div>
      </div>

      <div class="diff-column right-column">
        <div class="column-header">
          <span class="column-title">对比文本</span>
          <span class="line-count">{{ rightLines.length }} 行</span>
        </div>
        <div class="diff-content">
          <div
            v-for="(line, idx) in rightLines"
            :key="`right-${idx}`"
            class="diff-line"
            :class="line.type"
          >
            <span class="line-number">{{ idx + 1 }}</span>
            <span class="line-content" v-html="line.html"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DiffMatchPatch from "diff-match-patch";

export default {
  name: "DiffViewer",
  props: {
    oldText: {
      type: String,
      default: "",
    },
    newText: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      leftLines: [],
      rightLines: [],
    };
  },
  watch: {
    oldText() {
      this.computeDiff();
    },
    newText() {
      this.computeDiff();
    },
  },
  methods: {
    normalizeText(text) {
      if (!text) return "";

      let normalized = text;

      // 1. 将多个空格、制表符替换成一个空格
      normalized = normalized.replace(/[ \t]+/g, " ");

      // 2. 将多个连续换行（包括空行）替换成一个换行
      // 先统一换行符为 \n
      normalized = normalized.replace(/\r\n/g, "\n");
      normalized = normalized.replace(/\r/g, "\n");
      // 然后将多个连续换行替换成一个
      normalized = normalized.replace(/\n{2,}/g, "\n");

      // 3. 去除每行首尾的空格
      normalized = normalized
        .split("\n")
        .map((line) => line.trim())
        .join("\n");

      return normalized;
    },
    computeDiff() {
      const dmp = new DiffMatchPatch();

      // 预处理文本：规范化空格和换行
      const normalizedOldText = this.normalizeText(this.oldText);
      const normalizedNewText = this.normalizeText(this.newText);

      // 获取行级别的差异
      const oldLines = normalizedOldText.split("\n");
      const newLines = normalizedNewText.split("\n");

      // 计算行级差异
      const lineDiffs = dmp.diff_main(oldLines.join("\n"), newLines.join("\n"));

      dmp.diff_cleanupSemantic(lineDiffs);

      // 构建左侧行
      this.leftLines = [];
      this.rightLines = [];

      let oldIdx = 0;
      let newIdx = 0;

      for (let i = 0; i < lineDiffs.length; i++) {
        const [operation, text] = lineDiffs[i];
        const lines = text.split("\n").filter((l) => l !== "");

        if (operation === 0) {
          // 相同
          lines.forEach((line) => {
            this.leftLines.push({
              type: "same",
              content: line,
              html: this.escapeHtml(line),
            });
            this.rightLines.push({
              type: "same",
              content: line,
              html: this.escapeHtml(line),
            });
            oldIdx++;
            newIdx++;
          });
        } else if (operation === -1) {
          // 删除（红色）
          lines.forEach((line) => {
            this.leftLines.push({
              type: "removed",
              content: line,
              html: this.escapeHtml(line),
            });
            oldIdx++;
          });
        } else if (operation === 1) {
          // 添加（绿色）
          lines.forEach((line) => {
            this.rightLines.push({
              type: "added",
              content: line,
              html: this.escapeHtml(line),
            });
            newIdx++;
          });
        }
      }

      // 对齐行数
      const maxLines = Math.max(this.leftLines.length, this.rightLines.length);
      while (this.leftLines.length < maxLines) {
        this.leftLines.push({ type: "empty", content: "", html: "" });
      }
      while (this.rightLines.length < maxLines) {
        this.rightLines.push({ type: "empty", content: "", html: "" });
      }
    },
    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },
  },
  mounted() {
    this.computeDiff();
  },
};
</script>

<style scoped>
.diff-viewer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.diff-container {
  display: flex;
  height: 100%;
  gap: 1px;
  background: #ddd;
}

.diff-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;
}

.column-header {
  background: #f5f5f5;
  border-bottom: 2px solid #ddd;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
}

.column-title {
  color: #333;
}

.line-count {
  color: #999;
  font-size: 12px;
  font-weight: normal;
}

.diff-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.5;
}

.diff-line {
  display: flex;
  min-height: 24px;
  white-space: pre-wrap;
  word-break: break-all;
  border-bottom: 1px solid #f0f0f0;
}

.diff-line.same {
  background: white;
  color: #333;
}

.diff-line.removed {
  background: #ffe6e6;
  color: #d32f2f;
}

.diff-line.added {
  background: #e6ffe6;
  color: #388e3c;
}

.diff-line.empty {
  background: #fafafa;
  color: transparent;
}

.line-number {
  display: inline-block;
  width: 50px;
  padding: 0 8px;
  text-align: right;
  color: #999;
  background: #fafafa;
  border-right: 1px solid #eee;
  flex-shrink: 0;
  user-select: none;
}

.line-content {
  flex: 1;
  padding: 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.left-column {
  border-right: 1px solid #ddd;
}

/* 自定义滚动条 */
.diff-content::-webkit-scrollbar {
  width: 8px;
}

.diff-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.diff-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.diff-content::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
