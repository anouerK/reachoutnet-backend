const nodemailer = require("nodemailer");

// Créer un objet transporter pour envoyer les emails
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "skandergrami@gmail.com",
        pass: "dordizexeosvibui"
    }
});

// Définir la fonction sendConfirmationEmail qui envoie un email de confirmation avec un lien d'activation
exports.sendConfirmationEmail = async (email, confirmationCode) => {
    try {
    // Créer le lien d'activation
        const activationLink = `http://localhost:3001/verification/${confirmationCode}`;
        //  const activationLink = `http://localhost:4001/graphql?query=mutation+{activate(activationCode:%22${confirmationCode}%22){id,email,is_verified}}`;

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
