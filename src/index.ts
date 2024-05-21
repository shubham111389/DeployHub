import fs from "fs";
import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { createClient} from "redis";


import { generate } from "./utils";
import { getAllFiles } from "./file";
import path from "path";
import { uploadFile } from "./aws";
// index.ts or app.ts

require('dotenv').config();


const publisher = createClient();
publisher.connect();

const subscriber = createClient();
subscriber.connect();

const app = express();
app.use(cors());
app.use(express.json());
const DELAY_MS = 15000;

// POSTMAN
app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate(); // asd12
    const outputPath = path.join(__dirname, `output/${id}`);

    console.log("Cloning repository...");
    try {
        // Clone the repository
        await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));
        console.log("Repository cloned successfully.");

        // Check if the directory exists
        if (fs.existsSync(outputPath)) {
            console.log("Cloned directory exists.");

            // Get all files from the cloned directory
            const files = getAllFiles(path.join(__dirname, `output/${id}`));
            console.log("Files found:", files);

            // Upload files
            console.log("Uploading files...");
            for (const file of files) {
                console.log(`Uploading file: ${file}`);
                uploadFile(file.slice(__dirname.length + 1), file);
                console.log(`File ${file} uploaded successfully.`);
            }
            setTimeout(() => {
                publisher.lPush("build-queue", id);
                // INSERT => SQL
               
            }, DELAY_MS);
            // INSERT => SQL
            // .create => 
            publisher.hSet("status", id, "uploaded");

            res.json({ id: id });
        } else {
            console.log("Cloned directory not found.");
            res.status(404).json({ error: "Cloned directory not found" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get("/status", async (req, res) => {
    const id = req.query.id;
    const response = await subscriber.hGet("status", id as string);
    res.json({
        status: response
    })
})

app.listen(3005);
