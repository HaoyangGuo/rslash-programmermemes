import React from "react";
import {
	LockClosedIcon,
	CommandLineIcon,
	ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRegisterMutation } from "../generated/graphql";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

interface registerProps {}

type registerFormValues = {
	username: string;
	email: string;
	password: string;
};

const Register: React.FC<registerProps> = () => {
	const [, registerUser] = useRegisterMutation();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<registerFormValues>({});
	const onSubmit: SubmitHandler<registerFormValues> = async (values) => {
		const response = await registerUser({options: values});
		if (response.data?.register.errors) {
			response.data.register.errors.forEach((error) => {
				setError(error.field as any, {
					message: error.message,
				});
			});
		} else if (response.data?.register.user) {
			router.push("/");
		}
	};

	return (
		<div className="h-screen">
			<div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-sm space-y-8">
					<div>
						<div className="flex justify-center items-center">
							<CommandLineIcon className="w-12 h-12 text-orange-600" />
							<div className="text-3xl ml-2">r/programmermemes</div>{" "}
						</div>
						<h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
							Register
						</h2>
					</div>
					<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
						<div className="space-y-2 rounded-md shadow-sm">
							<div>
								<label htmlFor="username">
									Username:
								</label>
								<input
									{...register("username", {
										required: { value: true, message: "username is required" },
										minLength: {
											value: 3,
											message: "username must be at least 3 characters",
										},
									})}
									id="username"
									name="username"
									required
									className="mt-1 rounded-sm relative block w-full appearance-none border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm focus:ring-1"
									placeholder="Username"
								/>
							</div>
							<div>
								<label htmlFor="email">
									Email:
								</label>
								<input
									{...register("email", {
										required: { value: true, message: "email is required" },
										minLength: {
											value: 3,
											message: "email must be at least 3 characters",
										},
									})}
									id="email"
									name="email"
									required
									type="email"
									className="mt-1 rounded-sm relative block w-full appearance-none border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm focus:ring-1"
									placeholder="Email"
								/>
							</div>
							<div>
								<label htmlFor="password">
									Password:
								</label>
								<input
									{...register("password", {
										required: { value: true, message: "password is required" },
										minLength: {
											value: 6,
											message: "password must be at least 6 characters",
										},
									})}
									id="password"
									name="password"
									type="password"
									required
									className="mt-1 rounded-sm relative block w-full appearance-none border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
									placeholder="Password"
								/>
							</div>
						</div>

						{/* <div className="flex items-center justify-between">
									<div className="flex items-center">
										<input
											id="remember-me"
											name="remember-me"
											type="checkbox"
											className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
										/>
										<label
											htmlFor="remember-me"
											className="ml-2 block text-sm text-gray-900"
										>
											Remember me
										</label>
									</div>

									<div className="text-sm">
										<a
											href="#"
											className="font-medium text-orange-600 hover:text-orange-500"
										>
											Forgot your password?
										</a>
									</div>
								</div> */}
						<div className="leading-tight text-sm">
							{errors.username && (
								<p className="text-orange-700 h-min flex items-center gap-2">
									<ExclamationCircleIcon className="w-5 h-5" />
									<span>{errors.username.message}</span>
								</p>
							)}
							{errors.password && (
								<p className="text-orange-700 h-min flex items-center gap-2">
									<ExclamationCircleIcon className="w-5 h-5" />
									<span>{errors.password.message}</span>
								</p>
							)}
						</div>
						<div>
							<button
								type="submit"
								disabled={isSubmitting}
								className="group relative flex w-full justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
							>
								<span className="absolute inset-y-0 left-0 flex items-center pl-3">
									<LockClosedIcon
										className="h-5 w-5 text-orange-500 group-hover:text-orange-400"
										aria-hidden="true"
									/>
								</span>
								Register
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Register);
