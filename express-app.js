import express from "express";
import multer from "multer";
import { fromPath } from "pdf2pic";

const app = express();
const upload = multer({ dest: "/tmp" });

// Welcome route
app.get("/", (req, res) => {
  res.send("<h1>Welcome to PDF-to-PNG API 🚀</h1>");
});

// PDF to PNG endpoint (returns Base64)
app.post("/pdf-to-png", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No PDF uploaded" });

    const convert = fromPath(file.path, {
      density: 100,
      format: "png",
      width: 600,
      height: 800,
    });

    const images = [];
    const maxPages = 5; // limit to avoid timeout

    for (let i = 1; i <= maxPages; i++) {
      try {
        const page = await convert(i);
        if (!page || !page.base64) break;
        images.push(page.base64);
      } catch {
        break;
      }
    }

    res.json({
      message: "PDF converted successfully!",
      totalPages: images.length,
      images, // Base64 strings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default app;
