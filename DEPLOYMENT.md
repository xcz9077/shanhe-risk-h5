# GitHub Pages 部署说明

本项目已配置 GitHub Actions 自动部署到 GitHub Pages。

## 自动部署条件

将项目推送到 GitHub 仓库的 `main` 分支后，会自动运行：

```bash
pnpm install --frozen-lockfile
pnpm run build
```

构建产物使用 `dist/`，并通过 GitHub Pages 发布。

## Vite base 路径

`vite.config.ts` 会在 GitHub Actions 中自动读取仓库名：

```text
owner/shanhe-h5 -> /shanhe-h5/
```

本地开发时仍使用 `/`，不会影响 `pnpm run dev`。

## GitHub 仓库设置

1. 打开 GitHub 仓库。
2. 进入 `Settings`。
3. 进入 `Pages`。
4. 在 `Build and deployment` 中选择 `GitHub Actions`。
5. 推送 `main` 分支后，等待 `Actions` 中的 `Deploy GitHub Pages` 工作流完成。

## 获得测试链接

部署成功后，GitHub Pages 链接通常是：

```text
https://<你的 GitHub 用户名>.github.io/<仓库名>/
```

也可以打开仓库的 `Actions` 页面，进入最新的 `Deploy GitHub Pages` 记录，在部署结果中复制页面地址。
