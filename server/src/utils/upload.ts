import multer = require("multer");
import path = require("path");

const upload = multer({
	storage: multer.diskStorage({}),
	fileFilter: (_req, file, next) => {
		let ext = path.extname(file.originalname).toLowerCase();
		if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
			return next(new Error("unsupported"));
		}
		return next(null, true);
	},
});

export default upload;