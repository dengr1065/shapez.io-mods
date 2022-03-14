import { FILE_NOT_FOUND } from "platform/storage";
import { MOD_ID } from "./constants";

const FILE = MOD_ID + "_store.json";
export const defaultSettings = {
    showLibraryMods: false,
    lastViewedChangelogs: {}
};

/**
 * @param {import("platform/electron/storage").StorageImplElectron} storage
 */
export async function readSettings(storage) {
    try {
        const contents = await storage.readFileAsync(FILE);
        const object = JSON.parse(contents);

        for (const key in defaultSettings) {
            // set missing keys
            object[key] ??= defaultSettings[key];
        }

        return object;
    } catch (err) {
        if (err == FILE_NOT_FOUND) {
            const contents = JSON.stringify(defaultSettings);
            await storage.writeFileAsync(FILE, contents);

            return JSON.parse(contents);
        }

        throw err;
    }
}

/**
 * @param {import("platform/electron/storage").StorageImplElectron} storage
 */
export function saveSettings(storage, settings) {
    const contents = JSON.stringify(settings);
    return storage.writeFileAsync(FILE, contents);
}
