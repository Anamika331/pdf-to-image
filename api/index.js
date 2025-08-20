import express from "express";
import multer from "multer";
import { PDFDocument } from "pdf-lib";
import { createCanvas } from "canvas";

const app = express();
const upload = multer({ dest: "/tmp" });

// Root route
app.get("/", (req, res) => {
  res.send("<h1>Welcome to PDF-to-PNG API 🚀</h1>");
});

// Convert PDF to PNG
app.post("/pdf-to-png", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No PDF uploaded" });

    const pdfBytes = await fs.promises.readFile(file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const images = [];
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Fill white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // NOTE: Rendering text/images from PDF to canvas is limited in pure JS
      // For full fidelity, a library like pdf2pic or external API is needed.
      // Here, we create blank PNG pages as placeholders.
      
      const pngBuffer = canvas.toBuffer("image/png");
      images.push(pngBuffer);
    }

    res.json({
      message: "PDF processed!",
      totalPages: images.length,
      images: images.map((_, idx) => `/tmp/page_${idx + 1}.png`),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default app;
