import { Form, useActionData, useTransition } from "@remix-run/react";
import { ActionArgs, json, redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { createPost } from "~/models/post.server";

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export const action = async ({ request }: ActionArgs) => {
    await new Promise((res) => setTimeout(res, 3000))
    const formData = await request.formData()

    const title = formData.get("title")
    const slug = formData.get("slug")
    const markdown = formData.get("markdown")
    const errors = {
        title: title ? null : "Title is required",
        slug: slug ? null : "Slug is required",
        markdown: markdown ? null : "Markdown is required",
    }

    const hasErrors = Object.values(errors).some(
        (errorMessage) => errorMessage
    )

    if (hasErrors) {
        return json(errors)
    }

    invariant(
        typeof title === "string",
        "title must be a string"
    );
    invariant(
        typeof slug === "string",
        "slug must be a string"
    );
    invariant(
        typeof markdown === "string",
        "markdown must be a string"
    );

    await createPost({ title, slug, markdown })

    return redirect("/posts/admin")
}

export default function NewPost() {
    const transition = useTransition();
    const isCreating = Boolean(transition.submission)
    const errors = useActionData<typeof action>();
    const validateError = (error: string | null | undefined) => {
        return (
            <p>{error ? (
                <em className="text-red-600">{error}</em>
            ) : null}
            </p>
        )
    }

    return (
        <Form method="post">
            {validateError(errors?.title)}
            <p>
                <label>
                    Post Titles:{" "}
                    <input
                        type="text"
                        name="title"
                        className={inputClassName}
                    />
                </label>
            </p>
            {validateError(errors?.slug)}
            <p>
                <label>
                    Post Slug:{" "}
                    <input
                        type="text"
                        name="slug"
                        className={inputClassName}
                    />
                </label>
            </p>
            {validateError(errors?.markdown)}
            <p>
                <label htmlFor="markdown">Markdown:</label>
                <br />
                <textarea
                    id="markdown"
                    rows={20}
                    name="markdown"
                    className={`${inputClassName} font-mono`}
                />
            </p>
            <p className="text-right">
                <button
                    disabled={isCreating}
                    type="submit"
                    className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
                >
                    {isCreating ? "Wait..." : "Create Post"}
                </button>
            </p>
        </Form>
    );
}