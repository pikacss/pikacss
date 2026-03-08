# 零副作用

PikaCSS 產生**零執行期副作用**。建置時期編譯完成後，你的 JavaScript 中不含任何樣式引擎、CSS 產生邏輯，也沒有用於樣式的 DOM 操作。唯一的產物是程式碼中的純字串字面值，以及一個靜態 CSS 檔案。

## 「零副作用」的意涵

在傳統的 CSS-in-JS 函式庫中，樣式引擎會被打包至瀏覽器並在執行期運作——它在執行期解析樣式物件、產生 CSS、對 class 名稱進行雜湊，並將 `<style>` 標籤注入 DOM。這些步驟的每一項都是**副作用**，會消耗 CPU 週期並延遲渲染。

PikaCSS 透過在建置期間執行每個步驟，消除了所有這些執行期副作用：

| 步驟 | 傳統 CSS-in-JS | PikaCSS |
|---|---|---|
| 樣式解析 | 執行期 | 建置時期 |
| Class 名稱產生 | 執行期 | 建置時期 |
| CSS 產生 | 執行期 | 建置時期 |
| DOM 注入 | 執行期 `<style>` 標籤 | 靜態 CSS 檔案 |
| 打包中的樣式引擎 | 有（10–50 KB+） | 無（0 KB） |

## 編譯輸出：純字串字面值

建置插件轉換程式碼後，`pika()` 呼叫會變成純字串字面值。`pika` 函式呼叫被完全移除——它們在執行期不存在。

**原始碼：**

<<< @/.examples/principles/zero-source.ts

**編譯後：**

<<< @/.examples/principles/zero-compiled.ts

注意：
- `pika()` 呼叫變成像 `'a b c'` 這樣的字串常數
- 編譯輸出中不存在任何函式呼叫——只有純字串字面值
- 匯出的函式是純粹的——沒有隱藏的執行期依賴

## 唯一的執行期產物

PikaCSS 新增至執行期打包中的**唯一**產物是一個靜態 CSS 檔案（預設為 `pika.gen.css`）。此檔案透過虛擬模組 `pika.css` 匯入，unplugin 會將其解析至產生的 CSS 檔案：

<<< @/.examples/principles/zero-generated.css

此 CSS 檔案：
- 在建置時期產生一次
- 包含整個應用程式中使用的所有原子化樣式 class
- 作為一般靜態資源提供——像任何其他樣式表一樣被瀏覽器快取
- 不向執行期打包新增任何 JavaScript

## Tree-shaking 支援

由於編譯後的 `pika()` 呼叫只是字串字面值，它們本質上是**可 tree-shake** 的。若持有已編譯樣式字串的變數從未被使用，打包器的無用程式碼消除功能會將其完全移除。

**包含未使用樣式的原始碼：**

<<< @/.examples/principles/zero-tree-shake-source.ts

**編譯並 tree-shaking 後：**

<<< @/.examples/principles/zero-tree-shake-compiled.ts

`unusedStyles` 變數被編譯為純字串 `'c d'`，打包器將其識別為未使用並予以消除。零副作用意味著打包器可以安全地將其移除。

::: info
若 `pika()` 呼叫在建置期間存在於被掃描的檔案中，未使用樣式的 CSS 可能仍會出現在 `pika.gen.css` 中。然而，未使用的 CSS class 不會讓你的 JavaScript 打包變大，未來的 PikaCSS 版本也可能支援 CSS 層級的剪枝。
:::

## 與傳統 CSS-in-JS 的比較

<<< @/.examples/principles/zero-comparison.ts

### 執行期成本分析

- **傳統 CSS-in-JS**：打包一個樣式引擎（通常 gzip 後 10–50 KB+），在每次渲染時解析樣式物件，在執行期產生並注入 CSS，可能導致版面配置抖動。
- **PikaCSS**：不新增任何額外 JavaScript。樣式是預先計算的靜態字串。CSS 是一次性載入的靜態檔案。樣式計算不造成任何渲染延遲。

## 對你的應用程式的影響

1. **更快的初始載入**：無需下載、解析或執行樣式引擎 JavaScript
2. **無執行期開銷**：樣式解析在建置時期完成，而非每次渲染時
3. **更好的快取**：產生的 CSS 檔案是可被積極快取的靜態資源
4. **更小的打包大小**：樣式無需執行期依賴——只有字串字面值
5. **無未樣式化內容閃爍**：CSS 從一開始就以靜態檔案的形式提供，不需等到 JavaScript 執行後才產生

## 下一步

- [整合概覽](/zh-TW/integrations/overview)
- [建置時期編譯](/zh-TW/principles/build-time-compile)
- [什麼是 PikaCSS？](/zh-TW/getting-started/what-is-pikacss)
