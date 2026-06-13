// const express = require("express");
// const multer = require("multer");
// const nodemailer = require("nodemailer");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const fs = require("fs");

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use(express.static("public"));


// // ======================
// // Upload Setup
// // ======================

// const uploadFolder = "uploads";

// if (!fs.existsSync(uploadFolder)) {
//     fs.mkdirSync(uploadFolder);
// }


// const storage = multer.diskStorage({

//     destination:(req,file,cb)=>{
//         cb(null, uploadFolder);
//     },


//     filename:(req,file,cb)=>{

//         const cleanName =
//         file.originalname.replace(/\s+/g,"_");

//         cb(
//             null,
//             Date.now()+"-"+cleanName
//         );

//     }

// });


// const upload = multer({
//     storage
// });



// // ======================
// // Email Function
// // ======================

// async function sendEmail({

//     senderName,
//     senderEmail,
//     appPassword,

//     applicantName,
//     trn,

//     toEmail,

//     filePath,
//     originalFileName

// }){


// const transporter =
// nodemailer.createTransport({

//     service:"gmail",

//     auth:{
//         user:senderEmail,
//         pass:appPassword
//     }

// });



// const mailOptions = {


//     from:
//     `"${senderName}" <${senderEmail}>`,


//     to:
//     toEmail,


//     subject:
//     `Request to Review Visa Draft – ${applicantName}`,


//     text:

// `
// Dear RMA,

// Could you please review the visa draft for ${applicantName}
// (Transaction Reference No.: ${trn})
// and let me know if it is ready for lodgment?

// I would appreciate your confirmation so I can proceed accordingly.

// Thank you for your assistance.

// Best regards,

// ${senderName}
// `,


// attachments:

// filePath ?

// [
// {
//     filename:originalFileName,
//     path:filePath
// }
// ]

// :

// []

// };



// await transporter.sendMail(mailOptions);


// }





// // ======================
// // API Route
// // ======================


// app.post(
// "/submit",
// upload.single("pdf"),

// async(req,res)=>{


// try{


// const {

// senderName,
// senderEmail,
// appPassword,

// applicantName,
// trn,

// toEmail


// }=req.body;



// const filePath =
// req.file
// ?
// req.file.path
// :
// null;



// const originalFileName =
// req.file
// ?
// req.file.originalname
// :
// null;



// await sendEmail({

// senderName,
// senderEmail,
// appPassword,

// applicantName,
// trn,

// toEmail,

// filePath,
// originalFileName

// });



// // Delete file after sending

// if(filePath){

// fs.unlinkSync(filePath);

// }



// res.json({

// success:true

// });



// }

// catch(error){


// console.log(error);


// res.json({

// success:false,

// error:error.message

// });


// }


// });




// // ======================
// // Server
// // ======================

// app.listen(
// process.env.PORT || 3000,
// "0.0.0.0",

// ()=>{

// console.log(
// `Server running on http://localhost:${process.env.PORT || 3000}`
// );

// });

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Ensure uploads folder exists

const uploadFolder = "uploads";
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// MULTER CONFIG

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + cleanName);
  }
});

const upload = multer({ storage });


// BREVO SMTP TRANSPORT

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// VERIFY SMTP ON START

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP NOT READY:", error.message);
  } else {
    console.log("✅ SMTP READY - Brevo connected");
  }
});


// MAIN ROUTE

app.post("/submit", upload.single("pdf"), async (req, res) => {
  console.log("\n🔥 /submit HIT");

  try {
    console.log("📩 BODY RECEIVED:", req.body);

    const { senderName, applicantName, trn, toEmail } = req.body;

    if (!toEmail) {
      console.log("❌ Missing recipient email");
      return res.json({ success: false, error: "Missing toEmail" });
    }

    let attachments = [];

    if (req.file) {
      console.log("📎 FILE RECEIVED:", req.file.originalname);

      attachments.push({
        filename: req.file.originalname,
        path: req.file.path
      });
    } else {
      console.log("⚠️ No attachment provided");
    }

    const mailOptions = {
      from: `"Visa System" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Visa Draft Review - ${applicantName}`,
      text: `
Dear RMA,

Please review visa draft.

Name: ${applicantName}
TRN: ${trn}

Regards,
${senderName}
      `,
      attachments
    };

    console.log("📤 Sending email...");
    console.log("➡️ TO:", toEmail);
    console.log("➡️ FROM:", process.env.SMTP_USER);

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ EMAIL SENT SUCCESSFULLY");
    console.log("📨 INFO:", info.messageId || info.response);

    // cleanup file
    if (req.file) {
      fs.unlinkSync(req.file.path);
      console.log("🧹 File deleted");
    }

    return res.json({
      success: true,
      message: "Email sent successfully",
      id: info.messageId
    });

  } catch (error) {
    console.log("\n❌ EMAIL FAILED:");
    console.log(error);
    console.log(error.stack);

    return res.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});



// SERVER START
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});