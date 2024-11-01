import * as pathread from "jsr:@std/path";
import { error } from "./errors.ts";
import Scanner from "./scanner.ts";
import { Token } from "./token.ts";
export default class Lox {

    private hadError: boolean = false;

    main(): void {
        if(Deno.args.length > 1) {
            console.log("Usage: lox [filename].lox");
            return;
        } else if (Deno.args.length == 1) {
            this.readFile(Deno.args[0]);
        } else {
            this.promptCheck();
        }
    }

    private readFile(path: string): void {
        const ext: string = pathread.extname(path);
        if(ext !== '.lox') {
            console.log("Usage: lox [filename].lox");
            return;
        }
        const decoder = new TextDecoder('utf-8');
        const bytes: Uint8Array = Deno.readFileSync(path);
        
        const buffer: string = decoder.decode(bytes);
        this.run(buffer);
        return;
    }

    private promptCheck(): void {
        let buffer: string = "";
        while(true) {
            const inputPrompt: string | null = prompt("> ");
            if(!inputPrompt) break;
            buffer += inputPrompt;
            buffer += '\n';
        }
        this.run(buffer);
        return;
    }

    private run(source: string): void {
        const scanner: Scanner = new Scanner(source);
        const tokens: Array<Token> = scanner.scanTokens();
        if(this.hadError) Deno.exit();
        for (const token of tokens) {
            console.log(token);
        }
        return;
    }

    errorRes(line: number, message: string) {
        error(line, message);
        this.hadError = true;
    }
}