import {
	ArrowLeftIcon,
	CommandLineIcon,
} from "@heroicons/react/24/outline";
import { NextPage } from "next";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/router";
import { useForgotPasswordMutation } from "../generated/graphql";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import Link from "next/link";

type forgotPasswordFormValues = {
	email: string;
};

const ForgotPassword: NextPage = () => {
	const router = useRouter();
	const [{ fetching }, forgotPassword] = useForgotPasswordMutation();

	const [showEmailSentMessage, setShowEmailSentMessage] = React.useState(false);

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<forgotPasswordFormValues>({});
	const onSubmit: SubmitHandler<forgotPasswordFormValues> = async (values) => {
		await forgotPassword({ email: values.email });
		setShowEmailSentMessage(true);
	};

	return (
		<div className="h-screen">
			<div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-sm space-y-8">
					<div>
						<Link
							href={"/"}
							className="flex items-center w-min mb-12 text-sm py-1 px-2 rounded-full hover:cursor-pointer border border-orange-600 text-orange-600"
						>
							<ArrowLeftIcon className="w-4 h-4" />
							Home
						</Link>
						<div className="flex justify-center items-center">
							<CommandLineIcon className="w-12 h-12 text-orange-600" />
							<div className="text-3xl ml-1">r/programmermemes</div>{" "}
						</div>
						<h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
							Forget Password?
						</h2>
					</div>
					{!showEmailSentMessage ? (
						<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
							<div className="space-y-2 rounded-md shadow-sm">
								<div className="box-content">
									<label htmlFor="email" className="sr-only">
										Email
									</label>
									<input
										{...register("email", {
											required: {
												value: true,
												message: "please enter your email",
											},
										})}
										id="email"
										name="email"
										required
										type="email"
										className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm focus:ring-1"
										placeholder="Email"
									/>
								</div>
							</div>
							<div>
								<button
									type="submit"
									disabled={isSubmitting || fetching}
									className="rounded-full group relative flex w-full justify-center border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
								>
									Send reset password link to your email
								</button>
							</div>
						</form>
					) : (
						<div className="flex items-center justify-center">
							<div className="text-sm">
								<div className="font-medium">
									An email has been sent to your email address. Please use the
									link in the email to reset your password.
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: false })(ForgotPassword);
