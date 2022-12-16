import { UsernamePasswordInput } from "src/utils/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
	if (options.username.length < 3) {
		return [
			{
				field: "username",
				message: "username must contain at least 3 characters",
			},
		];
	}

	if (options.username.includes("@")) {
		return [
			{
				field: "username",
				message: "username cannot contain @",
			},
		];
	}

	if (!options.email.includes("@")) {
		return [
			{
				field: "email",
				message: "invalid email",
			},
		];
	}

	if (options.password.length < 6) {
		return [
			{
				field: "password",
				message: "password must contain at least 6 characters",
			},
		];
	}

	return null;
};
