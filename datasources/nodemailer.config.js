const nodemailer = require("nodemailer");

// Créer un objet transporter pour envoyer les emails
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "skanderromdhani59@gmail.com",
        pass: "skander11032023"
    }
});

// Définir la fonction sendConfirmationEmail qui envoie un email de confirmation avec un lien d'activation
exports.sendConfirmationEmail = async (email, confirmationCode) => {
    try {
    // Créer le lien d'activation
        const activationLink = `http://localhost:4001/activate/${confirmationCode}`;

        // Envoyer l'email
        await transporter.sendMail({
            from: "skandergrami@gmail.com",
            to: email,
            subject: "Confirmation d'inscription",
            html: `Bonjour,<br><br>
      Merci de vous être inscrit sur notre site. Veuillez cliquer sur le lien suivant pour activer votre compte :<br>
      <a href="${activationLink}">${activationLink}</a><br><br>
      Cordialement,<br>
      L'équipe du site`
        });
    } catch (error) {
        console.log(error);
    }
};

// const nodemailer = require("nodemailer");

// const user = "skandergrami@gmail.com"; // hedhi t7ot feha l email
// const pass = "skander27699"; // houni lazmek ta3mel generation lel code hedha gmail apps

// const transport = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//         user,
//         pass
//     }
// });
// // fonction te5ou 3 parametres
// module.exports.sendConfirmationEmail = (
//     username,
//     email,
//     activationCode,
//     password
// ) => {
//     // transport houwa jesr from chkoun to amal  html body message chnouwa f wostou
//     transport
//         .sendMail({
//             from: user,
//             to: email,
//             subject: "Veuillez activer votre compte ",
//             html: `
//       <div>
//       <h1>Activation du compte </h1>
//         <h2>Bonjour ${username}</h2>
//         <p>Veuillez confirmer votre email en cliquant sur le lien suivant
// </p>
//         <a href=http://localhost:3000/confirm/${activationCode}>Cliquez ici
// </a>
// <ul>
// <li> votre nom d'utilisateur ${username}  </li>
// <li> votre mot de passe ${password}  </li>
// </ul>
//         </div>`
//         })
//         .catch((err) => console.log(err));
// };

// module.exports.sendResetPasswordEmail = (email, activationCode) => {
//     // transport houwa jesr from chkoun to amal  html body message chnouwa f wostou
//     transport
//         .sendMail({
//             from: user,
//             to: email,
//             subject: "Demande reinitialisation du mot de passe  ",
//             html: `
//       <div>
//       <h1> Réinitialisation du mot de passe </h1>

//         <p>reinitialiser votre  mot de passe en cliquant sur le lien suivant
// </p>
//         <a href=http://localhost:3000/reset_password/${activationCode}>Cliquez ici
// </a>

//         </div>`
//         })
//         .catch((err) => console.log(err));
// };

// module.exports.sendWinElectionEMail = (email) => {
//     // transport houwa jesr from chkoun to amal  html body message chnouwa f wostou
//     transport
//         .sendMail({
//             from: user,
//             to: email,
//             subject: "Résultat élection",
//             html: `
//       <div>
//       <h1> Vous avez ganger dans cette élection et vous serez syndic </h1>

//         <p>ous avez ganger dans cette élection et vous serez syndic
// </p>

//         </div>`
//         })
//         .catch((err) => console.log(err));
// };
