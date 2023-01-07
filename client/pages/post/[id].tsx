import React from "react";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import {
	useCancelVoteMutation,
	useDeletePostMutation,
	useMeQuery,
	usePostQuery,
	useVoteMutation,
} from "../../generated/graphql";
import NavBar from "../../components/NavBar";
import {
	XMarkIcon,
	PencilSquareIcon,
	TrashIcon,
	ChevronDownIcon,
	ChevronUpIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import NaturalPostImage from "../../components/NaturalPostImage";
import { isServer } from "../../utils/isServer";

type MeData = {
	id: number;
	username: string;
	__typename?: "User" | undefined;
};

const PostPage = () => {
	const router = useRouter();
	const intId =
		typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
	const [{ data, fetching, error }] = usePostQuery({
		pause: intId === -1,
		variables: {
			id: intId,
		},
	});
	const [{ fetching: voteFetching }, vote] = useVoteMutation();
	const [{ fetching: cancelVoteFetching }, cancelVote] =
		useCancelVoteMutation();
	const [{ fetching: deleteFetching }, deletePost] = useDeletePostMutation();
	const [{ data: meData, fetching: meFetching }] = useMeQuery({
		pause: isServer(),
	});

	const handleDeletePost = async (
		id: number,
		imagePublicId: string | undefined
	) => {
		router.push("/");
		await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rest/delete-image`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				public_id: imagePublicId,
			}),
		});
		deletePost({ id });
	};

	if (fetching) {
		return (
			<div className="h-screen w-screen flex flex-col">
				<NavBar pageProps={undefined} />
				<div className="h-[calc(100vh-4rem)] w-full flex justify-center items-center">
					Loading...
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="h-screen w-screen flex flex-col">
				<NavBar pageProps={undefined} />
				<h1 className="h-[calc(100vh-4rem)] w-full flex justify-center items-center">
					{error.message}
				</h1>
			</div>
		);
	}

	if (!data?.post) {
		return (
			<div className="h-screen w-screen flex flex-col">
				<NavBar pageProps={undefined} />
				<h1 className="h-[calc(100vh-4rem)] w-full flex justify-center items-center">
					404: Could not find post
				</h1>
			</div>
		);
	}

	return (
		<div>
			<NavBar pageProps={undefined} />
			<div className="bg-gray-100 min-h-[calc(100vh-4rem)] ">
				<div className="max-w-3xl mx-auto bg-orange-600 border-b h-12 flex justify-end px-5 items-center">
					<Link href={"/"} className="py-2 flex items-center text-white">
						<XMarkIcon className="w-5 h-5 mr-1px" />
						Close
					</Link>
				</div>
				<div className="shadow-lg max-w-3xl mx-auto bg-white flex">
					<div className="w-12 sm:w-16 bg-gray-50 rounded-l-lg flex flex-col items-center pt-2">
					 	<button
							disabled={voteFetching || cancelVoteFetching || deleteFetching}
							onClick={() =>{
								if (data!.post!.voteStatus === 1) {
									cancelVote({
										postId: data!.post!.id,
										value: 1,
									});
									return;
								}
								vote({
									postId: data!.post!.id,
									value: 1,
								});
							}}
							className={`hover:bg-gray-200 group w-8 h-8 flex items-center justify-center ${
								data.post.voteStatus === 1
									? "bg-gray-200 hover:bg-gray-300"
									: undefined
							}`}
						>
							<ChevronUpIcon
								className={`w-5 h-5 [&>path]:stroke-[3.5px] text-gray-400 group-hover:text-orange-600 ${
									data.post.voteStatus === 1 ? "text-red-500" : undefined
								}`}
							/>
						</button>
						<div className="text-center text-sm w-full py-1">
							{data.post.points}
						</div>
						<button
							disabled={voteFetching || cancelVoteFetching || deleteFetching}
							onClick={() => {
								if (data!.post!.voteStatus === -1) {
									cancelVote({
										postId: data!.post!.id,
										value: -1,
									});
									return;
								}
								vote({
									postId: data!.post!.id,
									value: -1,
								});
							}}
							className={`hover:bg-gray-200 group w-8 h-8 flex items-center justify-center ${
								data.post.voteStatus === -1
									? "bg-gray-200 hover:bg-gray-300"
									: undefined
							}`}
						>
							<ChevronDownIcon
								className={`w-5 h-5 [&>path]:stroke-[3.5px] text-gray-400 group-hover:text-blue-600 ${
									data.post.voteStatus === -1 ? "text-blue-600" : undefined
								}`}
							/>
						</button>
					</div>
					<div className="w-full">
						<div className="mx-4 mt-2.5">
							<div>
								<div className=" text-sm text-gray-500">
									Posted by {data.post.creator.username}
								</div>
							</div>
							<h1 className="text-xl mb-2">{data.post.title}</h1>
							<NaturalPostImage imageUrl={data.post.imageUrl} />
							<div className="mt-2">{data.post.text}</div>
							<div className="h-8 mb-1 text-sm text-gray-500 mt-4">
								{meData?.me?.id === data.post.creator.id ? (
									<div className="flex items-center justify-end gap-2">
										<Link
											href={`/post/edit/${encodeURIComponent(data.post.id)}`}
											style={{
												pointerEvents:
													voteFetching || cancelVoteFetching || deleteFetching
														? "none"
														: "auto",
											}}
											className="flex group justify-center items-center p-1 hover:bg-gray-200 rounded"
										>
											<PencilSquareIcon className="w-4 h-4" />
											<div className="">Edit Post</div>
										</Link>
										<button
											disabled={
												voteFetching || cancelVoteFetching || deleteFetching
											}
											onClick={() =>
												handleDeletePost(
													data!.post!.id,
													data?.post?.imagePublicId
												)
											}
											className="flex group justify-center items-center p-1 hover:bg-gray-200 rounded"
										>
											<TrashIcon className="w-4 h-4" />
											<div className="">Delete Post</div>
										</button>
									</div>
								) : null}
							</div>
							<div className="border-b mb-10 border-gray-300"></div>
							<div className="h-52 border-dashed rounded-lg border border-gray-300 text-gray-300 flex justify-center items-center">
								Comment section coming soon :&#41;
							</div>
							<div className="h-10"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(PostPage);
