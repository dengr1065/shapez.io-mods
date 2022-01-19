/* eslint-disable */
const { DefinePlugin } = require("webpack");
const fs = require("fs");
const path = require("path");
const modAuthor = require("./package.json").author;

const config = {
    entry: {},
    output: {
        path: path.resolve("./build/"),
        filename: "[name].mod.js"
    },
    module: {
        rules: [
            { test: /\.css$/, use: ["to-string-loader", "css-loader"] },
            { test: /\.(png|svg)$/, type: "asset/inline" }
        ]
    },
    plugins: [
        new DefinePlugin({
            registerMod: `((cls, info) => {
                info.author = ${JSON.stringify(modAuthor)};
                delete info["entry"];
                window.$shapez_registerMod(cls, info);
            })`
        })
    ]
};

generateEntries(
    fs
        .readdirSync("./src")
        .filter((dir) => fs.existsSync(path.join("./src", dir, "mod.json")))
);

if (fs.existsSync("./types.d.ts")) {
    const types = fs.readFileSync("./types.d.ts", "utf-8");
    const modules = types
        .split(/declare\smodule\s"/gm)
        .map((m) => m.slice(0, m.indexOf('"')))
        .join("|");

    const regex = new RegExp(`import {(.*?)} from "(${modules})";`, "gm");
    config.module.rules.push({
        test: /\.js$/,
        loader: "string-replace-loader",
        options: {
            search: regex,
            replace: (_, imports) => `const {${imports}} = shapez;`
        },
        exclude: /node_modules/
    });
} else {
    console.warn("Failed to find types.d.ts, imports won't be mapped.");
}

function generateEntries(mods) {
    for (const dir of mods) {
        const jsonPath = path.resolve("./src", dir, "mod.json");
        const { entry } = require(jsonPath);

        config.entry[dir] = path.resolve("./src", dir, entry);
    }
}
module.exports = config;
