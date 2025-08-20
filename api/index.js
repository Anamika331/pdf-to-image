import app from "../express-app.js";
import { createVercelHandler } from "vercel-express";

export default createVercelHandler(app);
