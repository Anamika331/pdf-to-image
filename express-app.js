import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fromPath } from "pdf2pic";

const app = express();
const upload = multer({ dest: "/tmp" });

// ✅ Root route for welcome message
app.get("/", (req, res) => {
  res.send("<h1>Welcome to PDF-to-Image API 🚀</h1>");
});

app.post("/pdf-to-image", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }

    const baseName = path.parse(file.originalname).name;
    const convert = fromPath(file.path, { density: 100, format: "png", width: 600, height: 800 });

    let pageIndex = 1;
    const images = [];
    while (true) {
      try {
        const page = await convert(pageIndex);
        if (!page || !page.base64) break;
        images.push(page.base64);
        pageIndex++;
      } catch {
        break;
      }
    }

    res.json({
      message: "PDF converted successfully!",
      totalPages: images.length,  // ✅ total pages info
      images
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default app;
