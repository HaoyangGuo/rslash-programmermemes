import express, { Router, Request, Response } from "express";
import cloudinary from "./cloudinary";
import upload from "./upload";
import { imageUploadErrorHandler } from "./imageUploadErrorHandler";

const imageRouter = Router();

imageRouter.post(
	"/upload-image",
	upload.single("image"),
	imageUploadErrorHandler,
	async (req: Request, res: Response) => {
		try {
			const response = await cloudinary.uploader.upload(req.file!.path, {
				upload_preset: "r-slash-programmermemes",
				quality: 50,
			});
			res.json({
				url: response.secure_url,
				public_id: response.public_id,
			});
		} catch (err) {
			res.json({
				errors: [
					{
						message: "error uploading image: " + err,
					},
				],
			});
		}
	}
);

imageRouter.post(
	"/delete-image",
	express.json(),
	async (req: Request, res: Response) => {
		try {
			console.log("body: ", req.body)
			const response = await cloudinary.uploader.destroy(req.body.public_id);
			res.json({
				message: response.result,
			});
		} catch (err) {
			res.json({
				errors: [
					{
						message: "Error uploading image",
					},
				],
			});
		}
	}
);

export default imageRouter;
