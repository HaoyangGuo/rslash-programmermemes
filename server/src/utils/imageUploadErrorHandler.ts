import { NextFunction, Request, Response } from "express";

export const imageUploadErrorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (err || !req.file) {
		if (err.message === "unsupported") {
			return res.json({
				errors: [
					{
						message: "unsupported file type!",
					},
				],
			});
		} else {
			return res.json({
				errors: [
					{
						message: "error uploading image: " + err,
					},
				],
			});
		}
	} else {
		return next();
	}
};
