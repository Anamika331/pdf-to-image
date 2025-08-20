import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fromPath } from "pdf2pic";

const app = express();
const upload = multer({ dest: "/tmp" });

// Serve /tmp as static folder
app.use("/tmp", express.static("/tmp"));

// Root welcome route
app.get("/", (req, res) => {
  res.send("<h1>Welcome to PDF-to-Image API 🚀</h1>");
});

// PDF to image endpoint
app.post("/pdf-to-image", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }

    const baseName = path.parse(file.originalname).name;
    const outputDir = "/tmp";

    const convert = fromPath(file.path, {
      density: 100,
      format: "png",
      width: 600,
      height: 800,
      savePath: outputDir,
      saveFilename: baseName,
    });

    const images = [];
    const maxPages = 5; // limit pages to avoid timeout

    for (let pageIndex = 1; pageIndex <= maxPages; pageIndex++) {
      try {
        const page = await convert(pageIndex);
        if (!page || !page.path) break;
        images.push(`/tmp/${path.basename(page.path)}`);
      } catch {
        break;
      }
    }

    res.json({
      message: "PDF converted successfully!",
      totalPages: images.length,
      images,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Local dev only
if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () =>
    console.log("🚀 Running locally on http://localhost:3000")
  );
}

export default app;
