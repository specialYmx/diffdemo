<template>
  <div class="advanced-diff-viewer">
    <div class="viewer-controls">
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showLineNumbers" />
          显示行号
        </label>
        <label>
          <input type="checkbox" v-model="highlightSyntax" />
          语法高亮
        </label>
      </div>
      <div class="control-group">
        <label>
          上下文行数：
          <input type="number" v-model.number="contextLines" min="0" max="10" />
        </label>
      </div>
    </div>

    <div class="diff-stats">
      <span class="stat-item">
        <span class="stat-label">总行数:</span>
        <span class="stat-value">{{ totalLines }}</span>
      </span>
      <span class="stat-item">
        <span class="stat-label">变化行数:</span>
        <span class="stat-value changed">{{ changedLines }}</span>
      </span>
      <span class="stat-item">
        <span class="stat-label">相似度:</span>
        <span class="stat-value">{{ similarity }}%</span>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdvancedDiffViewer",
  props: {
    oldString: {
      type: String,
      default: "",
    },
    newString: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      showLineNumbers: true,
      highlightSyntax: false,
      contextLines: 3,
      totalLines: 0,
      changedLines: 0,
      similarity: 0,
    };
  },
  watch: {
    oldString() {
      this.calculateStats();
    },
    newString() {
      this.calculateStats();
    },
  },
  methods: {
    calculateStats() {
      const lines1 = this.oldString.split("\n");
      const lines2 = this.newString.split("\n");

      this.totalLines = Math.max(lines1.length, lines2.length);

      let sameCount = 0;
      const maxLen = this.totalLines;

      for (let i = 0; i < maxLen; i++) {
        const line1 = lines1[i] || "";
        const line2 = lines2[i] || "";

        if (line1 === line2) {
          sameCount++;
        }
      }

      this.changedLines = this.totalLines - sameCount;
      this.similarity =
        this.totalLines > 0
          ? Math.round((sameCount / this.totalLines) * 100)
          : 0;
    },
  },
  mounted() {
    this.calculateStats();
  },
};
</script>

<style scoped>
.advanced-diff-viewer {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.viewer-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.control-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
}

.control-group input[type="checkbox"] {
  cursor: pointer;
}

.control-group input[type="number"] {
  width: 60px;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.diff-stats {
  display: flex;
  gap: 20px;
  padding: 10px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.stat-label {
  color: #666;
  font-weight: 500;
}

.stat-value {
  color: #333;
  font-weight: 600;
  font-family: monospace;
}

.stat-value.changed {
  color: #f56565;
}
</style>
