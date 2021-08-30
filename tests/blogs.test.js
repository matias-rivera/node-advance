const Page = require("./helpers/page");
let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto("http://localhost:3000");
});

afterEach(async () => {
    await page.close();
});

describe("While logged in", async () => {
    beforeEach(async () => {
        await page.login();
        await page.click("a.btn-floating");
    });

    test("Can see blog create form", async () => {
        const label = await page.getContentOf("form label");
        expect(label).toEqual("Blog Title");
    });

    describe("And using valid inputs", async () => {
        beforeEach(async () => {
            await page.type(".title input", "My Title");
            await page.type(".content input", "My Content");
            await page.click("form button");
        });

        test("Submitting takes user to review screen", async () => {
            const text = await page.getContentOf("h5");

            expect(text).toEqual("Please confirm your entries");
        });

        test("Submitting then saving adds blog to index page", async () => {
            await page.click("button.green");
            await page.waitFor(".card");

            const title = await page.getContentOf(".card-title");
            const content = await page.getContentOf("p");

            expect(title).toEqual("My Title");
            expect(content).toEqual("My Content");
        });
    });

    describe("And using invalid input", async () => {
        beforeEach(async () => {
            await page.click("form button");
        });

        test("The form shows an error message", async () => {
            const titleError = await page.getContentOf(".title .red-text");
            const contentError = await page.getContentOf(".content .red-text");

            expect(titleError).toEqual("You must provide a value");
            expect(contentError).toEqual("You must provide a value");
        });
    });
});

describe("User is not logged in", async () => {
    test("User cannot create blog posts", async () => {
        const result = await page.post("/api/blogs", {
            title: "T",
            content: "C",
        });

        expect(result).toEqual({ error: "You must log in!" });
    });

    test("User cannot read blog posts", async () => {
        const result = await page.get("/api/blogs");

        expect(result).toEqual({ error: "You must log in!" });
    });
});
