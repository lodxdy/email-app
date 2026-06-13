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


// --------------------
// FILE UPLOAD
// --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const clean = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + clean);
  }
});

const upload = multer({ storage });


// --------------------
// SMTP TRANSPORT (BREVO)
// --------------------
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});


// --------------------
// MAIN ROUTE
// --------------------
app.post("/submit", upload.single("pdf"), async (req, res) => {
  console.log("🔥 /submit HIT");

  try {
    const { senderName, applicantName, trn, toEmail } = req.body;

    let attachments = [];

    if (req.file) {
      attachments.push({
        filename: req.file.originalname,
        path: req.file.path
      });
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

    await transporter.sendMail(mailOptions);

    console.log("✅ EMAIL SENT");

    if (req.file) fs.unlinkSync(req.file.path);

    return res.json({ success: true });

  } catch (error) {
    console.log("❌ ERROR:", error);

    return res.json({
      success: false,
      error: error.message
    });
  }
});


// --------------------
// SERVER
// --------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});