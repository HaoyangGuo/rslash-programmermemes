import { dedupExchange, fetchExchange } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from "../generated/graphql";

export const createUrqlClient = (ssrExchange: any) => ({
	url: "http://localhost:4000/graphql",
	exchanges: [
		dedupExchange,
		cacheExchange({
			updates: {
				Mutation: {
					login: (result: LoginMutation, _args, cache, _info) => {
						cache.updateQuery({ query: MeDocument }, (data: MeQuery | null) => {
							if (result.login.errors) {
								return data;
							} else {
								return {
									me: result.login.user,
								};
							}
						});
					},
					register: (result: RegisterMutation, _args, cache, _info) => {
						cache.updateQuery({ query: MeDocument }, (data: MeQuery | null) => {
							if (result.register.errors) {
								return data;
							} else {
								return {
									me: result.register.user,
								};
							}
						});
					},
					logout: (_result, _args, cache, _info) => {
						cache.updateQuery({ query: MeDocument }, (data: MeQuery | null) => {
							return {
								me: null,
							};
						});
					},
				},
			},
		}),
		ssrExchange,
		fetchExchange,
	],
	fetchOptions: {
		credentials: "include",
	} as const,
});
