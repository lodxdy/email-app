// // const express = require("express");
// // const multer = require("multer");
// // const nodemailer = require("nodemailer");
// // const dotenv = require("dotenv");
// // const cors = require("cors");
// // const path = require("path");

// // dotenv.config();

// // const app = express();
// // app.use(cors());
// // app.use(express.static("public"));

// // const storage = multer.diskStorage({
// //   destination: "uploads/",
// //   filename: (req, file, cb) => {
// //     cb(null, Date.now() + "-" + file.originalname);
// //   }
// // });

// // const upload = multer({ storage });

// // // Email sender
// // async function sendEmail(name, trn, filePath) {
// //   const transporter = nodemailer.createTransport({
// //     service: "gmail",
// //     auth: {
// //       user: process.env.EMAIL,
// //       pass: process.env.APP_PASSWORD
// //     }
// //   });

// //   const mailOptions = {
// //     from: process.env.EMAIL,
// //     to: process.env.TO_EMAIL,
// //     subject: `Request to Review Visa Draft – ${name}`,
// //     text: `
// // Dear RMA,

// // Could you please review the visa draft for ${name} (Transaction Reference No.: ${trn}) and let me know if it is ready for lodgment?

// // I would appreciate your confirmation so I can proceed accordingly.

// // Thank you for your assistance.

// // Best regards
// //     `,
// //     attachments: [
// //       {
// //         filename:"visa-draft.pdf",
// //         path: filePath
// //       }
// //     ]
// //   };

// //   await transporter.sendMail(mailOptions);
// // }

// // // API route
// // app.post("/submit", upload.single("pdf"), async (req, res) => {
// //   try {
// //     const { name, trn } = req.body;
// //     const filePath = req.file.path;

// //     await sendEmail(name, trn, filePath);

// //     res.json({ success: true, message: "Email sent successfully" });
// //   } catch (err) {
// //     console.log(err);
// //     res.status(500).json({ success: false, error: err.message });
// //   }
// // });

// // app.listen(process.env.PORT, () => {
// //   console.log(`Server running on http://localhost:${process.env.PORT}`);
// // });

// const express = require("express");
// const multer = require("multer");
// const nodemailer = require("nodemailer");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const fs = require("fs");
// const path = require("path");

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json());


// // Serve frontend
// app.use(express.static("public"));


// // Upload configuration

// const uploadFolder = "uploads";

// if (!fs.existsSync(uploadFolder)) {
//     fs.mkdirSync(uploadFolder);
// }


// const storage = multer.diskStorage({

//     destination: function(req, file, cb){
//         cb(null, uploadFolder);
//     },

//     filename: function(req, file, cb){

//         const cleanName = file.originalname.replace(/\s+/g, "_");

//         cb(null, Date.now() + "-" + cleanName);

//     }

// });


// const upload = multer({
//     storage: storage
// });



// // Send Email Function

// async function sendEmail(data){

//     const {
//         senderName,
//         senderEmail,
//         appPassword,
//         applicantName,
//         trn,
//         toEmail,
//         filePath,
//         originalFileName
//     } = data;



//     const transporter = nodemailer.createTransport({

//         service:"gmail",

//         auth:{
//             user: senderEmail,
//             pass: appPassword
//         }

//     });



//     const mailOptions = {

//         from:`"${senderName}" <${senderEmail}>`,

//         to:toEmail,

//         subject:`Request to Review Visa Draft – ${applicantName}`,

//         text:
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

//         attachments: filePath ? [
//             {
//                 filename: originalFileName,
//                 path:filePath
//             }
//         ] : []

//     };


//     await transporter.sendMail(mailOptions);

// }





// // API

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



// const filePath = req.file 
// ? req.file.path 
// : null;


// const originalFileName = req.file
// ? req.file.originalname
// : null;



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



// // delete uploaded file

// if(filePath){

//     fs.unlinkSync(filePath);

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





// app.listen(3000,"0.0.0.0",()=>{

// console.log(
// "Server running on http://localhost:3000"
// );

// });
const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("public"));


// ======================
// Upload Setup
// ======================

const uploadFolder = "uploads";

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}


const storage = multer.diskStorage({

    destination:(req,file,cb)=>{
        cb(null, uploadFolder);
    },


    filename:(req,file,cb)=>{

        const cleanName =
        file.originalname.replace(/\s+/g,"_");

        cb(
            null,
            Date.now()+"-"+cleanName
        );

    }

});


const upload = multer({
    storage
});



// ======================
// Email Function
// ======================

async function sendEmail({

    senderName,
    senderEmail,
    appPassword,

    applicantName,
    trn,

    toEmail,

    filePath,
    originalFileName

}){


const transporter =
nodemailer.createTransport({

    service:"gmail",

    auth:{
        user:senderEmail,
        pass:appPassword
    }

});



const mailOptions = {


    from:
    `"${senderName}" <${senderEmail}>`,


    to:
    toEmail,


    subject:
    `Request to Review Visa Draft – ${applicantName}`,


    text:

`
Dear RMA,

Could you please review the visa draft for ${applicantName}
(Transaction Reference No.: ${trn})
and let me know if it is ready for lodgment?

I would appreciate your confirmation so I can proceed accordingly.

Thank you for your assistance.

Best regards,

${senderName}
`,


attachments:

filePath ?

[
{
    filename:originalFileName,
    path:filePath
}
]

:

[]

};



await transporter.sendMail(mailOptions);


}





// ======================
// API Route
// ======================


app.post(
"/submit",
upload.single("pdf"),

async(req,res)=>{


try{


const {

senderName,
senderEmail,
appPassword,

applicantName,
trn,

toEmail


}=req.body;



const filePath =
req.file
?
req.file.path
:
null;



const originalFileName =
req.file
?
req.file.originalname
:
null;



await sendEmail({

senderName,
senderEmail,
appPassword,

applicantName,
trn,

toEmail,

filePath,
originalFileName

});



// Delete file after sending

if(filePath){

fs.unlinkSync(filePath);

}



res.json({

success:true

});



}

catch(error){


console.log(error);


res.json({

success:false,

error:error.message

});


}


});




// ======================
// Server
// ======================

app.listen(
process.env.PORT || 3000,
"0.0.0.0",

()=>{

console.log(
`Server running on http://localhost:${process.env.PORT || 3000}`
);

});