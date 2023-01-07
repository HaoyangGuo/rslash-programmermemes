import React from "react";
import {
	LockClosedIcon,
	CommandLineIcon,
	ExclamationCircleIcon,
	ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { SubmitHandler, useForm } from "react-hook-form";
import { useLoginMutation } from "../generated/graphql";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { NextPage } from "next";
import Link from "next/link";

type loginFormValues = {
	usernameOrEmail: string;
	password: string;
};

const Login: NextPage = () => {
	const [, loginUser] = useLoginMutation();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<loginFormValues>({});
	const onSubmit: SubmitHandler<loginFormValues> = async (values) => {
		const response = await loginUser(values);
		if (response.data?.login.errors) {
			response.data.login.errors.forEach((error) => {
				setError(error.field as any, {
					message: error.message,
				});
			});
		} else if (response.data?.login.user) {
			if (typeof router.query.next === "string") {
				router.push(router.query.next);
			} else {
				router.push("/");
			}
		}
	};

	return (
		<div className="h-screen">
			<div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-sm space-y-8 -mt-20">
					<div>
						<Link
							href={"/"}
							className="flex items-center w-min mb-12 text-sm py-1 px-2 rounded-full hover:cursor-pointer border border-orange-600 text-orange-600"
						>
							<ArrowLeftIcon className="w-4 h-4" />
							Home
						</Link>
						<div className="flex justify-center items-center">
							<CommandLineIcon className="w-10 h-10 mr-1 text-orange-600" />
							<div className="text-3xl">r/ProgrammerMemes</div>{" "}
						</div>
						<h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
							Log In
						</h2>
					</div>
					<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
						<div className="-space-y-px rounded-md shadow-sm">
							<div className="box-content">
								<label htmlFor="usernameOrEmail" className="sr-only">
									Username or Email:
								</label>
								<input
									{...register("usernameOrEmail", {
										required: {
											value: true,
											message: "please enter your username or email",
										},
									})}
									id="usernameOrEmail"
									name="usernameOrEmail"
									required
									className="relative block w-full appearance-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm focus:ring-1"
									placeholder="Username or Email"
								/>
							</div>
							<div>
								<label htmlFor="password" className="sr-only">
									Password:
								</label>
								<input
									{...register("password", {
										required: {
											value: true,
											message: "please enter your password",
										},
									})}
									id="password"
									name="password"
									type="password"
									required
									className="relative block w-full appearance-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm"
									placeholder="Password"
								/>
							</div>
						</div>
						<div className="leading-tight text-sm">
							{errors.usernameOrEmail && (
								<p className="text-orange-700 h-min flex items-center gap-2">
									<ExclamationCircleIcon className="w-5 h-5" />
									<span>{errors.usernameOrEmail.message}</span>
								</p>
							)}
							{errors.password && (
								<p className="text-orange-700 h-min flex items-center gap-2">
									<ExclamationCircleIcon className="w-5 h-5" />
									<span>{errors.password.message}</span>
								</p>
							)}
						</div>
						<div className="flex items-center justify-center">
							<div className="text-sm">
								<Link
									href="/forgot-password"
									className="font-medium text-orange-600 hover:text-orange-500"
								>
									Forgot your password?
								</Link>
							</div>
						</div>
						<div>
							<button
								type="submit"
								disabled={isSubmitting}
								className="group relative flex w-full justify-center rounded-full border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
							>
								<span className="absolute inset-y-0 left-0 flex items-center pl-3">
									<LockClosedIcon
										className="h-5 w-5 text-orange-500 group-hover:text-orange-400"
										aria-hidden="true"
									/>
								</span>
								Log In
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Login);
