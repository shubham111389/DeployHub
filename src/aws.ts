import { S3 } from "aws-sdk"; 
const AWS = require("aws-sdk");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;


import fs from "fs";
import path from "path";

require('dotenv').config();




const s3 = new S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    endpoint: "https://f176de080d946997a747a188e04f44bc.r2.cloudflarestorage.com",
    
})




// fileName => output/12312/src/App.jsx
// filePath => /Users/harkiratsingh/vercel/dist/output/12312/src/App.jsx
export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);

     // Calculate the relative path from the `output` folder
     const relativePath = path.relative(path.join(__dirname, 'output'), localFilePath);

     // Construct the Key using the relative path
     const Key = path.join('output', relativePath).replace(/\\/g, '/');
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel1",
        Key: Key,
    }).promise();

    //console.log(response);
}
