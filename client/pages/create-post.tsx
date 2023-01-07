import React from "react";
import { NextPage } from "next";
import { SubmitHandler, useForm } from "react-hook-form";
import {
	ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useCreatePostMutation } from "../generated/graphql";
import { useRouter } from "next/router";
import { useIsAuth } from "../utils/useIsAuth";
import Link from "next/link";


type createPostFormValues = {
	title: string;
	text: string;
	image: FileList;
};

const CreatePost: NextPage<{}> = () => {
	useIsAuth();

	const [, createPost] = useCreatePostMutation();
	const router = useRouter();

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<createPostFormValues>({});
	const onSubmit: SubmitHandler<createPostFormValues> = async (values) => {
		const imageFormData = new FormData();
		imageFormData.append("image", values.image[0]);
		const imageUploadResponse = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/rest/upload-image`,
			{
				method: "POST",
				body: imageFormData,
			}
		).then((res) => res.json());

		if (imageUploadResponse.errors) {
			setError("image", {
				message: imageUploadResponse.errors[0].message,
			});
			return;
		} else if (!imageUploadResponse.url || !imageUploadResponse.public_id) {
			setError("image", {
				message: "something went wrong while uploading the image",
			});
			return;
		}

		const { error } = await createPost({
			input: {
				title: values.title,
				text: values.text,
				imageUrl: imageUploadResponse.url,
				imagePublicId: imageUploadResponse.public_id,
			},
		});
		if (!error) {
			router.push("/");
		}
	};

	return (
		<div className="h-screen">
			<div className="sm:bg-gray-100 h-full">
				<div className="max-w-md mx-auto">
					<div className="pt-24 2xl:pt-28 mb-5">
						<h2 className="mt-6 text-center text-2xl tracking-tight text-gray-900 font-medium">
							Create Post
						</h2>
					</div>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="sm:shadow sm:overflow-hidden sm:rounded-md">
							<div className="space-y-6 bg-white px-4 py-5 sm:p-6">
								<div className="grid grid-cols-3 gap-6">
									<div className="col-span-3">
										<label
											htmlFor="title"
											className="block text-sm font-medium text-gray-700"
										>
											Title
										</label>
										<div className="mt-1 flex rounded-md shadow-sm">
											<input
												{...register("title", {
													required: {
														value: true,
														message: "please enter a title",
													},
												})}
												type="text"
												name="title"
												id="title"
												className="block w-full flex-1 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
											/>
										</div>
									</div>
								</div>

								<div>
									<label
										htmlFor="text"
										className="block text-sm font-medium text-gray-700"
									>
										Text
									</label>
									<div className="mt-1">
										<textarea
											{...register("text", {
												required: {
													value: true,
													message: "please enter some text",
												},
											})}
											id="text"
											name="text"
											rows={3}
											className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
										/>
									</div>
									<p className="mt-2 text-sm text-gray-500">
										Additional information (such as source, etc.) of the meme.
									</p>
								</div>

								<div className="grid grid-cols-3 gap-6">
									<div className="col-span-3">
										<label
											htmlFor="image"
											className="block text-sm font-medium text-gray-700"
										>
											Meme
										</label>
										<div className="mt-1 flex rounded-md shadow-sm">
											<input
												{...register("image", {
													required: {
														value: true,
														message: "please upload a meme",
													},
													validate: {
														checkSize: (value) => {
															return (
																(value && value[0].size <= 5000000) ||
																"image is too large"
															);
														},
														checkType: (value) => {
															return (
																(value &&
																	(value[0].type === "image/jpeg" ||
																		value[0].type === "image/png" ||
																		value[0].type === "image/jpg")) ||
																"meme must be a jpg or png"
															);
														},
													},
												})}
												type="file"
												name="image"
												id="image"
												className="block w-full bg-gray-100 file:h-9 file:w-32 file:border-0 file:bg-orange-600 file:rounded-md file:outline-none outline-none file:text-white file:mr-5 file:cursor-pointer file:text-sm text-sm rounded-md focus:outline-orange-600"
											/>
										</div>
										<div className="text-gray-500 text-sm mt-2">PNG or JPG</div>
									</div>
								</div>
							</div>
							<div className="px-6 py-1 bg-white w-full">
								{errors.title && (
									<p className="text-orange-700 h-min flex items-center gap-2">
										<ExclamationCircleIcon className="w-5 h-5" />
										<span>{errors.title.message}</span>
									</p>
								)}
								{errors.text && (
									<p className="text-orange-700 h-min flex items-center gap-2">
										<ExclamationCircleIcon className="w-5 h-5" />
										<span>{errors.text.message}</span>
									</p>
								)}
								{errors.image && (
									<p className="text-orange-700 h-min flex items-center gap-2">
										<ExclamationCircleIcon className="w-5 h-5" />
										<span>{errors.image.message}</span>
									</p>
								)}
							</div>
							<div className="sm:bg-gray-50 px-4 py-4 text-right sm:px-6">
								{!isSubmitting && (
									<Link
										href={"/"}
										className="inline-flex justify-center rounded-full border border-orange-600 py-2 w-28 text-sm font-medium text-orange-600 mr-4"
									>
										<span>Cancel</span>
									</Link>
								)}
								{!isSubmitting ? (
									<button
										type="submit"
										disabled={isSubmitting}
										className="inline-flex justify-center rounded-full border border-transparent bg-orange-600 py-2 w-28 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
									>
										<span>Create Post</span>
									</button>
								) : (
									<div className="inline-flex justify-center rounded-full border border-transparent bg-orange-700 py-2 w-28 text-sm font-medium text-white shadow-sm">
										<span>Creating Post...</span>
									</div>
								)}
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: false })(CreatePost);
