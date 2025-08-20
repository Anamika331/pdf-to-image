import express from "express";
import multer from "multer";
import path from "path";
import pdf2img from "pdf-to-img";

const app = express();
const upload = multer({ dest: "/tmp" });

// Serve /tmp as static folder
app.use("/tmp", express.static("/tmp"));

// Welcome route
app.get("/", (req, res) => {
  res.send("<h1>Welcome to PDF-to-PNG Converter 🚀</h1>");
});

// PDF to PNG endpoint
app.post("/pdf-to-png", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No PDF uploaded" });

    const baseName = path.parse(file.originalname).name;
    const outputDir = "/tmp";

    // Convert PDF to PNG
    const images = await pdf2img(file.path, {
      width: 600,
      height: 800,
      output: outputDir,
      format: "png",
    });

    // Build URLs
    const urls = images.map((img) => `/tmp/${path.basename(img.path)}`);

    res.json({
      message: "PDF converted successfully!",
      totalPages: urls.length,
      images: urls,
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
