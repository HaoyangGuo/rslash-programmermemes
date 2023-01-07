import nodemailer from "nodemailer";
import "dotenv-safe/config";

export async function sendEmail(to: string, html: string) {
	let transporter = nodemailer.createTransport({
		service: "gmail",
		secure: false,
		auth: {
			user: process.env.EMAIL_ADDRESS,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	// send mail with defined transport object
	try {
		await transporter.sendMail({
			from: "r/ProgrammerMemes Support" + process.env.EMAIL_ADDRESS,
			to,
			subject: "Change password",
			text: "Please use the following link to change your password:" + html,
		});
	} catch (err) {
		console.log(err);
	}
}
