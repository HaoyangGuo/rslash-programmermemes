import { dedupExchange, fetchExchange, stringifyVariables} from "urql";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import {
	CancelVoteMutationVariables,
	DeletePostMutationVariables,
	LoginMutation,
	MeDocument,
	MeQuery,
	RegisterMutation,
	VoteMutationVariables,
} from "../generated/graphql";
import { errorExchange } from "urql";
import Router from "next/router";
import gql from "graphql-tag";
import { isServer } from "./isServer";

const cursorPagination = (): Resolver => {
	return (_parent, fieldArgs, cache, info) => {
		const { parentKey: entityKey, fieldName } = info;
		const allFields = cache.inspectFields(entityKey);
		const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
		const size = fieldInfos.length;
		if (size === 0) {
			return undefined;
		}

		const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
		const isItInTheCache = cache.resolve(
			cache.resolveFieldByKey(entityKey, fieldKey) as string,
			"posts"
		);
		info.partial = !isItInTheCache;

		const result: string[] = [];
		let hasMore = true;

		fieldInfos.forEach((fi) => {
			const key = cache.resolve(entityKey, fi.fieldKey) as string;
			const data = cache.resolve(key, "posts") as string[];
			const _hasMore = cache.resolve(key, "hasMore");
			if (!_hasMore) {
				hasMore = _hasMore as boolean;
			}
			result.push(...data);
		});

		return {
			__typename: "PaginatedPosts",
			hasMore,
			posts: result,
		};
	};
};

const invalidateAllPosts = (cache: any) => {
	const allFields = cache.inspectFields("Query");
	const fieldInfos = allFields.filter((info: any) => info.fieldName === "posts");
	fieldInfos.forEach((fi: any) => {
		cache.invalidate("Query", "posts", fi.arguments || {});
	});
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
	let cookie = "";
	if (isServer() && ctx) {
		cookie = ctx.req.headers.cookie;
	}
	return {
		url: process.env.NEXT_PUBLIC_API_URL as string + "/graphql",
		exchanges: [
			errorExchange({
				onError: (error) => {
					if (error?.message.includes("not authenticated")) {
						Router.replace("/login");
					}
				},
			}),
			dedupExchange,
			cacheExchange({
				keys: {
					PaginatedPosts: () => null,
				},
				resolvers: {
					Query: {
						posts: cursorPagination(),
					},
				},
				updates: {
					Mutation: {
						deletePost: (_result, args, cache, _info) => {
							cache.invalidate({
								__typename: "Post",
								id: (args as DeletePostMutationVariables).id,
							});
						},
						vote: (_result, args, cache, _info) => {
							const { postId, value } = args as VoteMutationVariables;
							const data = cache.readFragment(
								gql`
									fragment _ on Post {
										id
										points
										voteStatus
									}
								`,
								{ id: postId } as any
							);
							if (data) {
								const newPoints =
									data.points + (!data.voteStatus ? 1 : 2) * value;
								cache.writeFragment(
									gql`
										fragment __ on Post {
											points
											voteStatus
										}
									`,
									{ id: postId, points: newPoints, voteStatus: value }
								);
							}
						},
						cancelVote: (_result, args, cache, _info) => {
							const { postId } = args as CancelVoteMutationVariables;
							const data = cache.readFragment(
								gql`
									fragment _ on Post {
										id
										points
										voteStatus
									}
								`,
								{ id: postId } as any
							);
							if (data) {
								const newPoints = data.points - data.voteStatus;
								cache.writeFragment(
									gql`
										fragment __ on Post {
											points
											voteStatus
										}
									`,
									{ id: postId, points: newPoints, voteStatus: null }
								);
							}
						},
						createPost: (_result, _args, cache, _info) => {
							invalidateAllPosts(cache);
						},
						login: (result: LoginMutation, _args, cache, _info) => {
							cache.updateQuery(
								{ query: MeDocument },
								(data: MeQuery | null) => {
									if (result.login.errors) {
										return data;
									} else {
										return {
											me: result.login.user,
										};
									}
								}
							);
							invalidateAllPosts(cache);
						},
						register: (result: RegisterMutation, _args, cache, _info) => {
							cache.updateQuery(
								{ query: MeDocument },
								(data: MeQuery | null) => {
									if (result.register.errors) {
										return data;
									} else {
										return {
											me: result.register.user,
										};
									}
								}
							);
						},
						logout: (_result, _args, cache, _info) => {
							cache.updateQuery(
								{ query: MeDocument },
								(data: MeQuery | null) => {
									return {
										me: null,
									};
								}
							);
						},
					},
				},
			}),
			ssrExchange,
			fetchExchange,
		],
		fetchOptions: {
			credentials: "include",
			headers: cookie ? { cookie } : undefined,
		} as const,
	};
};
