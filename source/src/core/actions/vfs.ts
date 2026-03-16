"use server";

import fs from "fs/promises";
import path from "path";
import { auth } from "@/core/auth";

const ROOT_DIR = process.cwd();

/**
 * Validates that the requested path is within the project root
 */
function validatePath(targetPath: string) {
    const absolutePath = path.resolve(ROOT_DIR, targetPath);
    if (!absolutePath.startsWith(ROOT_DIR)) {
        throw new Error("VFS Access Denied: Path escape detected.");
    }
    return absolutePath;
}

/**
 * Lists contents of a directory
 */
export async function listVfsDirectory(dirPath: string = ".") {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    try {
        const absolutePath = validatePath(dirPath);
        const entries = await fs.readdir(absolutePath, { withFileTypes: true });

        return entries
            .filter(e => !e.name.startsWith(".") && e.name !== "node_modules")
            .map(e => ({
                name: e.name,
                isDirectory: e.isDirectory(),
                path: path.join(dirPath, e.name)
            }))
            .sort((a, b) => (b.isDirectory ? 1 : 0) - (a.isDirectory ? 1 : 0) || a.name.localeCompare(b.name));
    } catch (e) {
        console.error("VFS List Error:", e);
        return [];
    }
}

/**
 * Reads a file content
 */
export async function readVfsFile(filePath: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    try {
        const absolutePath = validatePath(filePath);
        const stats = await fs.stat(absolutePath);

        if (stats.size > 500 * 1024) {
            return "// ERROR: File too large to buffer (Max 512KB)";
        }

        const content = await fs.readFile(absolutePath, "utf-8");
        return content;
    } catch (e) {
        console.error("VFS Read Error:", e);
        return "// ERROR: Could not read file content.";
    }
}
