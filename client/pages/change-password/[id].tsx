import {
	ArrowLeftIcon,
	CommandLineIcon,
	ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { NextPage } from "next";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/router";
import { useChangePasswordMutation } from "../../generated/graphql";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import Link from "next/link";

type changePasswordFormValues = {
	newPassword: string;
};

const ChangePassword: NextPage<{}> = () => {
	const router = useRouter();
	const [, changePassword] = useChangePasswordMutation();
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<changePasswordFormValues>({});
	const onSubmit: SubmitHandler<changePasswordFormValues> = async (values) => {

		const response = await changePassword({
			newPassword: values.newPassword,
			token: typeof router.query.id === "string" ? router.query.id : "",
		});
		if (response.data?.changePassword.errors) {
			response.data.changePassword.errors.forEach((error) => {
				setError(error.field as any, {
					message: error.message,
				});
			});
		} else if (response.data?.changePassword.user) {
			router.push("/");
		}
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
							Change Password
						</h2>
					</div>
					<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
						<div className="space-y-2 rounded-md shadow-sm">
							<div className="box-content">
								<label htmlFor="newPassword" className="sr-only">
									New Password:
								</label>
								<input
									{...register("newPassword", {
										required: {
											value: true,
											message: "please enter your new password",
										},
									})}
									id="newPassword"
									name="newPassword"
									required
									type="password"
									className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm focus:ring-1"
									placeholder="New Password"
								/>
							</div>
						</div>
						<div className="leading-tight text-sm">
							{errors.newPassword && (
								<p className="text-orange-700 h-min flex items-center gap-2">
									<ExclamationCircleIcon className="w-5 h-5" />
									<span>{errors.newPassword.message}</span>
								</p>
							)}
						</div>
						<div>
							<button
								type="submit"
								disabled={isSubmitting}
								className="group relative flex w-full justify-center rounded-full border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
							>
								Set new password
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: false })(ChangePassword);
