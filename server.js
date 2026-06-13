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
const { Resend } = require("resend");

dotenv.config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static("public"));


// =====================
// Upload setup
// =====================

const uploadFolder = "uploads";

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + cleanName);
  }
});

const upload = multer({ storage });


// =====================
// API Route
// =====================

app.post("/submit", upload.single("pdf"), async (req, res) => {
  console.log("🔥 /submit HIT");
   res.json({ success: true });
  try {
    const {
      senderName,
      applicantName,
      trn,
      toEmail
    } = req.body;

    const filePath = req.file ? req.file.path : null;
    const originalFileName = req.file ? req.file.originalname : null;

    // Read file if exists
    let attachments = [];

    if (filePath) {
      const fileBuffer = fs.readFileSync(filePath);

      attachments.push({
        filename: originalFileName,
        content: fileBuffer
      });
    }

    // Send email via Resend
    await resend.emails.send({
      from: "Visa System <onboarding@resend.dev>",
      to: toEmail,
      subject: `Request to Review Visa Draft – ${applicantName}`,
      text: `
Dear RMA,

Could you please review the visa draft for ${applicantName}
(Transaction Reference No.: ${trn})

Thank you.

Best regards,
${senderName}
      `,
      attachments: attachments
    });

    // delete uploaded file
    if (filePath) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true });

  } catch (error) {
    console.log(error);
    res.json({ success: false, error: error.message });
  }
});


// =====================
// Server
// =====================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});