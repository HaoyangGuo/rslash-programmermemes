import React from "react";
import NaturalPostImage from "./NaturalPostImage";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import {
	PostSnippetFragment,
	useCancelVoteMutation,
	useVoteMutation,
} from "../generated/graphql";
import Link from "next/link";

type PostProps = {
	post: PostSnippetFragment;
};

const Post: React.FC<PostProps> = ({ post }) => {
	const [{ fetching }, vote] = useVoteMutation();
	const [{ fetching: cancelVoteFetching }, cancelVote] =
		useCancelVoteMutation();
	return (
		<div className="bg-white rounded shadow flex flex-row border-[1px] border-gray-300 hover:border-gray-400 hover:cursor-pointer">
			<div className="w-12 sm:w-16 bg-gray-50 rounded-l-lg flex flex-col items-center pt-2">
				<button
					disabled={fetching || cancelVoteFetching}
					onClick={() => {
						if (post.voteStatus === 1) {
							cancelVote({
								postId: post.id,
								value: 1,
							});
							return;
						}
						vote({
							postId: post.id,
							value: 1,
						});
					}}
					className={`hover:bg-gray-200 group w-8 h-8 flex items-center justify-center ${
						post.voteStatus === 1 ? "bg-gray-200 hover:bg-gray-300" : undefined
					}`}
				>
					<ChevronUpIcon
						className={`w-5 h-5 [&>path]:stroke-[3.5px] text-gray-400 group-hover:text-orange-600 ${
							post.voteStatus === 1 ? "text-red-500" : undefined
						}`}
					/>
				</button>
				<div className="text-center text-sm w-full py-1">{post.points}</div>
				<button
					disabled={fetching || cancelVoteFetching}
					onClick={() => {
						if (post.voteStatus === -1) {
							cancelVote({
								postId: post.id,
								value: -1,
							});
							return;
						}
						vote({
							postId: post.id,
							value: -1,
						});
					}}
					className={`hover:bg-gray-200 group w-8 h-8 flex items-center justify-center ${
						post.voteStatus === -1 ? "bg-gray-200 hover:bg-gray-300" : undefined
					}`}
				>
					<ChevronDownIcon
						className={`w-5 h-5 [&>path]:stroke-[3.5px] text-gray-400 group-hover:text-blue-600 ${
							post.voteStatus === -1 ? "text-blue-600" : undefined
						}`}
					/>
				</button>
			</div>
			<Link
				href={`/post/${encodeURIComponent(post.id)}`}
				className="flex flex-col w-full"
			>
				<div className="mt-2.5 ml-2 text-sm text-gray-500">
					Posted by {post.creator.username}
				</div>
				<div className="ml-2 sm:text-lg">{post.title}</div>
				<NaturalPostImage imageUrl={post.imageUrl} />
				<div className="h-8 text-sm text-gray-300 flex items-center mx-3"></div>
			</Link>
		</div>
	);
};

export default Post;
