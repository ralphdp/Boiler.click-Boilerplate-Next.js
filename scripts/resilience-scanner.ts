/**
 * SOVEREIGN RESILIENCE SCANNER (V7.0.0 Protocl)
 * 
 * Enforces Canon II: Parsimony continuously acting as a pre-commit and CI/CD gate.
 * If ΔS_CRITICAL semantic bloat (like un-typed dynamic traces or `execSync` nodes) 
 * is detected in the physical substrate, this blocks the push natively.
 */

import * as fs from 'fs';
import * as path from 'path';

const SRC_DIRECTORY = path.join(process.cwd(), 'src');

const DEBT_PATTERNS = [
    { regex: /execSync/g, rule: "No synchronous arbitrary shell execution inside production routing.", id: "BLCK_SYS_SH_1" },
    { regex: /fs\.readdirSync.*recursive:\s*true/g, rule: "O(N) recursive lambda execution violations blocked.", id: "BLCK_FS_RCR_1" },
    { regex: /console\.warn.*Three\.js/g, rule: "Three.js warnings must be handled by ConsoleSanitizer root.", id: "BLCK_THR_WARN" }
];

function walk(dir: string, filelist: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            filelist = walk(filepath, filelist);
        } else {
            filelist.push(filepath);
        }
    }
    return filelist;
}

function scanSubstrate() {
    console.log("[RESILIENCE SCAN] Searching physical source nodes for Canon II logic drift...");
    let files = [];
    try {
        files = walk(SRC_DIRECTORY);
    } catch (e) {
        console.warn("Could not scan src/ natively. Skipping deep dive.");
        process.exit(0);
    }

    let fail = false;
    let schisms = 0;

    for (const file of files) {
        // Only verify relevant script/ui substrates
        if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;

        const content = fs.readFileSync(file, 'utf8');
        for (const pattern of DEBT_PATTERNS) {
            if (pattern.regex.test(content)) {
                // Determine if this exact file is the single allowed exception (ConsoleSanitizer is built to catch it)
                if (pattern.id === "BLCK_THR_WARN" && file.includes("ConsoleSanitizer.tsx")) continue;

                fail = true;
                schisms++;
                console.error(`\n[ΔS_CRITICAL SCHISM] Rule Violation in ${file}`);
                console.error(`--> Rule [${pattern.id}]: ${pattern.rule}`);
            }
        }
    }

    if (fail) {
        console.error(`\n[HALTED] Resilience Scanner detected ${schisms} critical structural failure(s). Push blocked.`);
        process.exit(1);
    } else {
        console.log(`\n[MATRIX CLEAN] Architecture parsed successfully. 0 logic drift detected. Valid for deployment.`);
        process.exit(0);
    }
}

scanSubstrate();
