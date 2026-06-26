# 山河有变

移动端 H5 科普互动 MVP，主题是“从中国神话读懂风险与生存智慧”。

## 项目结构

```text
shanhe-risk-h5/
├─ index.html
├─ package.json
├─ DEPLOYMENT.md
├─ TESTING.md
├─ vite.config.ts
├─ tsconfig.json
├─ public/
│  └─ images/
│     ├─ comic-1.png
│     ├─ comic-2.png
│     ├─ comic-3.png
│     ├─ comic-4.png
│     ├─ comic-5.png
│     ├─ comic-6.png
│     ├─ comic-7.png
│     ├─ comic-8.png
│     └─ splash-bg.png
└─ src/
   ├─ App.tsx
   ├─ content.ts
   ├─ main.tsx
   └─ styles.css
```

## 修改内容

所有五卷数据、共工卷数据、分镜、风险解码、小测题目和结果文案都在 `src/content.ts`。

图片公开路径使用 `/images/comic-1.png` 到 `/images/comic-8.png`，源文件放在 `public/images/`。

## 运行预览

```bash
npm install
npm run dev
```

打开终端显示的本地地址。手机预览时，让手机和电脑处在同一网络，访问终端显示的 Network 地址。

## 打包

```bash
npm run build
```

打包结果生成在 `dist/`，上线时上传 `dist/` 里的全部文件。

## GitHub Pages

项目已配置 `.github/workflows/deploy-pages.yml`，推送到 `main` 分支后可自动构建并发布到 GitHub Pages。部署细节见 `DEPLOYMENT.md`。
