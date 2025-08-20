import CloudConvert from "cloudconvert";
import multer from "multer";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const upload = multer({ dest: "/tmp" });
const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    res.send("<h1>Welcome to PDF-to-PNG API 🚀</h1>");
    return;
  }

  if (req.method === "POST") {
    upload.single("file")(req, res, async function (err) {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

      try {
        const inputFile = req.file.path;
        const fileName = path.parse(req.file.originalname).name;

        // Create CloudConvert job
        const job = await cloudConvert.jobs.create({
          tasks: {
            'import-my-file': { operation: 'import/upload' },
            'convert-my-file': {
              operation: 'convert',
              input: 'import-my-file',
              input_format: 'pdf',
              output_format: 'png',
              filename: `${fileName}_page_%d.png`
            },
            'export-my-file': {
              operation: 'export/url',
              input: 'convert-my-file'
            }
          }
        });

        const uploadTask = job.tasks.find(t => t.name === 'import-my-file');
        const uploadUrl = uploadTask.result.form.url;

        // Upload PDF to CloudConvert
        const fileData = fs.readFileSync(inputFile);
        await fetch(uploadUrl, { method: "POST", body: fileData });

        // Wait for conversion to finish
        const completedJob = await cloudConvert.jobs.wait(job.id);
        const exportTask = completedJob.tasks.find(t => t.operation === 'export/url');

        const urls = exportTask.result.files.map(f => f.url);

        res.json({
          message: "PDF converted successfully!",
          totalPages: urls.length,
          images: urls
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
