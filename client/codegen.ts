import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	overwrite: true,
	schema: "http://localhost:4000/graphql",
	documents: "./graphql/**/*.*",
	generates: {
		"./generated/graphql.tsx": {
			plugins: ["typescript", "typescript-operations", "typescript-urql"],
			config: {
				noSchemaStitching: true,
			},
		},
	},
};

export default config;
